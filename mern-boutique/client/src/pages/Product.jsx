import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ProductItem from '../components/ProductItem';
import useTranslation from '../utils/useTranslation';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { allProducts, loading, addToCart, addToWishlist, isInWishlist, currency, convertPrice, navigate, refreshProducts } = useContext(ShopContext);
  const { t } = useTranslation();
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
        toast.error('Failed to load product details');
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
      toast.error('Please select a size', {
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
    
    if (product) {
      const success = addToCart(product._id, quantity, selectedSize);
      
      if (success) {
        setAddedToCart(true);
        toast.success(`${product.name} (Size: ${selectedSize}) added to your cart!`, {
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
              <h1 className="text-2xl md:text-3xl font-prata text-secondary mb-4">{product?.name}</h1>
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
            <div className="text-gray-600 mb-8">
              <p>{product?.description}</p>
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
                  {product?.countInStock > 0 ? t('in_stock').replace('{count}', product.countInStock) : t('out_of_stock')}
                  {product?.countInStock > 0 && (
                    <span className="ml-1 text-gray-500">
                      ({product.countInStock} {t('units')})
                    </span>
                  )}
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
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
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
                ))}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 rounded-lg shadow-sm flex items-center justify-center text-base font-medium transition-colors ${
                addedToCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {addedToCart ? (
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
              {/* Shipping Info */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="flex w-full justify-between items-center text-left"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="font-medium text-gray-900">{t('shipping_info')}</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-500 transition-transform ${openAccordion === 'shipping' ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
                              <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6L18 6L18 18L6 18L6 6Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M8 12C8 10.3431 9.34315 9 11 9H13C14.6569 9 16 10.3431 16 12" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M9 15H15" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                              <span>{t('hand_wash')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6L18 6L18 18L6 18L6 6Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                              <span>{t('do_not_bleach')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6L18 6L18 18L6 18L6 6Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M9 14L12 8L15 14" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                              <span>{t('iron_at')}</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M8 8L16 16" stroke="currentColor" strokeWidth="1.5"/>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;