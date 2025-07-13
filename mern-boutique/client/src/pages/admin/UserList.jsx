import { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackToDashboard from '../../components/BackToDashboard';
import useTranslation from '../../utils/useTranslation';

const UserList = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(ShopContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userToToggleAdmin, setUserToToggleAdmin] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (roleFilter !== 'all') count++;
    return count;
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('failed_load_users'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated() && user?.isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      toast.success(t('user_deleted'));
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Display the specific error message from the server if available
      const errorMessage = error.response?.data?.message || 
        t('failed_delete_user');
      
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const confirmToggleAdmin = (user) => {
    setUserToToggleAdmin(user);
    setShowAdminModal(true);
  };

  const handleToggleAdmin = async () => {
    if (!userToToggleAdmin) return;
    
    try {
      const response = await axios.put(`/api/users/${userToToggleAdmin._id}`, {
        ...userToToggleAdmin,
        isAdmin: !userToToggleAdmin.isAdmin
      });
      
      setUsers(users.map(u => 
        u._id === userToToggleAdmin._id ? response.data : u
      ));
      
      toast.success(response.data.isAdmin ? t('user_promoted') : t('user_removed_admin'));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || t('failed_update_user'));
    } finally {
      setShowAdminModal(false);
      setUserToToggleAdmin(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(u => 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === 'all' || 
       (roleFilter === 'admin' && u.isAdmin) || 
       (roleFilter === 'customer' && !u.isAdmin))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortField === 'role') {
        comparison = a.isAdmin === b.isAdmin ? 0 : a.isAdmin ? 1 : -1;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <BackToDashboard />
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {t('user_management')}
            </h2>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {filteredUsers.length} {filteredUsers.length === 1 ? t('user_found') : t('users_found')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={t('search_users')}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={toggleFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                {t('filters')}
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-1.5 flex items-center justify-center h-5 w-5 bg-primary text-white text-xs font-medium rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              
              {showFilters && (
                <div 
                  ref={filterRef}
                  className="fixed sm:absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-scaleIn origin-top-right" 
                  style={{ 
                    maxHeight: '80vh', 
                    overflowY: 'auto',
                    top: isMobile ? '50%' : 'auto',
                    left: isMobile ? '50%' : 'auto',
                    transform: isMobile ? 'translate(-50%, -50%)' : 'none'
                  }}
                >
                  <div className="p-3">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        {t('filter_options')}
                      </span>
                      <button 
                        onClick={toggleFilters}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100">
                        <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('user_role')}
                        </label>
                        <div className="inline-flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setRoleFilter('all');
                              setShowFilters(false);
                            }}
                            className={`min-w-fit whitespace-nowrap py-2 px-3 text-sm rounded-md border ${
                              roleFilter === 'all' 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {t('all')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRoleFilter('admin');
                              setShowFilters(false);
                            }}
                            className={`min-w-fit whitespace-nowrap py-2 px-3 text-sm rounded-md border ${
                              roleFilter === 'admin' 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {t('admins')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRoleFilter('customer');
                              setShowFilters(false);
                            }}
                            className={`min-w-fit whitespace-nowrap py-2 px-3 text-sm rounded-md border ${
                              roleFilter === 'customer' 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {t('customers')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-5 transform -translate-y-2 rotate-45 w-3 h-3 bg-white border-t border-l border-gray-200"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <p className="text-gray-500 font-medium">{t('loading_users')}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">{t('no_users_found')}</h3>
            <p className="text-gray-500">{t('no_users_found_desc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {getActiveFiltersCount() > 0 && (
              <div className="bg-blue-50 border-y border-blue-100 px-6 py-2 text-sm text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t('showing_filtered_results')}
                  {roleFilter !== 'all' && (
                    <span className="font-medium ml-1">
                      {roleFilter === 'admin' ? t('admin_users_only') : t('customer_users_only')}
                    </span>
                  )}
                </span>
                <button 
                  onClick={() => {
                    setRoleFilter('all');
                    setSearchTerm('');
                  }}
                  className="ml-auto text-blue-700 hover:text-blue-900 font-medium flex items-center"
                >
                  {t('clear_filters')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      {t('user')}
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      {t('joined')}
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      {t('role')}
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                          {u.profileImage ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover" 
                              src={u.profileImage}
                              alt={u.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center bg-primary text-white font-semibold text-lg rounded-full">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                          >
                            {u.name}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(u.createdAt)}</div>
                      <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        u.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.isAdmin ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('admin')}
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {t('customer')}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/admin/users/${u._id}`)}
                          className="flex items-center text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {t('view')}
                        </button>
                        <button
                          onClick={() => confirmToggleAdmin(u)}
                          className={`flex items-center ${
                            u.isAdmin ? 'text-yellow-600 hover:text-yellow-900' : 'text-purple-600 hover:text-purple-900'
                          } cursor-pointer transition-colors`}
                          disabled={u._id === user?._id}
                          title={u._id === user?._id ? t('cannot_change_own_status') : ""}
                        >
                          {u.isAdmin ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              {t('revoke')}
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                              {t('promote')}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => confirmDelete(u)}
                          className="flex items-center text-red-600 hover:text-red-900 cursor-pointer transition-colors"
                          disabled={u._id === user?._id}
                          title={u._id === user?._id ? t('cannot_delete_yourself') : ""}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('confirm_user_deletion')}</h3>
                <p className="text-gray-600 mb-6 text-center">
                  {t('confirm_user_deletion_desc').replace('{userName}', userToDelete?.name)}
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                      deleteLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('deleting')}
                      </div>
                    ) : t('delete_user')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Toggle Confirmation Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAdminModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('confirm_role_change')}</h3>
                <p className="text-gray-600 mb-6 text-center">
                  {t('confirm_role_change_desc')
                    .replace('{action}', userToToggleAdmin?.isAdmin ? t('remove_admin_privileges') : t('grant_admin_privileges'))
                    .replace('{userName}', userToToggleAdmin?.name)}
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                    onClick={() => setShowAdminModal(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    onClick={handleToggleAdmin}
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;