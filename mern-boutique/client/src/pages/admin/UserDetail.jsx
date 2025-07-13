import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import useTranslation from '../../utils/useTranslation';

const UserDetail = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isAdmin: false
  });

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!isAuthenticated() || !currentUser?.isAdmin) {
      navigate('/login?redirect=/admin/users');
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          isAdmin: response.data.isAdmin
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error(t('failed_load_user'));
        navigate('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, isAuthenticated, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await axios.put(`/api/users/${userId}`, formData);
      // Update the full user object with the response data
      setUser(response.data);
      toast.success(t('user_updated'));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || t('failed_update_user'));
    } finally {
      setIsSaving(false);
    }
  };

  const refreshUserStats = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data);
      toast.success(t('user_statistics_refreshed'));
    } catch (error) {
      console.error('Error refreshing user stats:', error);
      toast.error(t('failed_refresh_stats'));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{t('user_details')}</h2>
        <button 
          onClick={() => navigate('/admin/users')}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          {t('back_to_users')}
        </button>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile Image */}
            <div className="md:col-span-2 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden mb-4">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {t('user_id')}: {user?._id}
              </div>
              <div className="text-sm text-gray-500">
                {t('joined')}: {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            {/* Admin Status */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={user?._id === currentUser?._id} // Prevent changing own admin status
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                  {t('admin_privileges')}
                </label>
              </div>
              {user?._id === currentUser?._id && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('cannot_change_own_status')}
                </p>
              )}
            </div>
          </div>
          
          {/* Order Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">{t('user_statistics')}</h3>
              <button 
                type="button"
                onClick={refreshUserStats}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('refreshing')}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('refresh')}
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">{t('total_orders')}</div>
                <div className="text-xl font-bold text-gray-800">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    user?.orderCount || 0
                  )}
                </div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">{t('total_spent')}</div>
                <div className="text-xl font-bold text-gray-800">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    `$${(user?.totalSpent || 0).toFixed(2)}`
                  )}
                </div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">{t('last_order')}</div>
                <div className="text-xl font-bold text-gray-800">
                  {isLoading ? (
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    user?.lastOrderDate 
                      ? new Date(user.lastOrderDate).toLocaleDateString() 
                      : t('never')
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('saving')}
                </div>
              ) : t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail; 