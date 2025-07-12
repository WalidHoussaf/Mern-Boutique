import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { ShopContext } from '../context/ShopContext';

const ProductItem = ({ id, image, name, price, originalPrice, isNew = false, rating, category, showRemoveButton = false }) => {
  const { currency, navigate, addToCart, addToWishlist, isInWishlist, convertPrice } = useContext(ShopContext);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Format price helper function to handle currency conversion
  const formatPrice = (priceValue) => {
    if (typeof priceValue !== 'number' || isNaN(priceValue)) {
      return `${currency}0.00`;
    }
    
    const convertedPrice = convertPrice(priceValue);
    
    // Format the price based on the currency
    if (currency === 'MAD') {
      // For Moroccan Dirham, 2 decimal places and currency after the number
      return `${convertedPrice.toFixed(2)} ${currency}`;
    } else {
      // For other currencies, 2 decimal places
      return `${currency}${convertedPrice.toFixed(2)}`;
    }
  };
  
  // Enhanced rating normalization to ensure it's a number and is between 0-5
  const normalizedRating = (() => {
    // Try to convert to a number if it's a string, or use 0 if it's undefined/null
    let numRating = 0;
    
    if (rating !== undefined && rating !== null) {
      if (typeof rating === 'string') {
        numRating = parseFloat(rating) || 0;
      } else if (typeof rating === 'number') {
        numRating = rating;
      }
    }
    
    // Clamp between 0 and 5
    return Math.max(0, Math.min(5, numRating));
  })();

  // Calculate if there's a meaningful discount (original price > current price and not 0)
  // Ensure originalPrice is valid and higher than the current price
  const hasDiscount = originalPrice && 
                     typeof originalPrice === 'number' && 
                     !isNaN(originalPrice) && 
                     originalPrice > price && 
                     originalPrice > 0 && 
                     (originalPrice - price) > 0.01;

  // Calculate discount percentage when there's a valid discount
  const discountPercentage = hasDiscount ? 
    Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleProductClick = () => {
    window.scrollTo(0, 0);
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(id, 1);
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToWishlist(id);
    return false;
  };

  // Normalize image data to handle different formats
  let imageUrl = '/images/p_img1.png'; // Default to a real product image
  let secondaryImage = null;
  
  if (image) {
    if (Array.isArray(image) && image.length > 0) {
      // If image is an array with content, use the first item
      imageUrl = image[0];
      // Store secondary image if available
      if (image.length > 1) {
        secondaryImage = image[1];
      }
    } else if (typeof image === 'string') {
      // If image is a string, use it directly
      imageUrl = image;
    } else if (typeof image === 'object' && !Array.isArray(image)) {
      // If image is an object (but not an array), try to find a usable URL
      if (image.url) {
        imageUrl = image.url;
      } else if (image.src) {
        imageUrl = image.src;
      } else if (image.path) {
        imageUrl = image.path;
      } else if (image.uri) {
        imageUrl = image.uri;
      }
    }
  }
  
  // For products from the database, check if we need to prepend the API URL
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
    imageUrl = `/${imageUrl}`; // Add leading slash if missing
  }
  
  // Do the same for secondary image
  if (secondaryImage && !secondaryImage.startsWith('http') && !secondaryImage.startsWith('data:') && !secondaryImage.startsWith('/')) {
    secondaryImage = `/${secondaryImage}`;
  }
  
  // Check if product is in wishlist
  const wishlisted = isInWishlist(id);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {isNew && (
          <span className="bg-green-500 text-white text-xs font-medium py-1 px-2.5 rounded-full shadow-sm flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
            New Arrival
          </span>
        )}
      </div>

      {/* Discount Badge */}
      {hasDiscount && discountPercentage > 0 && (
        <div className="absolute bottom-3 right-3 z-20">
          <span className="bg-primary/70 backdrop-blur-sm text-white text-xs font-medium py-1 px-2.5 rounded-md shadow-sm">
            -{discountPercentage}%
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 z-50" onClick={(e) => e.stopPropagation()}>
        {wishlisted && showRemoveButton ? (
          <button 
            className="bg-white/70 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-full shadow-md flex items-center text-xs font-medium"
            onClick={handleWishlistClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        ) : (
          <button 
            className={`p-1.5 rounded-full shadow-sm transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 ${
              wishlisted 
                ? 'bg-red-500 opacity-100' 
                : 'bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-white'
            }`}
            onClick={handleWishlistClick}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-all duration-300 ${
                wishlisted ? 'text-white' : 'text-gray-600 hover:text-red-500'
              }`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Product Image */}
      <div
        className="relative overflow-hidden cursor-pointer aspect-[4/5] bg-gray-100"
        onClick={handleProductClick}
      >
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Primary Image */}
        <img
          className={`w-full h-full transition-opacity duration-1000 ease-out z-10 relative ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            objectPosition: 'center top',
            objectFit: 'cover',
            minWidth: '100%',
            minHeight: '100%'
          }}
          src={!imgError ? imageUrl : '/images/p_img1.png'}
          alt={name || 'Product Image'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        
        {/* Secondary Image */}
        {secondaryImage && (
          <img
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              objectPosition: 'center top',
              objectFit: 'cover',
              minWidth: '100%',
              minHeight: '100%'
            }}
            src={secondaryImage}
            alt={`${name} - alternate view`}
            onError={() => {}}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        )}
        
        {/* Overlay with Quick Actions */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-6 z-20"
        >
          <div className="w-full flex justify-center items-center space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 delay-100">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick();
              }}
              className="w-full text-white text-sm font-medium bg-primary hover:bg-primary/90 py-3 px-4 rounded-lg transition-colors shadow-lg transform hover:-translate-y-1 hover:shadow-xl duration-300"
            >
              Quick View
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5" onClick={handleProductClick}>
        {/* Category & Rating */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1">
            <p className="text-xs font-medium text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full">
              {category}
            </p>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }, (_, index) => {
                // Calculate if this star should be filled based on the normalized rating
                const filled = index < Math.floor(normalizedRating);
                // For half stars (e.g. 3.5 would have 3 full stars and 1 half star)
                const halfFilled = !filled && index < normalizedRating;
                
                return (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
            </div>
            <span className="ml-1.5 text-xs font-medium text-gray-700">
              {normalizedRating ? normalizedRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
        
        {/* Product Name */}
        <h3 
          className="font-medium text-gray-800 group-hover:text-primary transition-colors duration-300 mb-1 line-clamp-2 h-12 hover:underline cursor-pointer"
        >
          {name}
        </h3>
        
        {/* Price Display Section */}
        <div className="flex items-end mt-2">
          {/* Regular Price */}
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(price)}
          </p>
          
          {/* Original Price (only shown for discounted items) */}
          {originalPrice && originalPrice > price && originalPrice > 0 && (
            <p className="text-sm text-gray-500 line-through ml-2 mb-0.5">
              {formatPrice(originalPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ProductItem.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.object
  ]),
  name: PropTypes.string.isRequired,
  price: PropTypes.number,
  originalPrice: PropTypes.number,
  isNew: PropTypes.bool,
  rating: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  category: PropTypes.string,
  subCategory: PropTypes.string,
  showRemoveButton: PropTypes.bool
};

export default ProductItem;