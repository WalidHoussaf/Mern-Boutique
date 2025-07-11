import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const { id: orderIdParam } = useParams();
  const { user, navigate, fetchUserOrders, getOrderById, updateOrderToPaid, orders: contextOrders, ordersLoading } = useContext(ShopContext);
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
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to load your orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    // Call the function
    loadOrders();
    
    // Remove fetchUserOrders from dependency array to prevent infinite loops
  }, [user, navigate, orderIdParam]);

  // Second effect: Load specific order if ID is in URL
  useEffect(() => {
    const loadOrderFromUrl = async () => {
      if (!orderIdParam || !user) return;
      
      setOrderDetailsLoading(true);
      try {
        const data = await getOrderById(orderIdParam);
        setSelectedOrder(data);
      } catch (err) {
        toast.error('Failed to load order details');
        console.error('Error fetching order details:', err);
        // Navigate to orders list if order not found
        navigate('/orders');
      } finally {
        setOrderDetailsLoading(false);
      }
    };

    loadOrderFromUrl();
    // Remove getOrderById from dependency array to prevent infinite loops
  }, [orderIdParam, user, navigate]);

  // Use effect to update orders when context orders change
  useEffect(() => {
    if (contextOrders && contextOrders.length > 0 && !loading) {
      setOrders(contextOrders);
    }
  }, [contextOrders, loading]);

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
    
    // No need to fetch the order here as the useEffect will handle it when orderIdParam changes
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
      if (isPaid && isDelivered) return 'Completed';
      if (isPaid) return 'Paid & Processing';
      return 'Payment Pending';
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
      
      // Display success message
      toast.success('Order confirmed for cash payment on delivery!');
      
      // Refresh orders list
      await refreshOrdersList();
    } catch (error) {
      console.error('Error processing cash payment:', error);
      let errorMessage = 'Failed to confirm cash payment. Please try again.';
      
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
      formattedValue = formatCardNumber(value);
    } else if (name === 'expirationDate') {
      formattedValue = formatExpirationDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
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
      // Don't set error state or show toast here, as this might be called in the background
    } finally {
      setLoading(false);
    }
  };

  // Update the handlePaymentSubmit function to use this local function
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!paymentInfo.cardNumber.trim() || !paymentInfo.expirationDate.trim() || !paymentInfo.cvv.trim()) {
      toast.error('Please fill in all payment fields');
      return;
    }

    // Check if we have a selected order
    if (!selectedOrder || !selectedOrder._id) {
      toast.error('No order selected');
      setShowPaymentModal(false);
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      // Create a payment result object (in a real app, this would come from a payment processor like PayPal or Stripe)
      const paymentResult = {
        id: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: {
          email_address: user?.email || 'customer@example.com'
        }
      };
      
      // Update the order to paid status
      const updatedOrder = await updateOrderToPaid(selectedOrder._id, paymentResult);
      
      // Update the selected order in the UI
      setSelectedOrder(updatedOrder);
      
      // Close the payment modal
      setShowPaymentModal(false);
      
      // Display success message
      toast.success('Payment processed successfully!');
      
      // Manually fetch user orders again to refresh the list
      try {
        await refreshOrdersList();
      } catch (refreshError) {
        console.error('Failed to refresh orders after payment:', refreshError);
        // Don't throw this error as the payment itself was successful
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 bg-white rounded-lg shadow-sm p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm p-8">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium text-center mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white rounded-lg shadow-sm p-8">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
        <p className="text-gray-500 text-center mb-6">You haven't placed any orders yet.</p>
        <Link 
          to="/shop" 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // If a specific order is selected, show the order detail view
  if (selectedOrder) {
    return (
      <div className="py-8 max-w-6xl mx-auto">
        <button
          onClick={handleBackClick}
          className="flex items-center text-primary hover:text-primary/80 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </button>
        
        {orderDetailsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Order #{selectedOrder._id}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
                <StatusBadge 
                  isPaid={selectedOrder.isPaid} 
                  isDelivered={selectedOrder.isDelivered} 
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Order Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Order Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Payment</span>
                        <span className={selectedOrder.isPaid ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                          {selectedOrder.isPaid ? 'Paid' : 'Not Paid'}
                        </span>
                      </div>
                      {selectedOrder.isPaid && (
                        <div className="text-xs text-gray-500">
                          Paid on {formatDate(selectedOrder.paidAt)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Delivery</span>
                        <span className={selectedOrder.isDelivered ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                          {selectedOrder.isDelivered ? 'Delivered' : 'In Transit'}
                        </span>
                      </div>
                      {selectedOrder.isDelivered && (
                        <div className="text-xs text-gray-500">
                          Delivered on {formatDate(selectedOrder.deliveredAt)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-800 capitalize">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Shipping Information</h3>
                  <div className="mb-4">
                    <div className="font-medium text-gray-800 mb-2">Address</div>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.address},<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                  
                  {selectedOrder.isDelivered ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Delivered
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      In Transit
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Order Items</h3>
              <div className="overflow-hidden border rounded-lg mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs uppercase tracking-wider font-medium text-gray-500">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-md mr-4"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/70';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">ID: {item.product}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">${item.price.toFixed(2)}</td>
                          <td className="py-4 px-4 text-gray-600">{item.qty}</td>
                          <td className="py-4 px-4 font-medium text-primary">
                            ${(item.price * item.qty).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Price</span>
                    <span className="text-gray-800 font-medium">${Number(selectedOrder.totalPrice - selectedOrder.taxPrice - selectedOrder.shippingPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-800 font-medium">${Number(selectedOrder.taxPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800 font-medium">${Number(selectedOrder.shippingPrice).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-bold text-primary">${Number(selectedOrder.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {!selectedOrder.isPaid && (
                  <div className="mt-6">
                    {selectedOrder.paymentMethod === 'cash' ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Cash Payment on Delivery</span>
                          </div>
                          <p className="mt-2 text-sm text-blue-600">
                            You have chosen to pay in cash when your order is delivered.
                          </p>
                        </div>
                        <button 
                          onClick={handleCashPayment}
                          className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
                        >
                          Confirm Cash Payment
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handlePayNow}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => !paymentProcessing && setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={paymentProcessing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
                <p className="text-gray-600 mt-1">Enter your card details to process payment</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Amount to Pay</p>
                  <p className="text-xl font-bold text-blue-600">${selectedOrder?.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      maxLength="19"
                      required
                      disabled={paymentProcessing}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      value={paymentInfo.expirationDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      maxLength="5"
                      required
                      disabled={paymentProcessing}
                    />
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                      <span className="ml-1 inline-block" title="3-digit security code on the back of your card">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      maxLength="3"
                      required
                      disabled={paymentProcessing}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    'Pay Now'
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    This is a test payment system. No real payments will be processed.
                    <br />
                    You can use any valid card format for testing.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Your Orders</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wider font-medium text-gray-500">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr 
                  key={order._id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  <td className="py-4 px-6 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-6 font-medium text-primary">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} />
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleOrderClick(order._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded text-sm font-medium transition-colors"
                    >
                      <span>Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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