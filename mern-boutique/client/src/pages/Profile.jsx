import { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import useTranslation from '../utils/useTranslation';
import UserAvatar from '../components/UserAvatar';

const Profile = () => {
  const { user, login, logout, isAuthenticated, navigate, language } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formFocus, setFormFocus] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    location: '',
  });
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [userStats, setUserStats] = useState({
    orderCount: 0,
    totalSpent: 0,
    lastOrderDate: null
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);

  // Load user data and stats
  useEffect(() => {
    let timeoutId;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user's orders with timeout
        const ordersResponse = await axios.get('/api/orders/myorders', {
          timeout: 10000 // 10 second timeout
        });
        const orders = ordersResponse.data;

        // Calculate statistics
        const stats = {
          orderCount: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + (order.isPaid ? order.totalPrice : 0), 0),
          lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
        };

        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // If request was aborted and we haven't exceeded retries, try again
        if (error.code === 'ECONNABORTED' && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying fetch (${retryCount}/${MAX_RETRIES})...`);
          timeoutId = setTimeout(fetchUserData, 1000 * retryCount); // Exponential backoff
          return;
        }
        
        toast.error(t('error_loading_data'));
      }
    };

    // Add a small delay before first fetch to allow auth to initialize
    timeoutId = setTimeout(fetchUserData, 100);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, t]);

  // Load user form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        profession: user.profession || '',
        location: user.location || '',
      });
      
      // Set profile image if user has one
      if (user.profileImage) {
        setPreviewImage(user.profileImage);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    // Reset form data when switching to edit mode
    if (!isEditing && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        profession: user.profession || '',
        location: user.location || '',
      });
      setProfileImage(null);
      if (user.profileImage) {
        setPreviewImage(user.profileImage);
      } else {
        setPreviewImage(null);
      }
    }
  };

  const handleFocus = (field) => {
    setFormFocus(field);
  };

  const handleBlur = () => {
    setFormFocus('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      toast.error(t('enter_name'));
      return false;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error(t('invalid_email'));
      return false;
    }

    // Password validation - only if trying to change it
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error(t('password_too_short'));
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error(t('passwords_not_match'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create form data for multipart/form-data to handle file upload
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('profession', formData.profession);
      formDataObj.append('location', formData.location);
      
      if (formData.password) {
        formDataObj.append('password', formData.password);
      }
      
      if (profileImage) {
        formDataObj.append('profileImage', profileImage);
      }
      
      // Use axios with multipart/form-data
      const response = await axios.put('/api/users/profile', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data) {
        // Update user context
        login(response.data);
        toast.success(t('profile_updated'));
        setIsEditing(false);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        // Reset profile image state
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      let errorMessage = t('update_failed');

      if (error.response) {
        errorMessage = error.response.data.message || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = t('server_error');
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeletingAccount(true);
    try {
      await axios.delete('/api/users/profile');
      toast.success(t('account_deleted_success'));
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('orders')) {
            // User has orders and cannot be deleted
            toast.error(t('cannot_delete_with_orders'));
          } else if (error.response.data?.message?.includes('Admin')) {
            // Admin account cannot be deleted
            toast.error(t('cannot_delete_admin'));
          } else {
            // Other 400 errors
            toast.error(error.response.data?.message || t('account_deletion_failed'));
          }
        } else if (error.response.status === 404) {
          // User not found
          toast.error(t('user_not_found'));
          logout();
          navigate('/login');
        } else {
          // Other error with response
          toast.error(error.response.data?.message || t('account_deletion_failed'));
        }
      } else if (error.request) {
        // Network error
        toast.error(t('server_error'));
      } else {
        // Other errors
        toast.error(t('account_deletion_failed'));
      }
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  // Default profile avatar if no image is provided
  const defaultAvatar = (
    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <span className="text-4xl font-semibold text-primary">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
        {isEditing && (
          <span className="mt-1 text-sm text-primary/70">
            {t('add_photo')}
          </span>
        )}
      </div>
    </div>
  );

  // Loading state UI
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-pulse space-y-6 text-center">
          <div className="h-24 w-24 mx-auto bg-gray-200 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-4 w-48 mx-auto bg-gray-200 rounded"></div>
            <div className="h-3 w-32 mx-auto bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">{t('my_account')}</h1>
            <button
              onClick={logout}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="mr-2">{t('logout')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center">
                <UserAvatar
                  user={{ ...user, profileImage: previewImage }}
                  isEditing={isEditing}
                  onEdit={triggerFileInput}
                  t={t}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label={t('upload_photo')}
                />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {t('member_since')} {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : t('unknown_date')}
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  {t('total_orders')}: {userStats.orderCount}
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {t('total_spent')}: ${userStats.totalSpent.toFixed(2)}
                </div>

                {userStats.lastOrderDate && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {t('last_order')}: {new Date(userStats.lastOrderDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={toggleEditMode}
                  className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  {t('edit_profile')}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('full_name')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg shadow-sm py-3 px-4 ${
                          isEditing
                            ? 'border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50'
                            : 'border-transparent bg-gray-50'
                        } ${formFocus === 'name' ? 'border-primary ring ring-primary ring-opacity-50' : ''}`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email_address')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg shadow-sm py-3 px-4 ${
                          isEditing
                            ? 'border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50'
                            : 'border-transparent bg-gray-50'
                        } ${formFocus === 'email' ? 'border-primary ring ring-primary ring-opacity-50' : ''}`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profession')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        disabled={!isEditing}
                        onFocus={() => handleFocus('profession')}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg shadow-sm py-3 px-4 ${
                          isEditing
                            ? 'border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50'
                            : 'border-transparent bg-gray-50'
                        } ${formFocus === 'profession' ? 'border-primary ring ring-primary ring-opacity-50' : ''}`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('location')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        onFocus={() => handleFocus('location')}
                        onBlur={handleBlur}
                        className={`block w-full rounded-lg shadow-sm py-3 px-4 ${
                          isEditing
                            ? 'border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50'
                            : 'border-transparent bg-gray-50'
                        } ${formFocus === 'location' ? 'border-primary ring ring-primary ring-opacity-50' : ''}`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-gray-50 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900">{t('change_password')}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{t('change_password_description')}</p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          {t('new_password')}
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d={showPassword ? "M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" : "M10 12a2 2 0 100-4 2 2 0 000 4z"} />
                              <path d={showPassword ? "M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" : "M10 4C5.522 4 1.732 6.943.458 11c1.274 4.057 5.064 7 9.542 7s8.268-2.943 9.542-7c-1.274-4.057-5.064-7-9.542-7zm0 11c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"} />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          {t('confirm_new_password')}
                        </label>
                        <div className="mt-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isLoading ? t('saving_changes') : t('save_changes')}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-red-600">{t('delete_account')}</h3>
                  <p className="mt-2 text-sm text-gray-500">{t('delete_account_warning')}</p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {showDeleteConfirm ? (
                      <>
                        <button
                          onClick={handleDeleteAccount}
                          className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                          disabled={isDeletingAccount}
                        >
                          {isDeletingAccount && (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isDeletingAccount ? t('deleting_account') : t('confirm_delete')}
                        </button>
                        <button
                          onClick={cancelDeleteAccount}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                          disabled={isDeletingAccount}
                        >
                          {t('cancel')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {t('delete_account')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 