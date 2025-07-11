import { useState, useEffect, useRef } from 'react';
import useTranslation from '../utils/useTranslation';

// Enhanced testimonials with more detailed information and actual product names
const testimonials = [
  {
    id: 1,
    name: "Emily Johnson",
    role: "Fashion Blogger",
    location: "New York",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    text: "Boutique offers exceptional quality and timeless designs. Their pieces have become staples in my wardrobe that I reach for again and again. The attention to detail is impeccable.",
    rating: 5,
    productPurchased: "Ecru VOGUE sweatshirt",
    date: "March 15, 2023",
    isVerified: true
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Loyal Customer",
    location: "Chicago",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "I've been shopping at Boutique for over three years now. Their customer service is outstanding, and the clothing quality exceeds any other brand at this price point. Highly recommended!",
    rating: 5,
    productPurchased: "Cropped Faux Fur Effect Jacket",
    date: "January 22, 2023",
    isVerified: true
  },
  {
    id: 3,
    name: "Sophia Chen",
    role: "Style Consultant",
    location: "Los Angeles",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "As a style consultant, I regularly recommend Boutique to my clients. The versatility of their collections makes it easy to create countless stylish outfits that stand the test of time.",
    rating: 4,
    productPurchased: "Navy blue VOGUE sweatshirt",
    date: "February 8, 2023",
    isVerified: true
  },
  {
    id: 4,
    name: "Alexander Patel",
    role: "Fashion Photographer",
    location: "Miami",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    text: "The quality of Boutique's clothing photographs beautifully for my editorial work. The textures, colors, and silhouettes are all carefully considered. My clients are always impressed when I source from Boutique.",
    rating: 5,
    productPurchased: "Jacquard-Weave Jacket",
    date: "April 3, 2023",
    isVerified: true
  },
  {
    id: 5,
    name: "Olivia Martinez",
    role: "Corporate Executive",
    location: "Boston",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    text: "Boutique's professional collection has transformed my work wardrobe. The pieces are sophisticated yet comfortable enough for long days at the office. The compliments I receive are endless!",
    rating: 5,
    productPurchased: "Rib-Knit V-Neck Sweater",
    date: "May 12, 2023",
    isVerified: true
  },
  {
    id: 6,
    name: "David Wilson",
    role: "Lifestyle Influencer",
    location: "Seattle",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    text: "What sets Boutique apart is not just the quality of their clothing, but their commitment to sustainability. I love being able to promote a brand that aligns with my values while delivering exceptional style.",
    rating: 4,
    productPurchased: "Jean Straight Fit Blue",
    date: "June 19, 2023",
    isVerified: true
  }
];

const TestimonialCard = ({ testimonial, t }) => {
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

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-6 flex flex-col relative">
      {/* Verified badge if applicable */}
      {testimonial.isVerified && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-50 rounded-full px-2 py-1 flex items-center">
            <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span className="text-xs font-medium text-green-700">{t('verified')}</span>
          </div>
        </div>
      )}
      
      {/* Improved header with avatar and info side by side */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-4">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name} 
            className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
          />
        </div>
        <div className="text-left">
          <h3 className="text-base font-prata text-secondary">{testimonial.name}</h3>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>{testimonial.role}</span>
            <span className="mx-1">•</span>
            <span>{testimonial.location}</span>
          </div>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex space-x-1 mb-3">
        {renderStars(testimonial.rating)}
      </div>
      
      {/* Testimonial text - less truncated for clearer display */}
      <div className="flex-grow mb-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-5">
          "{testimonial.text}"
        </p>
      </div>
      
      {/* Product info in a clearer format */}
      <div className="text-left text-sm border-t border-gray-100 pt-3 mt-auto">
        <span className="text-gray-600 font-medium">{t('purchased')}</span>
        <span className="font-medium text-primary">{testimonial.productPurchased}</span>
        <div className="text-xs text-gray-500 mt-1">{testimonial.date}</div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [visiblePage, setVisiblePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  
  // Filter testimonials based on selection
  const filteredTestimonials = selectedFilter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.rating >= parseInt(selectedFilter));
    
  // How many testimonials to show per page
  const testimonialsPerPage = 2;
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);
  
  // Get current page testimonials
  const getCurrentPageTestimonials = () => {
    const startIndex = visiblePage * testimonialsPerPage;
    return filteredTestimonials.slice(startIndex, startIndex + testimonialsPerPage);
  };

  // Auto-rotate pages
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setVisiblePage((prev) => (prev + 1) % totalPages);
      }, 8000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visiblePage, isPaused, totalPages]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setVisiblePage(0); // Reset to first page when changing filters
  };

  const handleDotClick = (page) => {
    setVisiblePage(page);
  };

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
          
          {/* Simpler divider */}
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
        
        {/* Filter options */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white rounded-full p-0.5 shadow-sm">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                selectedFilter === 'all' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('allReviews')}
            </button>
            <button 
              onClick={() => handleFilterChange('5')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                selectedFilter === '5' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('fiveStars')}
            </button>
            <button 
              onClick={() => handleFilterChange('4')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                selectedFilter === '4' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('fourPlusStars')}
            </button>
          </div>
        </div>
        
        {/* Testimonial container with maximum width */}
        <div className="relative max-w-5xl mx-auto">
          {/* Page counter */}
          <div className="absolute top-[-20px] right-4 z-10">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {visiblePage + 1} / {totalPages}
            </span>
          </div>
          
          {/* Testimonials grid with increased spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {getCurrentPageTestimonials().map(testimonial => (
              <TestimonialCard 
                key={testimonial.id} 
                testimonial={testimonial} 
                t={t}
              />
            ))}
          </div>
          
          {/* Improved navigation */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            {/* Previous button */}
            <button 
              onClick={() => setVisiblePage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 transition-colors focus:outline-none"
              aria-label="Previous page"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Pause/Play button */}
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 transition-colors focus:outline-none"
              aria-label={isPaused ? "Resume automatic slideshow" : "Pause automatic slideshow"}
            >
              {isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            {/* Dots Indicators */}
            <div className="flex space-x-1.5">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-300 focus:outline-none ${
                    index === visiblePage 
                      ? 'w-6 h-1.5 bg-primary rounded-full' 
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400 rounded-full'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                />
              ))}
            </div>
            
            {/* Next button */}
            <button
              onClick={() => setVisiblePage((prev) => (prev + 1) % totalPages)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 transition-colors focus:outline-none"
              aria-label="Next page"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Compact CTA */}
        <div className="mt-6 text-center">
          <a 
            href="/reviews" 
            className="group inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {t('readMoreCustomerStories')}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 