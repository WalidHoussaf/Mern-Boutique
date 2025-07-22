import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useTranslation from '../utils/useTranslation';
import { useNotifications } from '../context/NotificationContext';

const PAYMENT_METHODS = {
  visa: {
    id: 'visa',
    name: 'Visa',
    icon: <img src="/visa-svg.svg" alt="Visa" className="h-8" />
  },
  mastercard: {
    id: 'mastercard',
    name: 'Mastercard',
    icon: <img src="/mastercard-svg.svg" alt="Mastercard" className="h-8" />
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: <img src="/paypal-svg.svg" alt="PayPal" className="h-8" />
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    icon: <img src="/stripe-svg.svg" alt="Stripe" className="h-8" />
  }
};

const Orders = () => {
  const { id: orderIdParam } = useParams();
  const { user, navigate, fetchUserOrders, getOrderById, updateOrderToPaid, orders: contextOrders, ordersLoading, clearCart } = useContext(ShopContext);
  const { refreshNotifications } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  // Add sorting options
  const [sortBy, setSortBy] = useState('latest');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sort orders based on selected option
  const getSortedOrders = () => {
    let filteredOrders = [...orders];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredOrders = filteredOrders.filter(order => {
        if (filterStatus === 'completed') return order.isPaid && order.isDelivered;
        if (filterStatus === 'processing') return order.isPaid && !order.isDelivered;
        if (filterStatus === 'pending') return !order.isPaid;
        return true;
      });
    }

    // Apply sorting
    return filteredOrders.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.totalPrice - a.totalPrice;
        case 'lowest':
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });
  };

  // First effect: Check authentication and load orders
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login?redirect=' + (orderIdParam ? `order/${orderIdParam}` : 'orders'));
      return;
    }

    // Set loading state
    setLoading(true);
    
    // Define an async function to fetch orders
    const loadOrders = async () => {
      try {
        const data = await fetchUserOrders();
        if (data) {  // Only update if we got data back
          setOrders(data);
          setError(null);
        }
      } catch (err) {
        setError(t('update_failed'));
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    // Call the function
    loadOrders();
    
    // Cleanup function to handle component unmount
    return () => {
      setLoading(false);
      setOrders([]);
    };
  }, [user, navigate, orderIdParam]); // Removed t from dependencies

  // Second effect: Load specific order if ID is in URL
  useEffect(() => {
    let isSubscribed = true; // For cleanup

    const loadOrderFromUrl = async () => {
      if (!orderIdParam || !user) return;
      
      setOrderDetailsLoading(true);
      try {
        const data = await getOrderById(orderIdParam);
        if (isSubscribed) { // Only update state if component is still mounted
          setSelectedOrder(data);
        }
      } catch (err) {
        if (isSubscribed) {
          toast.error(t('update_failed'));
          console.error('Error fetching order details:', err);
          // Navigate to orders list if order not found
          navigate('/orders');
        }
      } finally {
        if (isSubscribed) {
          setOrderDetailsLoading(false);
        }
      }
    };

    loadOrderFromUrl();

    // Cleanup function
    return () => {
      isSubscribed = false;
      setOrderDetailsLoading(false);
    };
  }, [orderIdParam, user, navigate]); // Removed t from dependencies

  // Use effect to update orders when context orders change
  useEffect(() => {
    if (!loading && contextOrders?.length > 0) {
      setOrders(contextOrders);
    }
  }, [contextOrders]); // Removed loading from dependencies

  // Check for Stripe success/canceled status
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');

    const handlePaymentStatus = async () => {
      // Remove the URL parameters first to prevent multiple triggers
      if ((success || canceled) && orderIdParam) {
        navigate(`/order/${orderIdParam}`, { replace: true });
      }

      if (success === 'true' && orderIdParam) {
        try {
          // Refresh order details
          const updatedOrder = await getOrderById(orderIdParam);
          setSelectedOrder(updatedOrder);
          
          // Check if this is the pending order and clear cart if it is
          const pendingOrderId = localStorage.getItem('pendingOrderId');
          if (pendingOrderId === orderIdParam) {
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('shippingInfo');
            clearCart();
          }

          // Show single success message
          toast.success(t('payment_success'));
          
          // Refresh data in a single batch
          await Promise.all([
            refreshNotifications(),
            fetchUserOrders().then(updatedOrders => {
              if (updatedOrders) {
                setOrders(updatedOrders);
              }
            })
          ]);

        } catch (error) {
          console.error('Error refreshing order:', error);
        }
      } else if (canceled === 'true') {
        // If payment was canceled, remove the pending order ID
        localStorage.removeItem('pendingOrderId');
        toast.error(t('payment_canceled'));
      }
    };

    if (success || canceled) {
      handlePaymentStatus();
    }
  }, [location.search, orderIdParam, navigate, getOrderById, fetchUserOrders, refreshNotifications, t, clearCart]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price with currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const handleOrderClick = async (orderId) => {
    if (selectedOrder && selectedOrder._id === orderId) {
      return;
    }
    navigate(`/order/${orderId}`);
  };

  const handleBackClick = () => {
    setSelectedOrder(null);
    navigate('/orders');
  };

  // Enhanced Status Badge component
  const StatusBadge = ({ isPaid, isDelivered }) => {
    const getStatusConfig = () => {
      if (isPaid && isDelivered) {
        return {
          color: 'bg-green-100 text-green-800 ring-green-600/20',
          icon: (
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: t('completed')
        };
      }
      if (isPaid) {
        return {
          color: 'bg-blue-100 text-blue-800 ring-blue-600/20',
          icon: (
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: t('processing')
        };
      }
      return {
        color: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        icon: (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: t('pending')
      };
    };

    const config = getStatusConfig();
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const handlePaymentMethodRedirect = async (order) => {
    if (!order) return;
    
    setPaymentProcessing(true);
    try {
      const paymentResult = {
        id: `${order.paymentMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payment_method: order.paymentMethod,
        email_address: user?.email || ''
      };
      
      const updatedOrder = await updateOrderToPaid(order._id, paymentResult);
      setSelectedOrder(updatedOrder);
      
      toast.success(t('payment_success')); // Restore the success toast
      await refreshNotifications(); // Update system notifications
      await fetchUserOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || t('payment_failed'));
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading || orderDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('error')}</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="group flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('back_to_orders')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      {t('order_details')}
                    </h1>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="font-mono">{selectedOrder._id}</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    isPaid={selectedOrder.isPaid}
                    isDelivered={selectedOrder.isDelivered}
                  />
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-100 pt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {t('order_items')}
                  </h2>
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item._id} className="flex items-center py-6 gap-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {t('quantity')}: {item.qty}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.qty)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatPrice(item.price)} {t('each')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-100 pt-8 mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('shipping_address')}
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6 text-gray-600 space-y-2">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phoneNumber && (
                      <p className="flex items-center mt-3 pt-3 border-t border-gray-200">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedOrder.shippingAddress.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100 sticky top-20">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('order_summary')}
                </h2>

                {/* Order details */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(selectedOrder.totalPrice - selectedOrder.taxPrice - selectedOrder.shippingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('tax')}:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.taxPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}:</span>
                    <span className="text-gray-900">
                      {selectedOrder.shippingPrice === 0 ? t('free') : formatPrice(selectedOrder.shippingPrice)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{t('total_amount')}:</span>
                      <span className="font-bold text-primary">{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">{t('payment_method')}</h3>
                  <div className="flex items-center p-4 border rounded-lg bg-gray-50/50">
                    {PAYMENT_METHODS[selectedOrder.paymentMethod]?.icon}
                    <span className="ml-3 font-medium text-gray-900">
                      {PAYMENT_METHODS[selectedOrder.paymentMethod]?.name}
                    </span>
                  </div>
                </div>

                {/* Payment Action Button */}
                {!selectedOrder.isPaid && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePaymentMethodRedirect(selectedOrder)}
                    disabled={paymentProcessing}
                    className="w-full mt-8 py-4 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dark hover:shadow transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {paymentProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {t('complete_payment')}
                      </>
                    )}
                  </motion.button>
                )}

                {/* Secure payment indicator */}
                <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('secure_checkout')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-prata text-secondary mb-4">{t('my_orders')}</h1>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">
            {t('welcome_back_name', { name: user?.name })}
          </p>
        </div>

        {/* Filters and Sorting */}
        {orders.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border-gray-200 text-gray-600 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="all">{t('all_orders')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="processing">{t('processing')}</option>
                <option value="pending">{t('pending')}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border-gray-200 text-gray-600 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="latest">{t('newest_first')}</option>
                <option value="oldest">{t('oldest_first')}</option>
                <option value="highest">{t('price_high_to_low')}</option>
                <option value="lowest">{t('price_low_to_high')}</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {getSortedOrders().length} {t('orders_found')}
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_orders')}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('no_orders_desc')}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/collection')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t('start_shopping')}
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {getSortedOrders().map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => handleOrderClick(order._id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">{t('order_number')}</p>
                    <p className="font-mono text-sm text-gray-900">{order._id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">{t('order_date')}</p>
                    <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">{t('total')}</p>
                    <p className="text-sm font-medium text-gray-900">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div>
                    <StatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      className="text-primary hover:text-primary-dark transition-colors flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order._id);
                      }}
                    >
                      {t('view_details')}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 