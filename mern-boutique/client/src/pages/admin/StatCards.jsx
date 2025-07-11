import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCards = () => {
  const { isAuthenticated, user } = useContext(ShopContext);
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    pendingOrderCount: 0,
    userCount: 0,
    totalRevenue: 0,
    unreadMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      
      // Initialize stats with default values
      let dashboardStats = {
        productCount: 0,
        orderCount: 0,
        pendingOrderCount: 0,
        userCount: 0,
        totalRevenue: 0,
        unreadMessages: 0
      };
      
      try {
        // Fetch products count
        const productsRes = await axios.get('/api/products');
        const productsData = productsRes.data.products || productsRes.data;
        
        if (Array.isArray(productsData)) {
          dashboardStats.productCount = productsData.length;
        }
      } catch (error) {
        console.warn('Failed to fetch products count:', error.message);
      }
      
      try {
        // Fetch orders and calculate revenue
        const ordersRes = await axios.get('/api/orders');
        const ordersData = ordersRes.data.orders || ordersRes.data;
        
        if (Array.isArray(ordersData)) {
          dashboardStats.orderCount = ordersData.length;
          dashboardStats.pendingOrderCount = ordersData.filter(order => !order.isPaid).length;
          dashboardStats.totalRevenue = ordersData
            .filter(order => order.isPaid)
            .reduce((sum, order) => sum + order.totalPrice, 0);
        }
      } catch (error) {
        console.warn('Failed to fetch orders count:', error.message);
      }
      
      try {
        // Fetch users count
        const usersRes = await axios.get('/api/users');
        const usersData = usersRes.data.users || usersRes.data;
        
        if (Array.isArray(usersData)) {
          dashboardStats.userCount = usersData.length;
        }
      } catch (error) {
        console.warn('Failed to fetch users count:', error.message);
      }

      try {
        // Fetch messages to get unread count
        const messagesRes = await axios.get('/api/contact');
        if (Array.isArray(messagesRes.data)) {
          dashboardStats.unreadMessages = messagesRes.data.filter(msg => !msg.isRead).length;
        }
      } catch (error) {
        console.warn('Failed to fetch messages count:', error.message);
      }
      
      // Update state with all the data we've collected
      setStats(dashboardStats);
      setIsLoading(false); // Always set loading to false after all attempts
    };

    // Add a safety timeout to ensure loading state is turned off
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout

    if (isAuthenticated() && user?.isAdmin) {
      fetchDashboardStats();
    } else {
      setIsLoading(false);
    }
    
    return () => clearTimeout(loadingTimeout);
  }, [isAuthenticated, user]); // Remove isLoading from dependencies

  const formatCurrency = (num) => {
    return '$' + num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-500 text-sm font-semibold uppercase">Products</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-blue-200 rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.productCount}</h3>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/products" className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">
            View all products →
          </Link>
        </div>
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-500 text-sm font-semibold uppercase">Orders</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-green-200 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.orderCount}</h3>
                {stats.pendingOrderCount > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full mt-1">
                    {stats.pendingOrderCount} pending
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/orders" className="text-sm text-green-500 hover:text-green-700 cursor-pointer">
            View all orders →
          </Link>
        </div>
      </div>
      
      <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-500 text-sm font-semibold uppercase">Users</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-purple-200 rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.userCount}</h3>
            )}
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/users" className="text-sm text-purple-500 hover:text-purple-700 cursor-pointer">
            View all users →
          </Link>
        </div>
      </div>

      <div className="bg-primary/10 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary text-sm font-semibold uppercase">Messages</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-primary/20 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.unreadMessages}</h3>
                <span className="text-sm font-normal text-gray-500 ml-1">unread</span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="bg-primary/20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {stats.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {stats.unreadMessages}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/messages" className="text-sm text-primary hover:text-primary-dark cursor-pointer">
            View all messages →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatCards; 