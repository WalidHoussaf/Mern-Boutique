import { useState, useEffect, useRef } from 'react';
import useTranslation from '../utils/useTranslation';
import axios from 'axios';

const TestimonialCard = ({ review, t }) => {
  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  // Format date based on language
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(t('language_code') === 'fr' ? 'fr-FR' : 'en-US', options);
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-6 flex flex-col relative">
      {/* Verified badge if applicable */}
      {review.verifiedPurchase && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-50 rounded-full px-2 py-1 flex items-center">
            <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span className="text-xs font-medium text-green-700">{t('verified_purchase')}</span>
          </div>
        </div>
      )}
      
      {/* Header with user info */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-4">
          <img
            src={review.user.profileImage}
            alt={review.user.name}
            className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
          />
        </div>
        <div className="text-left">
          <h3 className="text-base font-prata text-secondary">{review.user.name}</h3>
          <div className="flex items-center flex-wrap mt-1 text-xs text-gray-500">
            {review.user.profession && (
              <>
                <span>{review.user.profession}</span>
                {review.user.location && <span className="mx-1">•</span>}
              </>
            )}
            {review.user.location && <span>{review.user.location}</span>}
          </div>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex space-x-1 mb-3">
        {renderStars(review.rating)}
      </div>
      
      {/* Review text */}
      <div className="flex-grow mb-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-5">
          "{review.comment}"
        </p>
      </div>
      
      {/* Product info */}
      <div className="text-left text-sm border-t border-gray-100 pt-3 mt-auto">
        <div className="mb-1">
          <span className="text-gray-600 font-medium">{t('purchased')} </span>
          <span className="font-medium text-primary">{review.product?.name || ''}</span>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(review.createdAt)}
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [visiblePage, setVisiblePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Fetch reviews with high ratings (4 or 5 stars) and include product details
        const { data } = await axios.get('/api/products/reviews/featured');
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter reviews based on selection
  const filteredReviews = selectedFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating >= parseInt(selectedFilter));
    
  // How many reviews to show per page
  const reviewsPerPage = 2;
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  
  // Get current page reviews
  const getCurrentPageReviews = () => {
    const startIndex = visiblePage * reviewsPerPage;
    return filteredReviews.slice(startIndex, startIndex + reviewsPerPage);
  };

  // Auto-rotate pages
  useEffect(() => {
    if (!isPaused && filteredReviews.length > reviewsPerPage) {
      intervalRef.current = setInterval(() => {
        setVisiblePage((prev) => (prev + 1) % totalPages);
      }, 8000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visiblePage, isPaused, totalPages, filteredReviews.length]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setVisiblePage(0); // Reset to first page when changing filters
  };

  const handleDotClick = (page) => {
    setVisiblePage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show the section if there are no reviews
  }

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#015A89,transparent_70%)] opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#77513B,transparent_70%)] opacity-5"></div>
      </div>
      
      {/* Inner content container */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="text-center mb-8 relative">
          {/* Decorative badge */}
          <div className="flex justify-center mb-2">
            <span className="flex items-center px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
              <span className="text-xs font-medium tracking-wide text-primary uppercase">{t('customerStories')}</span>
            </span>
          </div>
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-prata text-secondary mb-3">
            {t('whatCustomersSay')}
          </h2>
          
          {/* Divider */}
          <div className="relative py-4 flex justify-center items-center mb-4">
            <div className="w-16 h-[2px] bg-primary"></div>
            <div 
              className="absolute w-2.5 h-2.5 rounded-full bg-primary"
              style={{
                animation: 'slide 3s ease-in-out infinite',
                transform: 'translateX(-50%)',
              }}
            ></div>
          </div>

          <style>{`
            @keyframes slide {
              0%, 100% {
                left: calc(50% - 32px);
              }
              50% {
                left: calc(50% + 32px);
              }
            }
          `}</style>
        </div>
        
        {/* Filter buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('allReviews')}
          </button>
          <button
            onClick={() => handleFilterChange('5')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === '5'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('fiveStars')}
          </button>
          <button
            onClick={() => handleFilterChange('4')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === '4'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('fourPlusStars')}
          </button>
        </div>

        {/* Reviews grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {getCurrentPageReviews().map((review) => (
            <TestimonialCard key={review._id} review={review} t={t} />
          ))}
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === visiblePage ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials; 