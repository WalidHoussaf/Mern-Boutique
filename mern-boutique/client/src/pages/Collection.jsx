import { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { assets } from '../assets/assets';
import useTranslation from '../utils/useTranslation';

// Quick filter presets with SVG icons
const FILTER_PRESETS = [
  { 
    name: "fresh_finds", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    category: "All", 
    sort: "newest" 
  },
  { 
    name: "power_dressing", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    category: "Women", 
    subCategory: "Topwear" 
  },
  { 
    name: "urban_explorer", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    category: "Men", 
    subCategory: "Topwear" 
  },
  { 
    name: "cozy_luxe", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12l-5-5m5 5l5-5m-5 5v-10m0 10l-5 5m5-5l5 5m-5-5h10m-10 0h-10" />
      </svg>
    ),
    category: "All", 
    subCategory: "Winterwear" 
  }
];

// Sorting options
const SORTING_OPTIONS = [
  { value: 'newest', label: 'newest_first', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )},
  { value: 'price-asc', label: 'price_low_to_high', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  )},
  { value: 'price-desc', label: 'price_high_to_low', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  )},
  { value: 'rating-desc', label: 'rating_high_to_low', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )},
  { value: 'name-asc', label: 'name_a_to_z', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  )}
];

const Collection = () => {
  const { allProducts, loading } = useContext(ShopContext);
  const { t } = useTranslation();
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState('categories');
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [isSortingOpen, setIsSortingOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const initialRender = useRef(true);
  const productsContainerRef = useRef(null);
  const filterContainerRef = useRef(null);

  // Creative category display names mapping
  const CATEGORY_DISPLAY_NAMES = {
    'All': t('all_collections'),
    'Women': t('femme_edit'),
    'Men': t('gents_showcase'),
    'Kids': t('little_trendsetters')
  };

  // Creative subcategory display names mapping
  const SUBCATEGORY_DISPLAY_NAMES = {
    'All': t('all_styles'),
    'Topwear': t('statement_tops'),
    'Bottomwear': t('signature_bottoms'),
    'Winterwear': t('seasonal_layers')
  };
  
  // Handle scroll for sticky filter and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      if (!filterContainerRef.current) return;
      
      const filterRect = filterContainerRef.current.getBoundingClientRect();
      const isSticky = filterRect.top <= 20;
      
      if (isSticky !== isFilterSticky) {
        setIsFilterSticky(isSticky);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFilterSticky]);

  // On first render, set the initial category from URL - but only once
  useEffect(() => {
    // Only run this effect once on initial render
    if (initialRender.current) {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      const subCategoryParam = params.get('subcategory');
      
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
      
      if (subCategoryParam) {
        setSelectedSubCategory(subCategoryParam);
      }
      
      initialRender.current = false;
    }
  // Run this effect only once when component mounts
  }, []);

  // Extract unique categories from products
  const categories = ['All', ...new Set(allProducts
    .filter(product => product && product.category)
    .map(product => product.category))]
    .filter(category => category === 'All' || category === 'Women' || category === 'Men' || category === 'Kids');
    
  // Extract unique subcategories based on selected category
  const subCategories = ['All', ...new Set(allProducts
    .filter(product => product && product.subCategory && 
      (selectedCategory === 'All' || product.category === selectedCategory))
    .map(product => product.subCategory))];
    
  // Display categories with proper capitalization
  const displayCategories = categories;

  // Update filtered products when allProducts changes or when the selected category/subcategory changes
  useEffect(() => {
    // Only update products when allProducts change but keep the current category
    let filtered;
    
    if (selectedCategory === 'All') {
      filtered = [...allProducts];
    } else {
      // Filter by category
      filtered = allProducts.filter(product => {
        if (!product || !product.category) return false;
        
        // Case-insensitive exact match for categories
        return product.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }
    
    // Further filter by subcategory if one is selected
    if (selectedSubCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.subCategory === selectedSubCategory
      );
    }
    
    // Apply sorting based on the selected sort option
    filtered = sortProducts(filtered, sortOption);
    
    setDisplayedProducts(filtered);
  }, [allProducts, selectedCategory, selectedSubCategory, sortOption]);

  // Sort products function
  const sortProducts = (products, option) => {
    const sorted = [...products];
    
    switch (option) {
      case 'newest':
        // First sort by isNew (true values come first)
        sorted.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          
          // Then sort by createdAt date if both have the same isNew value
          // For createdAt, we need to handle both Date objects and strings
          const dateA = a.createdAt ? new Date(a.createdAt) : a.date ? new Date(a.date) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : b.date ? new Date(b.date) : new Date(0);
          
          // Sort newest to oldest
          return dateB - dateA;
        });
        break;
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'rating-desc':
        sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'name-asc':
        sorted.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });
        break;
      default:
        // Default to newest first
        sorted.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          
          const dateA = a.createdAt ? new Date(a.createdAt) : a.date ? new Date(a.date) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : b.date ? new Date(b.date) : new Date(0);
          
          return dateB - dateA;
        });
    }
    
    return sorted;
  };

  // Handle sort option selection
  const handleSortChange = (option) => {
    setSortOption(option);
    setIsSortingOpen(false);
    
    // Fade out products before re-sorting
    if (productsContainerRef.current) {
      productsContainerRef.current.style.opacity = '0';
      
      // Show products after a short delay
      setTimeout(() => {
        if (productsContainerRef.current) {
          productsContainerRef.current.style.opacity = '1';
        }
      }, 300);
    }
  };

  // Replace the handleCategoryClick function with this direct approach
  const handleCategoryClick = (category) => {
    // Immediately hide the products container
    if (productsContainerRef.current) {
      productsContainerRef.current.style.opacity = '0';
    }

    // Update URL with category
    let params = new URLSearchParams(window.location.search);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Reset subcategory when changing category
    setSelectedSubCategory('All');
    params.delete('subcategory');
    
    // Update URL
    window.history.replaceState(null, '', `/collection${params.toString() ? `?${params.toString()}` : ''}`);

    // Directly set the selected category
    setSelectedCategory(category);
    setActivePreset(null);

    // Show products after a short delay
    setTimeout(() => {
      if (productsContainerRef.current) {
        productsContainerRef.current.style.opacity = '1';
      }
    }, 300);
  };
  
  // Handle subcategory selection
  const handleSubCategoryClick = (subCategory) => {
    // Immediately hide the products container
    if (productsContainerRef.current) {
      productsContainerRef.current.style.opacity = '0';
    }

    // Update URL with subcategory
    let params = new URLSearchParams(window.location.search);
    if (subCategory === 'All') {
      params.delete('subcategory');
    } else {
      params.set('subcategory', subCategory);
    }
    
    // Update URL
    window.history.replaceState(null, '', `/collection${params.toString() ? `?${params.toString()}` : ''}`);

    // Directly set the selected subcategory
    setSelectedSubCategory(subCategory);
    setActivePreset(null);

    // Show products after a short delay
    setTimeout(() => {
      if (productsContainerRef.current) {
        productsContainerRef.current.style.opacity = '1';
      }
    }, 300);
  };
  
  // Handle filter preset selection
  const handlePresetClick = (preset, index) => {
    // Immediately hide the products container
    if (productsContainerRef.current) {
      productsContainerRef.current.style.opacity = '0';
    }
    
    // Update category and subcategory
    setSelectedCategory(preset.category);
    setSelectedSubCategory(preset.subCategory || 'All');
    setActivePreset(index);
    
    // Update URL
    let params = new URLSearchParams();
    if (preset.category !== 'All') {
      params.set('category', preset.category);
    }
    if (preset.subCategory && preset.subCategory !== 'All') {
      params.set('subcategory', preset.subCategory);
    }
    
    window.history.replaceState(null, '', `/collection${params.toString() ? `?${params.toString()}` : ''}`);
    
    // Show products after a short delay
    setTimeout(() => {
      if (productsContainerRef.current) {
        productsContainerRef.current.style.opacity = '1';
      }
    }, 300);
  };
  
  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Check if we have no results
  const hasNoResults = displayedProducts.length === 0;

  // Get display name for a category
  const getCategoryDisplayName = (category) => {
    return CATEGORY_DISPLAY_NAMES[category] || category;
  };
  
  // Get display name for a subcategory
  const getSubCategoryDisplayName = (subCategory) => {
    return SUBCATEGORY_DISPLAY_NAMES[subCategory] || subCategory;
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-prata text-secondary mb-3">{t('our_collection')}</h1>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          {t('browse_collection_description')}
        </p>
      </div>

      {/* Quick Filter Presets */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">{t('style_categories')}</h2>
        <div className="flex flex-wrap gap-3">
          {FILTER_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset, index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activePreset === index
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30 shadow-sm'
              }`}
            >
              {preset.icon}
              {t(preset.name)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left side - Filters */}
        <div 
          ref={filterContainerRef} 
          className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start lg:h-fit"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        >
          {/* Enhanced Filter Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-secondary">
                {t('style_navigator')}
              </h2>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="text-sm flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
              >
                {isFilterOpen ? (
                  <>
                    <span>{t('hide_filters')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>{t('show_filters')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            {isFilterOpen && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
                {/* Gradient top border */}
                <div className="h-1 bg-gradient-to-r from-primary via-primary/40 to-primary"></div>
                
                <div className="p-6">
                  {/* Expandable Category Filter */}
                  <div className="mb-6 border-b border-gray-100 pb-6">
                    <button 
                      onClick={() => toggleSection('categories')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {t('fashion_worlds')}
                        </h3>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'categories' ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedSection === 'categories' && (
                      <div className="space-y-2 animate-fadeIn">
                        {displayCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                              selectedCategory === category
                                ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary-800 font-medium border-l-4 border-primary pl-4'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`mr-3 ${selectedCategory === category ? 'text-primary' : 'text-gray-400'}`}>
                                {category === 'All' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                  </svg>
                                ) : category === 'Women' ? (
                                  <img src={assets.woman_icon} alt="Women" className={`h-5 w-5 object-contain ${selectedCategory === category ? '' : 'opacity-60 filter grayscale'}`} />
                                ) : category === 'Men' ? (
                                  <img src={assets.man_icon} alt="Men" className={`h-5 w-5 object-contain ${selectedCategory === category ? '' : 'opacity-60 filter grayscale'}`} />
                                ) : (
                                  <img src={assets.kids_icon} alt="Kids" className={`h-5 w-5 object-contain ${selectedCategory === category ? '' : 'opacity-60 filter grayscale'}`} />
                                )}
                              </span>
                              {getCategoryDisplayName(category)}
                            </div>
                            {selectedCategory === category && (
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Expandable Subcategory Filter - Only show if a category is selected */}
                  {selectedCategory !== 'All' && subCategories.length > 1 && (
                    <div className="mb-6 border-b border-gray-100 pb-6">
                      <button 
                        onClick={() => toggleSection('subcategories')}
                        className="w-full flex items-center justify-between mb-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {t('style_categories')}
                          </h3>
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'subcategories' ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedSection === 'subcategories' && (
                        <div className="space-y-2 animate-fadeIn">
                          {subCategories.map((subCategory) => (
                            <button
                              key={subCategory}
                              onClick={() => handleSubCategoryClick(subCategory)}
                              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                                selectedSubCategory === subCategory
                                  ? 'bg-gradient-to-r from-secondary/20 to-secondary/5 text-secondary-800 font-medium border-l-4 border-secondary pl-4'
                                  : 'hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`mr-3 ${selectedSubCategory === subCategory ? 'text-secondary' : 'text-gray-400'}`}>
                                  {subCategory === 'All' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                  ) : subCategory === 'Topwear' ? (
                                    <img src={assets.tshirt_icon} alt="T-shirt" className={`h-5 w-5 object-contain ${selectedSubCategory === subCategory ? '' : 'opacity-60 filter grayscale'}`} />
                                  ) : subCategory === 'Bottomwear' ? (
                                    <img src={assets.pants_icon} alt="Pants" className={`h-5 w-5 object-contain ${selectedSubCategory === subCategory ? '' : 'opacity-60 filter grayscale'}`} />
                                  ) : subCategory === 'Winterwear' ? (
                                    <img src={assets.jacket_icon} alt="Jacket" className={`h-5 w-5 object-contain ${selectedSubCategory === subCategory ? '' : 'opacity-60 filter grayscale'}`} />
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </span>
                                {getSubCategoryDisplayName(subCategory)}
                              </div>
                              {selectedSubCategory === subCategory && (
                                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Sorting Section */}
                  <div className="mb-6 border-b border-gray-100 pb-6">
                    <button 
                      onClick={() => toggleSection('sorting')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {t('sort_products')}
                        </h3>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === 'sorting' ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedSection === 'sorting' && (
                      <div className="space-y-2 animate-fadeIn">
                        {SORTING_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                              sortOption === option.value
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-800 font-medium border-l-4 border-amber-500 pl-4'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`mr-3 ${sortOption === option.value ? 'text-amber-500' : 'text-gray-400'}`}>
                                {option.icon}
                              </span>
                              {t(option.label)}
                            </div>
                            {sortOption === option.value && (
                              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Empty State Guidance */}
                  {hasNoResults && (
                    <div className="bg-red-50 rounded-lg p-4 mb-6 animate-fadeIn">
                      <h4 className="text-sm font-medium text-red-800 mb-1">
                        {t('no_products_found')}
                      </h4>
                      <p className="text-xs text-red-600 mb-3">
                        {t('try_removing_filters')}
                      </p>
                      <button
                        onClick={() => {
                          handleCategoryClick('All');
                          setSelectedSubCategory('All');
                        }}
                        className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        {t('clear_all_filters')}
                      </button>
                    </div>
                  )}
                  
                  {/* Active Filters Display */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {t('active_filters')}:
                      </span>
                      {selectedCategory !== 'All' && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary animate-fadeIn"
                          style={{ animationDuration: '300ms' }}
                        >
                          {getCategoryDisplayName(selectedCategory)}
                          <button 
                            onClick={() => handleCategoryClick('All')}
                            className="ml-1 text-primary hover:text-primary-dark transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {selectedSubCategory !== 'All' && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary animate-fadeIn" 
                          style={{ animationDuration: '400ms' }}
                        >
                          {getSubCategoryDisplayName(selectedSubCategory)}
                          <button 
                            onClick={() => handleSubCategoryClick('All')}
                            className="ml-1 text-secondary hover:text-secondary-dark transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {activePreset !== null && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 animate-fadeIn"
                          style={{ animationDuration: '500ms' }}
                        >
                          <span className="mr-1">{FILTER_PRESETS[activePreset].icon}</span> {FILTER_PRESETS[activePreset].name}
                          <button 
                            onClick={() => {
                              handleCategoryClick('All');
                              setActivePreset(null);
                            }}
                            className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {selectedCategory === 'All' && selectedSubCategory === 'All' && activePreset === null && (
                        <span className="text-sm text-gray-400 italic">
                          {t('none')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Products */}
        <div className="lg:col-span-3">
          {/* Product Count Display with sort dropdown on mobile */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <span className="inline-flex items-center px-5 py-2 bg-gray-100 rounded-full text-sm text-gray-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>
                {t('showing')} <span className="font-semibold text-primary mx-1">{displayedProducts.length}</span> {t('pieces')}
              </span>
              {selectedCategory !== 'All' && (
                <span>&nbsp;{t('in')} <span className="font-semibold text-primary">{getCategoryDisplayName(selectedCategory)}</span></span>
              )}
              {selectedSubCategory !== 'All' && (
                <span>&nbsp;/ <span className="font-semibold text-secondary">{getSubCategoryDisplayName(selectedSubCategory)}</span></span>
              )}
            </span>
            
            {/* Mobile Sort Dropdown */}
            <div className="relative lg:hidden">
              <button 
                onClick={() => setIsSortingOpen(!isSortingOpen)}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  {SORTING_OPTIONS.find(opt => opt.value === sortOption)?.icon}
                  <span className="ml-2">{t(SORTING_OPTIONS.find(opt => opt.value === sortOption)?.label || '')}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 text-gray-500 transition-transform ${isSortingOpen ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isSortingOpen && (
                <div className="absolute right-0 z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn">
                  <div className="p-2">
                    {SORTING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors ${
                          sortOption === option.value
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-3">{option.icon}</span>
                        {t(option.label)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="relative mb-4 px-4 md:px-10 py-8 rounded-2xl overflow-hidden">
              {/* Decorative backgrounds for skeleton loading */}
              <div className="absolute inset-0 bg-gray-50/80 rounded-2xl -z-10"></div>
              <div className="absolute inset-0 shadow-inner rounded-2xl -z-10"></div>
              
              {/* Skeleton Loading UI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div 
              ref={productsContainerRef}
              className="relative mb-4 px-4 md:px-10 py-8 rounded-2xl overflow-hidden transition-opacity duration-500"
            >
              {/* Decorative backgrounds for grid section */}
              <div className="absolute inset-0 bg-gray-50/80 rounded-2xl -z-10"></div>
              <div className="absolute inset-0 opacity-10 -z-10">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#015A89,transparent_70%)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#77513B,transparent_70%)]"></div>
              </div>
              <div className="absolute inset-0 opacity-5 pattern-dots pattern-gray-500 pattern-size-2 -z-10"></div>
              
              {/* Subtle shadow around grid area */}
              <div className="absolute inset-0 shadow-inner rounded-2xl -z-10"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((product, index) => (
                    <div 
                      key={product._id} 
                      className="opacity-0 animate-fadeIn transition-all duration-500 ease-out"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <ProductItem
                        id={product._id}
                        name={product.name || 'Product Name'}
                        price={product.price || 0}
                        originalPrice={product.originalPrice && product.originalPrice > 0 ? product.originalPrice : undefined}
                        image={product.image || []}
                        rating={product.rating || 0}
                        isNew={product.isNew || false}
                        category={product.category || 'Uncategorized'}
                        subCategory={product.subCategory || ''}
                        product={product}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="mx-auto w-24 h-24 mb-6 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">
                      {t('no_products_found_with_current_filters')}
                    </p>
                    <button 
                      onClick={() => handleCategoryClick('All')}
                      className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                    >
                      {t('view_all_collections')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll to top button */}
      {scrollPosition > 500 && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all z-50 animate-fadeIn"
          aria-label={t('scroll_to_top')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 111.414 1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Collection; 