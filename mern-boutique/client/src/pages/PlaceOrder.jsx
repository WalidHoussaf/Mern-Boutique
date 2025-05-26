import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const PlaceOrder = () => {
  const { 
    user, 
    navigate, 
    allProducts, 
    cartItems, 
    getCartTotal, 
    getCartCount,
    parseCartItemKey,
    clearCart,
    currency = '$',
    createOrder
  } = useContext(ShopContext);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to complete your purchase');
      navigate('/login?redirect=place-order');
      return;
    }
    
    // Redirect if cart is empty
    if (getCartCount() === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [user, navigate, getCartCount]);
  
  // Calculate order totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePlaceOrder = async () => {
    // Check if all required fields are filled
    const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'country', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required shipping information`);
      return;
    }
    
    // Validate credit card information if credit payment method is selected
    if (paymentMethod === 'credit') {
      const requiredCardFields = ['cardNumber', 'expiryDate', 'cvv'];
      const missingCardFields = requiredCardFields.filter(field => !cardInfo[field]);
      
      if (missingCardFields.length > 0) {
        toast.error(`Please fill in all required card information`);
        return;
      }
      
      // Basic validation for card fields
      if (cardInfo.cardNumber.replace(/\s/g, '').length < 15) {
        toast.error('Please enter a valid card number');
        return;
      }
      
      if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      
      if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
        toast.error('Please enter a valid CVV code');
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      // Verify user is logged in
      if (!user || !user._id) {
        toast.error('You must be logged in to place an order');
        navigate('/login?redirect=place-order');
        return;
      }

      // Check if we have products
      if (!cartProductsWithInfo || cartProductsWithInfo.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }

      console.log('Cart products:', cartProductsWithInfo);
      
      // Prepare order items from cart
      const orderItems = cartProductsWithInfo.map(item => {
        // Make sure we have a proper image URL
        let imageUrl = '';
        if (typeof item.image === 'string') {
          imageUrl = item.image;
        } else if (Array.isArray(item.image) && item.image.length > 0) {
          imageUrl = item.image[0];
        } else {
          // Default placeholder image
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
        country: shippingInfo.country
      };
      
      // Create order object with proper type conversions
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: Number(subtotal.toFixed(2)),
        taxPrice: Number(tax.toFixed(2)),
        shippingPrice: Number(shipping.toFixed(2)),
        totalPrice: Number(total.toFixed(2))
      };
      
      console.log('Submitting order:', orderData);
      
      // Submit order to backend
      const createdOrder = await createOrder(orderData);
      console.log('Order created successfully:', createdOrder);
      
      // If payment method is credit, we could simulate payment processing here
      // For now, just clear cart and redirect to order details
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders`);
    } catch (error) {
      console.error('Error placing order:', error);
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        console.error('Server error details:', error.response.data);
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
        <h1 className="text-3xl md:text-4xl font-prata text-secondary mb-3">Checkout</h1>
        <p className="text-gray-500">Complete your purchase</p>
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
              <h2 className="text-xl font-prata text-secondary">Shipping Address</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                  />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
                <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code*</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-prata text-secondary">Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50 transition-colors cursor-pointer" 
                   onClick={() => setPaymentMethod('credit')}>
                  <input 
                    type="radio" 
                  id="credit"
                    name="paymentMethod" 
                    value="credit" 
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="credit" className="ml-3 flex items-center cursor-pointer w-full">
                  <span className="block text-sm font-medium text-gray-700">Credit / Debit Card</span>
                  <div className="ml-auto flex space-x-2">
                    <img src="https://cdn-icons-png.flaticon.com/64/196/196578.png" alt="Visa" className="h-6 w-auto" />
                    <img src="https://cdn-icons-png.flaticon.com/64/196/196561.png" alt="MasterCard" className="h-6 w-auto" />
                    <img src="https://cdn-icons-png.flaticon.com/64/196/196539.png" alt="American Express" className="h-6 w-auto" />
                  </div>
                </label>
              </div>
                
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setPaymentMethod('paypal')}>
                  <input 
                    type="radio" 
                  id="paypal"
                    name="paymentMethod" 
                    value="paypal" 
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="paypal" className="ml-3 flex items-center cursor-pointer w-full">
                  <span className="block text-sm font-medium text-gray-700">PayPal</span>
                  <div className="ml-auto">
                    <img src="https://cdn-icons-png.flaticon.com/64/196/196565.png" alt="PayPal" className="h-6 w-auto" />
                  </div>
                </label>
              </div>
              
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setPaymentMethod('googlepay')}>
                      <input
                  type="radio"
                  id="googlepay"
                  name="paymentMethod"
                  value="googlepay"
                  checked={paymentMethod === 'googlepay'}
                  onChange={() => setPaymentMethod('googlepay')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="googlepay" className="ml-3 flex items-center cursor-pointer w-full">
                  <span className="block text-sm font-medium text-gray-700">Google Pay</span>
                  <div className="ml-auto">
                    <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="Google Pay" className="h-6 w-auto" />
                  </div>
                </label>
              </div>
                    </div>
            
            {paymentMethod === 'credit' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number*</label>
                      <input
                        type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="•••• •••• •••• ••••"
                      required
                    />
                  </div>
                    <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date*</label>
                      <input
                        type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardInfo.expiryDate}
                      onChange={handleCardInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="MM/YY"
                      required
                      />
                    </div>
                    <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV*</label>
                      <input
                        type="text"
                      id="cvv"
                      name="cvv"
                      value={cardInfo.cvv}
                      onChange={handleCardInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
              </motion.div>
              )}
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
              Return to Cart
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
            <h2 className="text-xl font-prata text-secondary mb-6">Order Summary</h2>
            
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
                        <span className="px-2 py-0.5 bg-primary/10 text-xs rounded-md text-primary font-medium">Size: {product.size}</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-md text-gray-600">Qty: {product.quantity}</span>
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
                <span className="font-medium">Subtotal</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Tax (10%)</span>
                <span>{currency}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Shipping</span>
                <span className="flex items-center">
                  {subtotal > 100 ? (
                    <span className="text-green-500 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free
                    </span>
                  ) : (
                    <span>{currency}{shipping.toFixed(2)}</span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex justify-between items-center font-medium text-lg mb-6">
                <span className="text-gray-800">Total</span>
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
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Place Order
                  </>
                )}
              </motion.button>
              
              {/* Secure checkout indicator */}
              <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout
            </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder; 