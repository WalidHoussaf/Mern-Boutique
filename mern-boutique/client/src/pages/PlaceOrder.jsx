import { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNotifications } from '../context/NotificationContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

// Update the PAYMENT_METHODS object at the top of the file
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

const PlaceOrder = () => {
  const { t } = useTranslation();
  const { 
    user, 
    navigate, 
    allProducts, 
    cartItems, 
    getCartTotal, 
    getCartCount,
    clearCart,
    currency = '$',
    createOrder,
    loading
  } = useContext(ShopContext);
  const { refreshNotifications } = useNotifications();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(() => {
    const savedInfo = localStorage.getItem('shippingInfo');
    return savedInfo ? JSON.parse(savedInfo) : {
      fullName: user?.name || '',
      address: '',
      city: '',
      postalCode: '',
      phoneNumber: ''
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('visa');

  // Memoize cart products calculation
  const cartProductsWithInfo = useMemo(() => {
    return Object.entries(cartItems).map(([itemKey, item]) => {
      const product = allProducts.find(p => p._id === item.productId);
      if (!product) return null;
      
      return {
        ...product,
        cartItemKey: itemKey,
        size: item.size,
        quantity: item.quantity
      };
    }).filter(Boolean);
  }, [cartItems, allProducts]);

  // Memoize order totals calculation
  const orderTotals = useMemo(() => {
    const subtotal = getCartTotal();
    const tax = subtotal * 0.05;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total
    };
  }, [getCartTotal]);

  // Memoize auth check to prevent unnecessary reruns
  const checkAuth = useCallback(() => {
    const userInfo = localStorage.getItem('user');
    const parsedUser = userInfo ? JSON.parse(userInfo) : null;
    
    if (!parsedUser || !parsedUser.token || !user) {
      toast.error(t('please_login_purchase'));
      navigate('/login?redirect=place-order');
      return false;
    }

    if (getCartCount() === 0) {
      navigate('/cart');
      return false;
    }

    return true;
  }, [user, navigate, getCartCount, t]);

  // Initialize page
  useEffect(() => {
    if (!loading) {
      const isAuthenticated = checkAuth();
      if (isAuthenticated) {
        setIsPageReady(true);
      }
    }
  }, [loading, checkAuth]);

  // Save shipping info to localStorage
  useEffect(() => {
    if (isPageReady) {
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    }
  }, [shippingInfo, isPageReady]);

  if (!isPageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'credit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  // Validate postal code based on country
  const validatePostalCode = (postalCode) => {
    // Moroccan postal code format
    const moroccanPostalCodeRegex = /^\d{5}$/;
    return moroccanPostalCodeRegex.test(postalCode);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim().length >= 2 ? '' : t('full_name_error');
      case 'address':
        return value.trim().length >= 5 ? '' : t('address_error');
      case 'city':
        return value.trim().length >= 2 ? '' : t('city_error');
      case 'postalCode':
        return validatePostalCode(value) ? '' : t('postal_code_error');
      case 'phoneNumber':
        return /^\d{3}-\d{3}-\d{4}$/.test(value) ? '' : t('phone_error');
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format phone number
    if (name === 'phoneNumber') {
      formattedValue = formatPhoneNumber(value);
    }

    // Update the field value
    setShippingInfo(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validate the field
    const error = validateField(name, formattedValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handlePlaceOrder = async () => {
    // Validate all fields
    const errors = {};
    Object.keys(shippingInfo).forEach(field => {
      const error = validateField(field, shippingInfo[field]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(t('fix_shipping_errors'));
      return;
    }

    setIsProcessing(true);
    
    try {
      if (!checkAuth()) {
        return;
      }

      // Prepare order items from cart
      const orderItems = cartProductsWithInfo.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: typeof item.image === 'string' ? item.image : 
              Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : 
              'https://via.placeholder.com/150',
        price: item.price,
        product: item._id
      }));
      
      // Create order object
      const orderData = {
        orderItems,
        shippingAddress: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          country: 'Morocco',
          phoneNumber: shippingInfo.phoneNumber
        },
        paymentMethod,
        itemsPrice: Number(orderTotals.subtotal.toFixed(2)),
        taxPrice: Number(orderTotals.tax.toFixed(2)),
        shippingPrice: Number(orderTotals.shipping.toFixed(2)),
        totalPrice: Number(orderTotals.total.toFixed(2))
      };
      
      const createdOrder = await createOrder(orderData);
      
      // Clear data and show success message
      localStorage.removeItem('shippingInfo');
      clearCart();
      toast.success(t('order_placed_successfully'));
      
      // Wait for notifications to refresh before navigating
      await refreshNotifications();
      
      // Ensure we navigate after all operations are complete
      setTimeout(() => {
        navigate('/orders');
      }, 100);
    } catch (error) {
      console.error('Error placing order:', error);
      let errorMessage = t('failed_place_order');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-prata text-secondary mb-2">{t('checkout')}</h1>
          <p className="text-gray-600">{t('complete_purchase')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Forms */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-semibold text-secondary mb-6">{t('shipping_address')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('full_name')}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone_number')}
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('address_label')}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.address ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.address && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.city ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.city && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('postal_code')}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.postalCode ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.postalCode && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 sticky top-20">
              <h2 className="text-2xl font-semibold text-secondary mb-6">{t('order_summary')}</h2>
               
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cartProductsWithInfo.map((product) => (
                  <motion.div 
                    key={product.cartItemKey} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={product.image?.[0] || 'https://via.placeholder.com/80'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {product.size && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {t('size')}: {product.size}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t('quantity')}: {product.quantity}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-primary">
                        {currency}{(product.price * product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-medium text-gray-800">{currency}{orderTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tax')}:</span>
                  <span className="text-gray-800">{currency}{orderTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}:</span>
                  <span className="text-gray-800">{orderTotals.shipping === 0 ? t('free') : `${currency}${orderTotals.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-secondary">{t('total_amount')}:</span>
                    <span className="font-bold text-primary">{currency}{orderTotals.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('prices_in_currency').replace('{currency}', currency)}
                  </p>
                </div>
              </div>

              {/* Payment method selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">{t('select_payment_method')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PAYMENT_METHODS).map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      className={`flex items-center justify-center p-4 rounded-lg border transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Place Order button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dark hover:shadow transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {t('place_order')}
                  </>
                )}
              </motion.button>

              {/* Secure checkout indicator */}
              <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('secure_checkout')}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder; 