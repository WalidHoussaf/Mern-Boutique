import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

const Cart = () => {
  const { 
    allProducts, 
    cartItems, 
    updateCartQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartCount,
    navigate,
    user,
    currency = '$',
    convertPrice
  } = useContext(ShopContext);
  const { t } = useTranslation();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  // Filter products in cart and create a mapping of products with their cart info
  const cartProductsWithInfo = Object.entries(cartItems).map(([itemKey, item]) => {
    const product = allProducts.find(p => p._id === item.productId);
    if (!product) return null;
    
    return {
      ...product,
      cartItemKey: itemKey,
      size: item.size,
      quantity: item.quantity
    };
  }).filter(Boolean); // Remove any null items from the array

  // Calculate taxes (10%)
  const tax = getCartTotal() * 0.05;
  
  // Calculate shipping (free over $100, otherwise $10)
  const shipping = getCartTotal() > 100 ? 0 : 10;
  
  // Calculate grand total
  const grandTotal = getCartTotal() + tax + shipping;

  // Calculate progress towards free shipping
  const shippingProgressPercent = Math.min((getCartTotal() / 100) * 100, 100);

  // Format price with the current currency
  const formatPrice = (price) => {
    if (!price) return `${currency}0.00`;
    
    const convertedPrice = convertPrice(price);
    
    // Format the price based on the currency
    if (currency === 'MAD') {
      // For Moroccan Dirham, 2 decimal places and currency after the number
      return `${convertedPrice.toFixed(2)} ${currency}`;
    } else {
      // For other currencies, 2 decimal places
      return `${currency}${convertedPrice.toFixed(2)}`;
    }
  };

  const handleQuantityChange = (itemKey, newQuantity) => {
    if (newQuantity < 1) {
      // Show confirmation modal instead of window.confirm
      setShowRemoveConfirm(itemKey);
      return;
    }
    
    // Update quantity
    updateCartQuantity(itemKey, newQuantity);
  };
  
  const confirmRemove = (itemKey) => {
    removeFromCart(itemKey);
    setShowRemoveConfirm(null);
  };
  
  const cancelRemove = () => {
    setShowRemoveConfirm(null);
  };

  const handleCheckout = () => {
    if (!user) {
      toast.info(t('please_login_purchase'));
      navigate('/login?redirect=place-order');
    } else {
      navigate('/place-order');
    }
  };

  if (getCartCount() === 0) {
    return (
      <div className="py-16 px-4 text-center min-h-[70vh] flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100"
        >
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-prata text-secondary mb-4">{t('cart_empty')}</h2>
          <p className="text-gray-500 mb-8">{t('cart_empty_desc')}</p>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/collection')}
            className="bg-primary text-white py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center mx-auto shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('continue_shopping')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto">
      {/* Page title with animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-prata text-secondary mb-3">{t('your_cart')}</h1>
        <p className="text-gray-500">
          {getCartCount()} {getCartCount() === 1 ? t('item') : t('items')} {t('in_your_cart')}
        </p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-2/3"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {/* Grid headers - visible on desktop only */}
            <div className="hidden md:block">
              <div className="bg-gray-50 py-4 px-6 text-left text-gray-600 grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <span className="font-medium">{t('product')}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">{t('price')}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">{t('quantity')}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">{t('total')}</span>
                </div>
              </div>
            </div>
            
            {/* Cart item rows */}
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {cartProductsWithInfo.map((product) => (
                  <motion.div 
                    key={product.cartItemKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="py-6 px-4 md:px-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product info with image and details */}
                      <div className="col-span-1 md:col-span-6">
                      <div className="flex items-center">
                          <div className="relative group">
                            <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-lg bg-gray-50 flex-shrink-0">
                        <img 
                                src={product.image?.[0] || 'https://via.placeholder.com/200'} 
                          alt={product.name} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                onClick={() => navigate(`/product/${product._id}`)}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 cursor-pointer rounded-lg"
                                 onClick={() => navigate(`/product/${product._id}`)}></div>
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-800 hover:text-primary transition-colors cursor-pointer" 
                                onClick={() => navigate(`/product/${product._id}`)}>
                              {product.name}
                            </h3>
                            <div className="flex flex-wrap mt-1 gap-1">
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-600">{product.category}</span>
                              {product.size && (
                                <span className="px-2 py-1 bg-primary/10 text-xs rounded-md text-primary font-medium">Size: {product.size}</span>
                              )}
                            </div>
                            
                            {/* Mobile price display */}
                            <div className="flex justify-between items-center mt-2 md:hidden">
                              <span className="text-gray-800 font-medium">{formatPrice(product.price)}</span>
                              <span className="font-semibold text-primary">{formatPrice(product.price * product.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price column - hidden on mobile */}
                      <div className="hidden md:block md:col-span-2">
                        <span className="text-gray-800">{formatPrice(product.price)}</span>
                      </div>
                      
                      {/* Quantity column */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center border rounded-lg w-full max-w-[120px]">
                          <button 
                            onClick={() => handleQuantityChange(product.cartItemKey, product.quantity - 1)}
                            className="flex-1 flex justify-center items-center h-9 text-gray-500 hover:text-primary transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="flex-1 flex justify-center items-center h-9 border-x">{product.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(product.cartItemKey, product.quantity + 1)}
                            className="flex-1 flex justify-center items-center h-9 text-gray-500 hover:text-primary transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Total column - hidden on mobile */}
                      <div className="hidden md:flex md:col-span-2 justify-between items-center">
                        <span className="font-semibold text-primary">{formatPrice(product.price * product.quantity)}</span>
                        <button 
                          onClick={() => setShowRemoveConfirm(product.cartItemKey)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Mobile remove button */}
                      <div className="block md:hidden mt-2 text-center">
                        <button 
                          onClick={() => setShowRemoveConfirm(product.cartItemKey)}
                          className="text-red-500 text-sm flex items-center justify-center mx-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Continue shopping button */}
          <div className="mt-8">
            <motion.button 
              whileHover={{ x: -3 }}
              onClick={() => navigate('/collection')}
              className="text-primary hover:text-primary-dark transition-colors flex items-center text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('continue_shopping')}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Order Summary - Sticky on desktop */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/3"
        >
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 sticky top-20">
            <h2 className="text-xl font-prata text-secondary mb-6">{t('order_summary')}</h2>
            
            {/* Shipping progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-600">{t('free_shipping_progress')}:</span>
                <span className="font-medium">{shippingProgressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${shippingProgressPercent}%` }}
                ></div>
              </div>
              {getCartTotal() < 100 && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('add_more_free_shipping').replace('{amount}', formatPrice(100 - getCartTotal()))}
                </p>
              )}
              {getCartTotal() >= 100 && (
                <p className="text-xs text-primary mt-2">
                  {t('qualified_free_shipping')}
                </p>
              )}
            </div>
            
            {/* Order details */}
            <div className="space-y-3 text-gray-700 mb-6">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span className="font-medium">{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')}:</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('shipping')}:</span>
                <span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-secondary">{t('total_amount')}:</span>
                  <span className="font-bold text-primary">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('prices_in_currency').replace('{currency}', currency)}
                </p>
              </div>
            </div>
            
            {/* Checkout button with animation */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full py-3.5 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dark hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {t('proceed_to_checkout')}
            </motion.button>
            
            {/* Payment methods accepted */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2 text-center">{t('we_accept')}</p>
              <div className="flex justify-center space-x-3">
                {/* Payment icons - updated to match footer */}
                <img src="https://cdn-icons-png.flaticon.com/64/196/196578.png" alt="Visa" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196561.png" alt="MasterCard" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196565.png" alt="PayPal" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196539.png" alt="American Express" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
              </div>
            </div>
            
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
      
      {/* Remove confirmation modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('remove_confirm')}</h3>
              <p className="text-gray-500 mb-6">{t('remove_confirm_desc')}</p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelRemove}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => confirmRemove(showRemoveConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('remove')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart; 