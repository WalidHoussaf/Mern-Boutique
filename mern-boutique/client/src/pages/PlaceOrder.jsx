import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

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
    createOrder
  } = useContext(ShopContext);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(() => {
    // Try to load saved shipping info from localStorage
    const savedInfo = localStorage.getItem('shippingInfo');
    return savedInfo ? JSON.parse(savedInfo) : {
      fullName: user?.name || '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phoneNumber: ''
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cash');  // Changed default to cash
  
  // Remove cardInfo state since we're not using it anymore
  
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

  // Save shipping info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
  }, [shippingInfo]);
  
  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  // Validate postal code based on country
  const validatePostalCode = (postalCode, country) => {
    const postalCodeRegex = {
      'United States': /^\d{5}(-\d{4})?$/,
      'Canada': /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      'Morocco': /^\d{5}$/,  // Moroccan postal code format
      // Add more country-specific regex patterns here
    };

    if (!country) return true; // Skip validation if no country selected
    const regex = postalCodeRegex[country];
    return !regex || regex.test(postalCode);
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
        return validatePostalCode(value, shippingInfo.country) ? '' : t('postal_code_error');
      case 'country':
        return value.trim().length >= 2 ? '' : t('country_error');
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
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error(t('please_login_purchase'));
      navigate('/login?redirect=place-order');
      return;
    }
    
    // Redirect if cart is empty
    if (getCartCount() === 0) {
      navigate('/cart');
    }
  }, [user, navigate, getCartCount, t]);
  
  // Calculate order totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05; // 5% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;
  
  // Get cart products with additional info
  const cartProductsWithInfo = Object.entries(cartItems).map(([itemKey, item]) => {
    const product = allProducts.find(p => p._id === item.productId);
    if (!product) return null;
    
    return {
      ...product,
      cartItemKey: itemKey,
      size: item.size,
      quantity: item.quantity
    };
  }).filter(Boolean);
  
  // Remove cardInfo state since we're not using it anymore
  
  const handlePlaceOrder = async () => {

    // Validate all fields
    const errors = {};
    Object.keys(shippingInfo).forEach(field => {
      const error = validateField(field, shippingInfo[field]);
      if (error) errors[field] = error;
    });

    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(t('fix_shipping_errors'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // Verify user is logged in
      if (!user || !user._id) {
        toast.error(t('must_login_order'));
        navigate('/login?redirect=place-order');
        return;
      }

      // Prepare order items from cart
      const orderItems = cartProductsWithInfo.map(item => {
        let imageUrl = '';
        if (typeof item.image === 'string') {
          imageUrl = item.image;
        } else if (Array.isArray(item.image) && item.image.length > 0) {
          imageUrl = item.image[0];
        } else {
          imageUrl = 'https://via.placeholder.com/150';
        }

        return {
          name: item.name,
          qty: item.quantity,
          image: imageUrl,
          price: item.price,
          product: item._id
        };
      });
      
      // Prepare shipping address from shipping info
      const shippingAddress = {
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        phoneNumber: shippingInfo.phoneNumber // Added phone number to shipping address
      };
      
      // Create order object
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: Number(subtotal.toFixed(2)),
        taxPrice: Number(tax.toFixed(2)),
        shippingPrice: Number(shipping.toFixed(2)),
        totalPrice: Number(total.toFixed(2))
      };
      
      // Submit order to backend
      const createdOrder = await createOrder(orderData);
      clearCart();
      toast.success(t('order_placed_successfully'));
      navigate(`/orders`);
    } catch (error) {
      console.error('Error placing order:', error);
      let errorMessage = t('failed_place_order');
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
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
    <div className="py-12 px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-prata text-secondary mb-3">{t('checkout')}</h1>
        <p className="text-gray-500">{t('complete_purchase')}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping and Payment Information */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-prata text-secondary">{t('shipping_address')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                    required
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.fullName}</p>
                  )}
                </div>
                <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">{t('phone_number')}</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.phoneNumber}</p>
                  )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.address && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>
                )}
              </div>
                <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                    required
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">{t('postal_code')}</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                    required
                  />
                  {fieldErrors.postalCode && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.postalCode}</p>
                  )}
                </div>
              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">{t('country')}</label>
                  <select
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                    fieldErrors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                    required
                  >
                    <option value="">{t('select_country')}</option>
                    <option value="Morocco">{t('morocco')}</option>
                    <option value="United States">{t('united_states')}</option>
                    <option value="Canada">{t('canada')}</option>
                    <option value="United Kingdom">{t('united_kingdom')}</option>
                    {/* Add more countries as needed */}
                  </select>
                  {fieldErrors.country && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.country}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Method Section */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 mt-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-prata text-secondary">{t('payment_method')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash on Delivery Option */}
                <div
                  onClick={() => handlePaymentMethodChange('cash')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cash' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex items-center">
                      {getPaymentMethodIcon('cash')}
                      <span className="ml-2 font-medium">{t('cash_on_delivery')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-10">
                    {t('cash_on_delivery_desc')}
                  </p>
                </div>

                {/* Credit/Debit Card Option */}
                <div
                  onClick={() => handlePaymentMethodChange('credit')}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'credit' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'credit' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex items-center">
                      {getPaymentMethodIcon('credit')}
                      <span className="ml-2 font-medium">{t('credit_debit_card')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-10">
                    {t('credit_debit_card_desc')}
                  </p>
                </div>
              </div>
            </div>
            
          {/* Return to cart link */}
          <div className="mt-4">
            <motion.button 
              whileHover={{ x: -3 }}
              onClick={() => navigate('/cart')}
              className="text-primary hover:text-primary-dark transition-colors flex items-center text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('return_to_cart')}
            </motion.button>
            </div>
        </motion.div>
        
        {/* Order Summary */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 sticky top-20">
            <h2 className="text-xl font-prata text-secondary mb-6">{t('order_summary')}</h2>
            
            {/* Items List */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-6 pr-1">
              {cartProductsWithInfo.map((product) => (
                <motion.div 
                  key={product.cartItemKey} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100"
                >
                  <div className="relative rounded-md overflow-hidden bg-gray-50">
                  <img 
                    src={product.image?.[0] || 'https://via.placeholder.com/50'} 
                    alt={product.name} 
                      className="w-16 h-16 object-cover"
                  />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{product.name}</p>
                    <div className="flex flex-wrap mt-1 gap-1">
                      {product.size && (
                        <span className="px-2 py-0.5 bg-primary/10 text-xs rounded-md text-primary font-medium">{t('size')}: {product.size}</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-md text-gray-600">{t('quantity')}: {product.quantity}</span>
                    </div>
                  </div>
                  <p className="font-medium text-primary whitespace-nowrap">
                    {currency}{(product.price * product.quantity).toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* Price Details */}
            <div className="space-y-3 py-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">{t('subtotal')}</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">{t('tax')}</span>
                <span>{currency}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">{t('shipping')}</span>
                <span className="flex items-center">
                  {subtotal > 100 ? (
                                          <span className="text-green-500 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('free')}
                      </span>
                  ) : (
                    <span>{currency}{shipping.toFixed(2)}</span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex justify-between items-center font-medium text-lg mb-6">
                <span className="text-gray-800">{t('total')}</span>
                <span className="text-xl text-primary">{currency}{total.toFixed(2)}</span>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-lg shadow-sm font-medium flex items-center justify-center ${
                  isProcessing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-dark hover:shadow transition-all duration-200'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processing')}
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder; 