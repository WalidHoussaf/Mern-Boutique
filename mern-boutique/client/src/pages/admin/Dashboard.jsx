import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardOverview from './DashboardOverview';
import StatCards from './StatCards';
import axios from 'axios';
import useTranslation from '../../utils/useTranslation';
import './AdminButtons.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!isAuthenticated() || !user?.isAdmin) {
      navigate('/login?redirect=/admin/dashboard');
      return;
    }

    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('/products')) {
      setActiveTab('products');
    } else if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/orders')) {
      setActiveTab('orders');
    } else if (path.includes('/messages')) {
      setActiveTab('messages');
    } else {
      setActiveTab('overview');
    }

    // Fetch unread messages count
    fetchUnreadMessages();
  }, [isAuthenticated, user, navigate, location.pathname]);

  const fetchUnreadMessages = async () => {
    try {
      const { data } = await axios.get('/api/contact');
      const unreadCount = data.filter(msg => !msg.isRead).length;
      setUnreadMessages(unreadCount);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">{t('admin_dashboard')}</h1>
        
        {/* Welcome message */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700">{t('welcome_admin').replace('{name}', user?.name || '')}</h2>
        </div>
        
        {/* Admin navigation tabs */}
        <nav className="flex border-b border-gray-200 mb-6">
          <Link 
            to="/admin/dashboard" 
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            } cursor-pointer`}
            onClick={() => setActiveTab('overview')}
          >
            {t('overview')}
          </Link>
          <Link 
            to="/admin/products" 
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'products' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            } cursor-pointer`}
            onClick={() => setActiveTab('products')}
          >
            {t('products')}
          </Link>
          <Link 
            to="/admin/orders" 
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'orders' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            } cursor-pointer`}
            onClick={() => setActiveTab('orders')}
          >
            {t('orders')}
          </Link>
          <Link 
            to="/admin/users" 
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'users' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            } cursor-pointer`}
            onClick={() => setActiveTab('users')}
          >
            {t('users')}
          </Link>
          <Link 
            to="/admin/messages" 
            className={`py-4 px-6 font-medium text-sm relative ${
              activeTab === 'messages' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            } cursor-pointer`}
            onClick={() => setActiveTab('messages')}
          >
            {t('messages')}
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {unreadMessages}
              </span>
            )}
          </Link>
        </nav>
        
        {/* Dashboard content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatCards />
          <DashboardOverview />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 