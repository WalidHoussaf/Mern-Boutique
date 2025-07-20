import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import useTranslation from '../utils/useTranslation';

const Wishlist = () => {
  const { 
    wishlistItems, 
    allProducts, 
    clearWishlist,
    wishlistLoading,
    isAuthenticated,
    navigate
  } = useContext(ShopContext);
  const { t } = useTranslation();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, navigate]);

  // Get wishlist products from wishlistItems
  useEffect(() => {
    // If we have the wishlist data
    if (Object.keys(wishlistItems).length > 0) {
      // Extract products from wishlistItems
      const products = Object.values(wishlistItems).map(item => {
        // If the item has a full product object from the API, use it
        if (item.product) {
          // Make sure we have the necessary data
          const product = { ...item.product };
          
          // Make sure image field is properly populated
          if (!product.image || (Array.isArray(product.image) && product.image.length === 0)) {
            // Try to fetch the product from allProducts if image is missing
            const fullProduct = allProducts.find(p => p._id === product._id);
            if (fullProduct && fullProduct.image && fullProduct.image.length > 0) {
              product.image = fullProduct.image;
            } else {
              // Fallback to a default product image
              product.image = ['/images/p_img1.png'];
            }
          }
          
          // Ensure rating is a number
          if (product.rating === undefined || product.rating === null) {
            const fullProduct = allProducts.find(p => p._id === product._id);
            if (fullProduct && fullProduct.rating !== undefined) {
              product.rating = fullProduct.rating;
            }
          } else if (typeof product.rating === 'string') {
            product.rating = parseFloat(product.rating) || 0;
          }
          
          return product;
        }
        
        // Otherwise try to find it in allProducts
        const product = allProducts.find(p => p._id === item.productId);
        if (product) {
          return product;
        }
        
        // If we can't find the product, create a placeholder with the ID
        return {
          _id: item.productId,
          name: "Product",
          price: 0,
          image: ['/images/p_img1.png'],
          category: "Unknown",
          rating: 0
        };
      });
      
      setWishlistProducts(products);
    } else {
      setWishlistProducts([]);
    }
    
    // Only show loading when wishlistLoading is true
    setLoading(wishlistLoading);
  }, [wishlistItems, allProducts, wishlistLoading]);

  const handleContinueShopping = () => {
    navigate('/collection');
  };

  const handleClearWishlist = async () => {
    setIsClearing(true);
    await clearWishlist();
    setIsClearing(false);
    setShowClearModal(false);
  };

  // Function to ensure we have valid image data for each product
  const getProductImage = (product) => {
    if (!product) return ['/images/p_img1.png'];
    
    // In our database, product.image is the correct field (an array of strings)
    if (product.image && Array.isArray(product.image) && product.image.length > 0) {
      return product.image;
    }
    
    // If we have a string, convert it to an array
    if (product.image && typeof product.image === 'string') {
      return [product.image];
    }
    
    // If we have images field as backup
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    
    // If we have a string in images, convert it to an array
    if (product.images && typeof product.images === 'string') {
      return [product.images];
    }
    
    // Try to find the product in allProducts as a last resort
    const fullProduct = allProducts.find(p => p._id === product._id);
    if (fullProduct && fullProduct.image && Array.isArray(fullProduct.image) && fullProduct.image.length > 0) {
      return fullProduct.image;
    }
    
    // Return a sample image from our database as fallback
    return ['/images/p_img1.png'];
  };

  return (
    <div className="min-h-screen py-8">
      {/* Clear Wishlist Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      {t('clear_wishlist')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('clear_wishlist_confirm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleClearWishlist}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('clearing')}
                    </span>
                  ) : (
                    t('clear_wishlist')
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setShowClearModal(false)}
                  disabled={isClearing}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-prata text-secondary mb-4">{t('my_wishlist')}</h1>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          {t('wishlist_description')}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : wishlistProducts.length === 0 ? (
        <motion.div 
          className="text-center py-16 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-3">{t('wishlist_empty')}</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {t('wishlist_empty_description')}
          </p>
          <motion.button
            onClick={handleContinueShopping}
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('continue_shopping')}
          </motion.button>
        </motion.div>
      ) : (
        <div className="container mx-auto">
          <div className="flex justify-end mb-6">
            <motion.button
              onClick={() => setShowClearModal(true)}
              disabled={isClearing}
              className={`px-4 py-2 text-sm font-medium rounded-md border border-red-500 text-red-500 hover:bg-red-50 transition-colors ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('clear_wishlist')}
              </span>
            </motion.button>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {wishlistProducts.map((product) => {
              // Ensure rating is a number and has a reasonable default
              const rating = typeof product.rating === 'number' && product.rating > 0 ? product.rating : 
                            typeof product.rating === 'string' ? parseFloat(product.rating) || 4.0 : 4.0;
              
              return (
                <motion.div key={product._id} variants={itemVariants} className="relative">
                  <ProductItem
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={getProductImage(product)}
                    rating={rating}
                    category={product.category}
                    subCategory={product.subCategory}
                    isNew={product.isNew}
                    showRemoveButton={true}
                    product={product}
                  />
                </motion.div>
              );
            })}
          </motion.div>
          
          <div className="flex justify-center mt-12">
            <motion.button
              onClick={handleContinueShopping}
              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('continue_shopping')}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist; 