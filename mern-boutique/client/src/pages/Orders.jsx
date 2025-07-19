import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import useTranslation from '../utils/useTranslation';
import { useNotifications } from '../context/NotificationContext';

const Orders = () => {
  const { id: orderIdParam } = useParams();
  const { user, navigate, fetchUserOrders, getOrderById, updateOrderToPaid, orders: contextOrders, ordersLoading } = useContext(ShopContext);
  const { refreshNotifications } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv: ''
  });
  const { t } = useTranslation();

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOrderClick = async (orderId) => {
    if (selectedOrder && selectedOrder._id === orderId) {
      return; // Already selected
    }
    
    // Update URL without full page reload
    navigate(`/order/${orderId}`);
  };

  const handleBackClick = () => {
    setSelectedOrder(null);
    navigate('/orders');
  };

  // Display status badges
  const StatusBadge = ({ isPaid, isDelivered }) => {
    const getStatusColor = () => {
      if (isPaid && isDelivered) return 'bg-green-100 text-green-800';
      if (isPaid) return 'bg-blue-100 text-blue-800';
      return 'bg-red-100 text-red-800';
    };

    const getStatusText = () => {
      if (isPaid && isDelivered) return t('completed');
      if (isPaid) return t('paid_processing');
      return t('payment_pending');
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  };

  const handleCashPayment = async () => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);
    
    try {
      // Create a payment result for cash payment
      const paymentResult = {
        id: 'CASH-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'PENDING',
        update_time: new Date().toISOString(),
        payment_method: 'cash',
        payer: {
          email_address: user?.email || 'customer@example.com'
        }
      };
      
      // Update the order to paid status
      const updatedOrder = await updateOrderToPaid(selectedOrder._id, paymentResult);
      
      // Update the selected order in the UI
      setSelectedOrder(updatedOrder);
      
      // Show success message
      toast.success(t('payment_update_success'));
      
      // Refresh notifications to show the server notification immediately
      await refreshNotifications();
      
      // Refresh orders list
      await refreshOrdersList();
    } catch (error) {
      console.error('Error processing cash payment:', error);
      let errorMessage = t('payment_update_failed');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePayNow = () => {
    if (!selectedOrder) return;
    
    if (selectedOrder.paymentMethod === 'cash') {
      handleCashPayment();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentInfo({
      cardNumber: '',
      expirationDate: '',
      cvv: ''
    });
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpirationDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      // Only allow digits and format with spaces
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // 16 digits + 3 spaces
    } else if (name === 'expirationDate') {
      // Only allow digits and format as MM/YY
      formattedValue = value.replace(/\D/g, '')
        .replace(/^(\d{2})/, '$1/')
        .slice(0, 5);
    } else if (name === 'cvv') {
      // Only allow digits and limit to 4 characters
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentInfo(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Create a local function to fetch orders without relying on context state updates
  const refreshOrdersList = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axios.get('/api/orders/myorders');
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast.error(t('update_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (paymentProcessing) return;

    // Validate payment info before processing
    const validationErrors = validatePaymentInfo();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      // Create payment result object
      const paymentResult = {
        id: paymentInfo.cardNumber.replace(/\s/g, '').slice(-4), // Last 4 digits
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payment_method: 'credit',
        payer: {
          email_address: user?.email || ''
        }
      };
      
      // Update the order to paid status
      const updatedOrder = await updateOrderToPaid(selectedOrder._id, paymentResult);
      
      // Update the selected order in the UI
      setSelectedOrder(updatedOrder);
      
      // Close payment modal
      handleClosePaymentModal();
      
      // Show success message
      toast.success(t('payment_success'));
      
      // Refresh notifications to show the server notification immediately
      await refreshNotifications();
      
      // Refresh orders list
      await refreshOrdersList();
    } catch (error) {
      console.error('Error processing payment:', error);
      let errorMessage = t('payment_failed');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Validate payment info
  const validatePaymentInfo = () => {
    const errors = [];
    
    // Card number validation (Luhn algorithm)
    const cardNumberDigits = paymentInfo.cardNumber.replace(/\s/g, '');
    if (!isValidCreditCard(cardNumberDigits)) {
      errors.push(t('invalid_card_number'));
    }
    
    // Expiration date validation (MM/YY format)
    const expirationDate = paymentInfo.expirationDate;
    if (!isValidExpirationDate(expirationDate)) {
      errors.push(t('invalid_expiration_date'));
    }
    
    // CVV validation (3 or 4 digits)
    if (!isValidCVV(paymentInfo.cvv)) {
      errors.push(t('invalid_cvv'));
    }
    
    return errors;
  };

  // Credit card number validation - simple 16 digit check
  const isValidCreditCard = (number) => {
    return /^\d{16}$/.test(number);
  };

  // Expiration date validation
  const isValidExpirationDate = (expDate) => {
    // Check format
    if (!/^\d{2}\/\d{2}$/.test(expDate)) return false;
    
    const [month, year] = expDate.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    // Validate month
    if (month < 1 || month > 12) return false;
    
    // Validate year
    if (year < currentYear) return false;
    
    // If it's the current year, make sure the month hasn't passed
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  // CVV validation
  const isValidCVV = (cvv) => {
    // CVV should be 3 or 4 digits
    return /^\d{3,4}$/.test(cvv);
  };

  // If loading, show loading state
  if (loading || ordersLoading) {
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

  // If no orders, show empty state
  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-semibold mb-2">{t('no_orders')}</h2>
        <p className="text-gray-600 mb-4">{t('no_orders_desc')}</p>
        <Link
          to="/collection"
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          {t('start_shopping')}
        </Link>
      </div>
    );
  }

  // If an order is selected, show order details
  if (selectedOrder) {
    if (orderDetailsLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-pulse text-center">
            <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 mx-auto bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 mx-auto bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-4">
        <button
          onClick={handleBackClick}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back_to_orders')}
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{t('order_details')}</h2>
            <StatusBadge isPaid={selectedOrder.isPaid} isDelivered={selectedOrder.isDelivered} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">{t('order_number')}</h3>
              <p className="text-gray-600">{selectedOrder._id}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('order_date')}</h3>
              <p className="text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('payment_method')}</h3>
              <p className="text-gray-600">
                {selectedOrder.paymentMethod === 'cash' ? t('cash_on_delivery') : t('credit_card')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('order_total')}</h3>
              <p className="text-gray-600">${selectedOrder.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">{t('order_items')}</h3>
            <div className="space-y-4">
              {selectedOrder.orderItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-600">
                        {t('quantity')}: {item.qty} × ${item.price}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.qty * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {!selectedOrder.isPaid && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePayNow}
                disabled={paymentProcessing}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {paymentProcessing ? t('processing_payment') : t('pay_now')}
              </button>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">{t('payment_details')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('card_number')}
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-md"
                    maxLength="19"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expiration_date')}
                    </label>
                    <input
                      type="text"
                      name="expirationDate"
                      value={paymentInfo.expirationDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border rounded-md"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cvv')}
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-md"
                      maxLength="4"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={handleClosePaymentModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={paymentProcessing}
                    className={`bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors ${
                      paymentProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing_payment')}
                      </span>
                    ) : t('process_payment')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show orders list
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">{t('order_history')}</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('order_number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('order_date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('order_total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('order_status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('view_details')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleOrderClick(order._id)}
                      className="text-primary hover:text-primary-dark"
                    >
                      {t('view_details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders; 