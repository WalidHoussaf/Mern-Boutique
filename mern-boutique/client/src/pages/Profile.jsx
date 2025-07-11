import { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import logoutIcon from '../assets/logout.png'; // Import the logout icon

const Profile = () => {
  const { user, login, logout, isAuthenticated, navigate } = useContext(ShopContext);
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
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
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
      toast.error('Name is required');
      return false;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation - only if trying to change it
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
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
        toast.success('Profile updated successfully');
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
      let errorMessage = 'Failed to update profile';

      if (error.response) {
        errorMessage = error.response.data.message || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Default profile avatar if no image is provided
  const defaultAvatar = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );

  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-center">
          <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 mx-auto bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Top-right decorative circle */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary opacity-5 rounded-full"></div>
        
        {/* Bottom-left decorative circle */}
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-secondary opacity-5 rounded-full"></div>
        
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute h-full w-full pattern-dots pattern-gray-500 pattern-size-2 pattern-opacity-20"></div>
        </div>
        
        {/* Small floating elements - only visible on larger screens */}
        <div className="hidden md:block">
          <div className="absolute top-[15%] right-[20%] w-6 h-6 bg-primary opacity-20 rounded-full animate-pulse"></div>
          <div className="absolute top-[30%] left-[15%] w-4 h-4 bg-secondary opacity-20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-[25%] right-[30%] w-5 h-5 bg-primary opacity-20 rounded-md animate-pulse" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-[15%] left-[25%] w-3 h-3 bg-secondary opacity-20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="font-prata text-4xl text-secondary mb-2">My Account</h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            View and manage your account details
          </p>
        </div>

        {/* Account Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => navigate('/orders')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            My Orders
          </button>
          <button 
            onClick={() => navigate('/wishlist')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            My Wishlist
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Settings
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all animate-fadeIn">
          {/* Card Header with Gradient */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-secondary"></div>

          <div className="px-8 py-10">
            {/* Profile Title */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Personal Information
              </h2>
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Upload Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        defaultAvatar
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <p className="mt-2 text-sm text-gray-500">Click to change your profile picture</p>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                      required
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                      required
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full relative py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-95 transition-all shadow-md ${
                    isLoading ? 'opacity-80 cursor-wait' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Profile...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Save Changes
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      defaultAvatar
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Full Name</div>
                    <div className="text-lg font-medium">{user.name}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Email Address</div>
                    <div className="text-lg font-medium">{user.email}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Account Type</div>
                    <div className="text-lg font-medium">
                      {user.isAdmin ? (
                        <span className="text-red-600">Administrator</span>
                      ) : (
                        <span>Customer</span>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Member Since</div>
                    <div className="text-lg font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Account Actions</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/orders')}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      My Orders
                    </button>
                    <button
                      onClick={() => navigate('/wishlist')}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Wishlist
                    </button>
                  </div>
                  <button
                    onClick={logout}
                    className="mt-4 w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <img src={logoutIcon} alt="Logout" className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 