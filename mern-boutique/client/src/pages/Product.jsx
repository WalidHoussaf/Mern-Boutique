import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ProductItem from '../components/ProductItem';
import ReviewSection from '../components/ReviewSection';
import useTranslation from '../utils/useTranslation';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { allProducts, loading, addToCart, addToWishlist, isInWishlist, currency, convertPrice, navigate, refreshProducts } = useContext(ShopContext);
  const { t, language, getProductTranslation } = useTranslation();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const cursorRef = useRef(null);

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

  useEffect(() => {
    const fetchProduct = async () => {
    // Find product by ID from the context
    if (allProducts.length > 0) {
      const foundProduct = allProducts.find(p => p._id === productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Reset active image and quantity when product changes
        setActiveImage(0);
        setQuantity(1);
        setAddedToCart(false);
        setSelectedSize(null);
        
        // Find similar products (same category and subcategory)
        const similar = allProducts.filter(p => 
          p._id !== productId && 
          p.category === foundProduct.category &&
          p.subCategory === foundProduct.subCategory
        ).slice(0, 4); // Limit to 4 similar products
        
        setSimilarProducts(similar);
          return;
      }
    }
      
      // If product not found in context or context is empty, fetch directly from API
      setLoadingProduct(true);
      try {
        const response = await axios.get(`/api/products/${productId}`);
        if (response.data) {
          setProduct(response.data);
          
          // Refresh all products in context to update with latest data
          refreshProducts();
          
          // Reset other states
          setActiveImage(0);
          setQuantity(1);
          setAddedToCart(false);
          setSelectedSize(null);
          
          // Find similar products using API call
          try {
            const similarResponse = await axios.get(`/api/products?category=${response.data.category}&subCategory=${response.data.subCategory}&limit=4`);
            const similarData = Array.isArray(similarResponse.data) ? similarResponse.data : 
                              (similarResponse.data.products || []);
            
            const filteredSimilar = similarData.filter(p => p._id !== productId).slice(0, 4);
            setSimilarProducts(filteredSimilar);
          } catch (error) {
            console.error('Error fetching similar products:', error);
            setSimilarProducts([]);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error(t('failed_load_product'));
      } finally {
        setLoadingProduct(false);
      }
    };
    
    fetchProduct();
  }, [productId, allProducts, refreshProducts]);

  // Handle image navigation
  const goToPrevImage = useCallback(() => {
    if (!product || !product.image || product.image.length <= 1) return;
    
    if (activeImage === 0) {
      setActiveImage(product.image.length - 1); // Go to last image if at first
    } else {
      setActiveImage(activeImage - 1);
    }
  }, [activeImage, product]);

  const goToNextImage = useCallback(() => {
    if (!product || !product.image || product.image.length <= 1) return;
    
    if (activeImage === product.image.length - 1) {
      setActiveImage(0); // Go to first image if at last
    } else {
      setActiveImage(activeImage + 1);
    }
  }, [activeImage, product]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextImage, goToPrevImage]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error(t('please_select_size'), {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
      // Shake the size selection area to draw attention
      const sizeSection = document.querySelector('.size-selection');
      if (sizeSection) {
        sizeSection.classList.add('animate-shake');
        setTimeout(() => {
          sizeSection.classList.remove('animate-shake');
        }, 500);
      }
      
      return;
    }
    
    // Validate that the selected size is actually available for this product
    if (product?.sizes && !product.sizes.includes(selectedSize)) {
      toast.error(t('size_not_available'), {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    
    if (product) {
      const success = addToCart(product._id, quantity, selectedSize);
      
      if (success) {
        setAddedToCart(true);
        toast.success(t('product_added_cart', { productName: product.name, size: selectedSize }), {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        
        // Reset after 2 seconds
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      }
    }
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.countInStock || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  const toggleWishlist = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (product) {
      addToWishlist(product._id);
    }
  };
  
  const toggleAccordion = (section) => {
    if (openAccordion === section) {
      setOpenAccordion(null);
    } else {
      setOpenAccordion(section);
    }
  };

  // Smooth cursor following
  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Helper to get translated features
  const getTranslatedFeatures = () => {
    if (!product) return [];
    if (language === 'fr' && Array.isArray(product.featuresFr) && product.featuresFr.length > 0) {
      // If French features exist and at least one is non-empty, use them
      const hasNonEmpty = product.featuresFr.some(f => f && f.trim() !== '');
      if (hasNonEmpty) return product.featuresFr;
    }
    // Fallback to English
    return product.features || [];
  };

  if (loading || loadingProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-500 animate-pulse">{t('loading_product')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 px-4 min-h-[60vh] flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 text-gray-300 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-prata text-secondary mb-4">{t('product_not_found')}</h2>
        <p className="max-w-md text-gray-500 mb-8">{t('product_not_found_desc')}</p>
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('go_back')}
        </button>
      </div>
    );
  }

  // Calculate discounted price if relevant
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="flex text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-primary">{t('home')}</a>
        <span className="mx-2">/</span>
        <a href="/collection" className="hover:text-primary">{t('collection')}</a>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product?.name}</span>
      </nav>

      {/* Save percentage */}
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
        {/* Product Images */}
        <div className="lg:w-1/2">
          {/* Main product image */}
          <div className="relative bg-white rounded-2xl mb-4">
            {/* Image carousel controls */}
            {product?.image && product.image.length > 1 && (
              <>
                <button 
                  onClick={goToPrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            {/* Main image */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full pt-[125%] relative"
              >
                <div 
                  ref={imageContainerRef}
                  className="absolute inset-0 overflow-hidden rounded-2xl cursor-none"
                  onClick={toggleZoom}
                  onMouseEnter={() => setShowZoomIndicator(true)}
                  onMouseLeave={() => setShowZoomIndicator(false)}
                  onMouseMove={handleMouseMove}
                >
                  <motion.img
                    src={product?.image?.[activeImage] || 'https://via.placeholder.com/600?text=Product+Image'}
                    alt={product?.name}
                    className="w-full h-full rounded-2xl transition-opacity duration-1000 ease-out relative"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
                    animate={{
                      scale: isZoomed ? 1.5 : 1,
                      transition: { duration: 0.3 }
                    }}
                  />
                  {/* Custom cursor */}
                  <div 
                    ref={cursorRef}
                    className={`absolute top-0 left-0 flex items-center gap-2 pointer-events-none transition-opacity duration-200 ${
                      showZoomIndicator ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      transition: 'transform 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    <span className="text-xl font-light select-none text-black">
                      {isZoomed ? '−' : '+'}
                    </span>
                    <span className="text-sm bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full select-none text-black whitespace-nowrap">
                      {isZoomed ? 'Zoom out' : 'Zoom in'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Wishlist button */}
            <button
              onClick={toggleWishlist}
              className={`absolute top-4 left-4 rounded-full p-2.5 shadow-sm transition-colors ${
                isInWishlist(product?._id) 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900'
              }`}
              aria-label={isInWishlist(product?._id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist(product?._id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          </div>
          {/* Thumbnail images */}
          {product?.image && product.image.length > 1 && (
            <div className="flex gap-4 overflow-x-auto justify-center py-4 px-2">
              {product.image.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                    activeImage === index 
                      ? 'ring-2 ring-primary ring-offset-4 shadow-md' 
                      : 'border border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
            {/* Product title and price */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-prata text-secondary mb-4">{product ? getProductTranslation(product, 'name') : ''}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium text-primary">{formatPrice(product?.price)}</span>
                {product?.originalPrice && (
                  <span className="text-base text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              
              {/* Display discount percentage if there's an old price */}
              {product?.originalPrice && (
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {t('save')} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
            </div>
            
            {/* Rating display */}
            <div className="flex items-center mb-6">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ${star <= (product?.rating || 0) ? 'fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {product?.rating !== undefined && (
                <span className="ml-2 text-sm text-gray-700 font-medium">
                  {Number(product.rating).toFixed(1)}
                </span>
              )}
              {product?.numReviews !== undefined && (
                <span className="ml-2 text-xs text-gray-500">
                  ({product.numReviews} {t('reviews')})
                </span>
              )}
            </div>
            
            {/* Product description */}
            <div className="text-gray-600 mb-8 text-justify">
              <p>{product ? getProductTranslation(product, 'description') : ''}</p>
            </div>
            
            {/* Additional Product Information */}
            <div className="mb-8 border-t border-gray-100 pt-6">
              {/* Availability Status */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-700 w-24">{t('status')}:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product?.countInStock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product?.countInStock > 0 ? t('in_stock') : t('out_of_stock')}
                </span>
              </div>

              {/* SKU */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-700 w-24">{t('sku')}:</span>
                <span className="text-sm text-gray-600">{product?.sku || `SKU-${product?._id?.slice(-6)}`}</span>
              </div>

              {/* Category & Subcategory */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-700 w-24">{t('category')}:</span>
                <div className="flex items-center">
                  <span 
                    className="text-sm text-primary cursor-pointer hover:underline"
                    onClick={() => navigate(`/collection?category=${encodeURIComponent(product?.category)}`)}
                  >
                    {product?.category ? t(`category_${product.category.toLowerCase()}`) || product.category : ''}
                  </span>
                  {product?.subCategory && (
                    <>
                      <span className="mx-2 text-gray-400">/</span>
                      <span 
                        className="text-sm text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/collection?category=${encodeURIComponent(product?.category)}&subcategory=${encodeURIComponent(product?.subCategory)}`)}
                      >
                        {product.subCategory ? t(`subcategory_${product.subCategory.toLowerCase()}`) || product.subCategory : ''}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product?.tags && product.tags.length > 0 && (
                <div className="flex items-center mb-4">
                  <span className="text-sm font-medium text-gray-700 w-24">{t('tags')}:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
                        onClick={() => navigate(`/collection?tag=${encodeURIComponent(tag)}`)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Features */}
              {getTranslatedFeatures().length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 w-24">{t('product_features')}:</span>
                  <div className="mt-2 space-y-2">
                    {getTranslatedFeatures().map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details Grid */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                {/* Brand */}
                {product?.brand && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm text-gray-600">{product.brand}</span>
                  </div>
                )}
                
                {/* Material */}
                {product?.material && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm text-gray-600">{product.material}</span>
                  </div>
                )}

                {/* Style */}
                {product?.style && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">{product.style}</span>
                  </div>
                )}

                {/* Season */}
                {product?.season && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{product.season}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Size selection */}
            <div className="mb-6 size-selection">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('select_size')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {product?.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 border rounded-md text-center ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                      } transition-colors`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-4 text-gray-500">
                    {t('no_sizes_available')}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quantity selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="text-gray-500 hover:text-primary h-10 w-10 rounded-l-md border border-r-0 border-gray-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="h-10 w-12 border-t border-b border-gray-300 flex items-center justify-center text-gray-700">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="text-gray-500 hover:text-primary h-10 w-10 rounded-r-md border border-l-0 border-gray-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <motion.button
              whileHover={{ scale: product?.countInStock > 0 ? 1.02 : 1 }}
              whileTap={{ scale: product?.countInStock > 0 ? 0.98 : 1 }}
              onClick={handleAddToCart}
              disabled={!product?.countInStock || product.countInStock <= 0}
              className={`w-full py-3 px-6 rounded-lg shadow-sm flex items-center justify-center text-base font-medium transition-colors ${
                !product?.countInStock || product.countInStock <= 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : addedToCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {!product?.countInStock || product.countInStock <= 0 ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('out_of_stock')}
                </>
              ) : addedToCart ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('added_to_cart')}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H5z" />
                  </svg>
                  {t('add_to_cart')}
                </>
              )}
                        </motion.button>
            
            {/* Product Details Accordion */}
            <div className="mt-8 border-t pt-8">
              {/* Features indicator */}
              {getTranslatedFeatures().length > 0 && (
                <div className="mb-4 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {getTranslatedFeatures().length} {getTranslatedFeatures().length === 1 ? t('feature') : t('features')}
                  </span>
                </div>
              )}
              {/* Shipping Info - always visible */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
                <div className="mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium text-gray-900">{t('shipping_info')}</span>
                </div>
                <div className="mt-4 space-y-4">
                  {/* Store Pickup */}
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{t('store_pickup')}</h4>
                      <p className="mt-1 text-sm text-gray-600">{t('store_pickup_desc')}</p>
                      <span className="inline-block mt-2 text-sm text-green-600 font-medium">{t('free')}</span>
                    </div>
                  </div>
                  {/* Home Delivery */}
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{t('home_delivery')}</h4>
                      <p className="mt-1 text-sm text-gray-600">{t('home_delivery_desc')}</p>
                      <span className="inline-block mt-2 text-sm text-green-600 font-medium">{t('free')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material & Care */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <button
                  onClick={() => toggleAccordion('materials')}
                  className="flex w-full justify-between items-center text-left"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="font-medium text-gray-900">{t('material_care')}</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-500 transition-transform ${openAccordion === 'materials' ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openAccordion === 'materials' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-6">
                        {/* Composition */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">{t('composition')}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{t('polyester')}</span>
                              <span className="font-medium">{t('polyester_percentage')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>{t('cotton')}</span>
                              <span className="font-medium">{t('cotton_percentage')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>{t('elastane')}</span>
                              <span className="font-medium">{t('elastane_percentage')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Certified Materials */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">{t('certified_materials')}</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{t('organic_cotton_cert')}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{t('recycled_polyester_cert')}</span>
                            </div>
                          </div>
                          <p className="mt-4 text-sm">
                            {t('certified_note')}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            {t('certified_by')}
                          </p>
                        </div>

                        {/* Care Instructions */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">{t('care_instructions')}</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 122.88 68.79" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.22,4.23c-0.63-1.59,0.15-3.39,1.74-4.01c1.59-0.63,3.39,0.15,4.01,1.74l3.64,9.21c5.66-4.89,11.11-7.72,16.19-8.92 c6.86-1.62,13.01-0.31,18.13,2.86c7.26,4.49,12.33,6.76,17.05,6.85c4.67,0.1,9.45-1.94,16.17-6.05C82.94,2.36,90.12,0.4,97.5,1.91 c5.44,1.12,10.91,4.1,15.9,9.7l3.48-9.57c0.58-1.6,2.35-2.43,3.95-1.85c1.6,0.58,2.43,2.35,1.85,3.95L99.98,66.52 c-0.36,1.31-1.56,2.27-2.98,2.27H27.83c-1.23,0-2.4-0.74-2.88-1.96L0.22,4.23L0.22,4.23z M63.4,40.12c0-4.91,0.88-8.35,2.65-10.31 c1.77-1.96,4.47-2.94,8.08-2.94c1.74,0,3.17,0.22,4.29,0.64c1.12,0.43,2.03,0.99,2.73,1.67c0.71,0.69,1.26,1.41,1.67,2.17 c0.41,0.76,0.73,1.64,0.98,2.65c0.48,1.93,0.72,3.94,0.72,6.03c0,4.69-0.79,8.12-2.38,10.29c-1.58,2.17-4.32,3.26-8.2,3.26 c-2.17,0-3.93-0.35-5.27-1.04c-1.34-0.69-2.44-1.71-3.3-3.05c-0.62-0.95-1.11-2.25-1.46-3.9C63.57,43.95,63.4,42.12,63.4,40.12 L63.4,40.12z M70.51,40.14c0,3.29,0.29,5.54,0.87,6.74c0.58,1.2,1.43,1.81,2.53,1.81c0.73,0,1.36-0.25,1.9-0.76 c0.54-0.51,0.93-1.32,1.18-2.43c0.25-1.11,0.38-2.83,0.38-5.16c0-3.43-0.29-5.74-0.87-6.92c-0.58-1.18-1.46-1.77-2.62-1.77 c-1.19,0-2.05,0.6-2.58,1.81C70.78,34.65,70.51,36.88,70.51,40.14L70.51,40.14z M51.66,48.32H38.59v-5.9l13.07-15.55h6.25v15.89 h3.25v5.56h-3.25v4.84h-6.25V48.32L51.66,48.32z M51.66,42.76V34.6l-6.9,8.16H51.66L51.66,42.76z M12.03,17.3l17.9,45.3h64.91 l16.19-44.46c-0.31-0.19-0.59-0.43-0.83-0.73c-4.43-5.62-9.24-8.49-13.93-9.45c-5.68-1.17-11.3,0.41-15.9,3.22 c-7.73,4.73-13.44,7.07-19.51,6.95c-6.02-0.12-11.95-2.69-20.17-7.77c-3.78-2.34-8.35-3.3-13.49-2.08 C22.59,9.36,17.49,12.19,12.03,17.3L12.03,17.3z" fill="currentColor"/>
                              </svg>
                              <span>{t('machine_wash_gentle_cycle')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 122.88 122.47" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M65.45,2.3l21.31,36.28l27.47-26.15c1.65-1.57,4.27-1.51,5.84,0.15c1.57,1.65,1.51,4.27-0.15,5.84L91.05,45.89l31.26,53.22 c1.17,1.99,0.5,4.55-1.49,5.71c-0.66,0.39-1.39,0.57-2.11,0.57v0.02h-12.35l10.44,9.94c1.65,1.57,1.72,4.19,0.15,5.84 c-1.57,1.65-4.19,1.72-5.84,0.15l-16.72-15.92H28.52l-16.72,15.92c-1.65,1.57-4.27,1.51-5.84-0.15c-1.57-1.65-1.51-4.27,0.15-5.84 l10.44-9.94H4.19c-2.31,0-4.19-1.88-4.19-4.19c0-0.87,0.27-1.68,0.72-2.35l31.3-52.81L2.98,18.41c-1.65-1.57-1.72-4.19-0.15-5.84 c1.57-1.65,4.19-1.72,5.84-0.15l27.68,26.34L58.11,2.06c1.17-1.99,3.74-2.65,5.73-1.47C64.55,1.01,65.1,1.61,65.45,2.3L65.45,2.3z M85.58,97.03L61.45,74.06L37.32,97.03H85.58L85.58,97.03z M55.46,68.36L38.24,51.98L11.54,97.03h13.81L55.46,68.36L55.46,68.36z M42.56,44.69l18.88,17.98l19.09-18.18L61.7,12.4L42.56,44.69L42.56,44.69z M67.44,68.36l30.12,28.67h13.85L84.84,51.8L67.44,68.36 L67.44,68.36z" fill="currentColor"/>
                              </svg>
                              <span>{t('do_not_bleach')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 122.88 90.65" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M31.59,7.92c-2.19,0-3.96-1.77-3.96-3.96c0-2.19,1.77-3.96,3.96-3.96h73.45c2.05,0,3.74,1.56,3.94,3.56l13.85,82.49 c0.36,2.15-1.1,4.19-3.25,4.55c-0.22,0.04-0.43,0.05-0.65,0.05L3.96,90.65C1.77,90.65,0,88.88,0,86.69c0-0.38,0.05-0.75,0.16-1.1 c1.93-9.12,4.66-17.41,8.42-24.62c3.89-7.44,8.87-13.71,15.18-18.53c13.22-10.09,23.71-10,37.74-9.87c0.65,0.01,1.25,0.01,4.7,0.01 h39.66L101.7,7.92H31.59L31.59,7.92z M64.12,55.42c4.03,0,7.29,3.26,7.29,7.29c0,4.03-3.26,7.29-7.29,7.29 c-4.03,0-7.29-3.26-7.29-7.29C56.83,58.69,60.09,55.42,64.12,55.42L64.12,55.42z M114.26,82.73l-7.09-42.23H66.18l-4.76-0.04 c-12.47-0.11-21.8-0.19-32.88,8.26c-5.37,4.1-9.62,9.48-12.98,15.9c-2.79,5.34-4.97,11.42-6.65,18.11H114.26L114.26,82.73z" fill="currentColor"/>
                              </svg>
                              <span>{t('iron_at')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-5 w-5 text-gray-600" viewBox="0 0 122.27 122.88" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.93,0h116.42c1.62,0,2.93,1.31,2.93,2.93v117.03c0,1.62-1.31,2.93-2.93,2.93H2.93c-1.62,0-2.93-1.31-2.93-2.93V2.93 C0,1.31,1.31,0,2.93,0L2.93,0z M61.14,51.72c5.37,0,9.72,4.35,9.72,9.72c0,5.37-4.35,9.72-9.72,9.72s-9.72-4.35-9.72-9.72 C51.42,56.07,55.77,51.72,61.14,51.72L61.14,51.72z M67.8,5.85c12.8,1.52,24.27,7.35,32.92,16c8.16,8.16,13.81,18.82,15.7,30.73 V5.85H67.8L67.8,5.85z M116.42,70.3c-1.89,11.91-7.54,22.57-15.7,30.73c-8.65,8.65-20.12,14.48-32.91,16h48.61V70.3L116.42,70.3z M54.47,117.03c-12.79-1.52-24.26-7.35-32.91-16C13.4,92.87,7.75,82.21,5.85,70.3v46.73H54.47L54.47,117.03z M5.85,52.59 c1.89-11.91,7.54-22.57,15.7-30.73c8.65-8.65,20.13-14.49,32.92-16H5.85V52.59L5.85,52.59z M90.67,31.9 c-7.56-7.56-18-12.23-29.54-12.23c-11.53,0-21.98,4.68-29.54,12.23c-7.56,7.56-12.23,18-12.23,29.54 c0,11.53,4.68,21.98,12.23,29.54c7.56,7.56,18,12.23,29.54,12.23c11.53,0,21.98-4.68,29.54-12.23c7.56-7.56,12.23-18,12.23-29.54 C102.91,49.91,98.23,39.46,90.67,31.9L90.67,31.9z" fill="currentColor"/>
                              </svg>
                              <span>{t('do_not_dry_clean')}</span>
                            </div>
                          </div>

                          {/* Additional Care Note */}
                          <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary inline mr-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('care_instructions_note')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Product Features */}
              {getTranslatedFeatures().length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <button
                    onClick={() => toggleAccordion('features')}
                    className="flex w-full justify-between items-center text-left"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span className="font-medium text-gray-900">{t('product_features')}</span>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 transition-transform ${openAccordion === 'features' ? 'transform rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'features' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {getTranslatedFeatures().map((feature, index) => (
                            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mr-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-medium rounded-full">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-grow">
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Returns & Exchanges */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <button
                  onClick={() => toggleAccordion('returns')}
                  className="flex w-full justify-between items-center text-left"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                    <span className="font-medium text-gray-900">{t('returns_exchanges')}</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-500 transition-transform ${openAccordion === 'returns' ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openAccordion === 'returns' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4">
                        {/* Free Returns */}
                        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mr-4">
                            <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118.67 122.88" fill="currentColor">
                              <path d="M3.92,22.79C1.81,22.79,0,20.98,0,18.77c0-2.11,1.81-3.92,3.92-3.92h5.43c0.1,0,0.3,0,0.41,0c3.62,0.1,6.84,0.8,9.54,2.51 c3.01,1.91,5.22,4.82,6.43,9.15c0,0.1,0,0.2,0.1,0.3l1,4.03h19.02v7.83h-16.8l0,0l8.94,33.67h63.4l8.34-33.67h-9.85v-7.83h13.92 h0.96c2.21,0,3.92,1.81,3.92,3.92c0,0.41-0.11,0.8-0.2,1.21l-10.25,41.3c-0.4,1.81-2.01,3.01-3.81,3.01l0,0H40.09 c1.41,5.22,2.81,8.04,4.72,9.35c2.31,1.51,6.34,1.6,13.07,1.51h0.1l0,0h45.42c2.21,0,3.92,1.81,3.92,3.92 c0,2.21-1.8,3.92-3.92,3.92H57.98l0,0c-8.34,0.1-13.46-0.1-17.59-2.81c-4.22-2.81-6.43-7.64-8.64-16.38l0,0L18.29,28.83 c0-0.1,0-0.1-0.1-0.2c-0.6-2.21-1.6-3.72-3.01-4.52c-1.41-0.91-3.31-1.3-5.52-1.3c-0.1,0-0.2,0-0.3,0L3.92,22.79L3.92,22.79 L3.92,22.79L3.92,22.79z M72.92,1.07l16.26,13.35c1.99,1.6,2.31,4.53,0.71,6.52c-1.6,1.99-4.53,2.31-6.52,0.71l-8.77-7.3l0.01,26.2 c0,2.56-2.07,4.63-4.63,4.63c-2.55,0-4.63-2.07-4.63-4.63l-0.01-26.21l-8.78,7.3c-1.99,1.6-4.91,1.28-6.52-0.71 c-1.6-1.99-1.28-4.91,0.71-6.52L67.02,1.07l0.05-0.04c1.71-1.33,3.94-1.43,5.79,0L72.92,1.07L72.92,1.07L72.92,1.07z M81.49,58.08 c0-1.24,1.23-2.24,2.73-2.24c1.51,0,2.73,1,2.73,2.24v4.71c0,1.24-1.23,2.24-2.73,2.24c-1.51,0-2.73-1-2.73-2.24V58.08L81.49,58.08 L81.49,58.08z M65.12,58.08c0-1.24,1.23-2.24,2.73-2.24c1.51,0,2.73,1,2.73,2.24v4.71c0,1.24-1.23,2.24-2.73,2.24 c-1.51,0-2.73-1-2.73-2.24V58.08L65.12,58.08L65.12,58.08z M48.76,58.08c0-1.24,1.23-2.24,2.73-2.24c1.51,0,2.73,1,2.73,2.24v4.71 c0,1.24-1.23,2.24-2.73,2.24c-1.51,0-2.73-1-2.73-2.24V58.08L48.76,58.08L48.76,58.08z M91.64,103.58c5.33,0,9.65,4.32,9.65,9.65 s-4.32,9.65-9.65,9.65c-5.32,0-9.65-4.32-9.65-9.65S86.32,103.58,91.64,103.58L91.64,103.58L91.64,103.58L91.64,103.58z M49.34,103.58c5.32,0,9.65,4.32,9.65,9.65s-4.32,9.65-9.65,9.65s-9.65-4.32-9.65-9.65S44.01,103.58,49.34,103.58L49.34,103.58 L49.34,103.58L49.34,103.58z"/>
                            </svg>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{t('free_returns')}</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                              <li>• {t('return_within_days')}</li>
                              <li>• {t('free_returns_stores')}</li>
                              <li>• {t('items_must_be_unworn')}</li>
                            </ul>
                          </div>
                        </div>

                        {/* Exchanges */}
                        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{t('exchanges')}</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                              <li>• {t('exchange_size_color')}</li>
                              <li>• {t('subject_to_stock')}</li>
                              <li>• {t('visit_any_store_or_request_online')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <div className="border-b border-gray-200 mb-8">
            <h2 className="text-2xl font-prata text-secondary pb-4">{t('you_might_also_like')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductItem
                key={similarProduct._id}
                id={similarProduct._id}
                name={similarProduct.name}
                price={similarProduct.price}
                originalPrice={similarProduct.originalPrice}
                image={similarProduct.image}
                rating={similarProduct.rating}
                isNew={similarProduct.isNew}
                category={similarProduct.category}
                subCategory={similarProduct.subCategory}
                product={similarProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16">
        <ReviewSection productId={productId} />
      </div>
    </div>
  );
};

export default Product;