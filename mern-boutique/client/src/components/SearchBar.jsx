import { useContext, useState, useRef, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

const MobileSearchBar = () => {
  const { navigate } = useContext(ShopContext);
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 40) {
        setVisible(false); // scrolling down
      } else {
        setVisible(true); // scrolling up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/collection?search=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`block md:hidden w-full px-3 mt-2 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-20'} sticky top-0 z-30`}
    >
      <div className="flex items-center w-full bg-white/70 border border-gray-300 rounded-xl shadow-sm px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
        <svg className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
        </svg>
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-500 py-0.5"
          placeholder={t('search')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
};

const SearchBar = () => {
  const { showSearch, setShowSearch, allProducts, navigate, currency } = useContext(ShopContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSearch]);

  // Auto-focus input
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showSearch]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowSearch(false);
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setShowSearch]);

  // Filter products
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const timer = setTimeout(() => {
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filteredProducts.slice(0, 6));
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, allProducts]);

  const handleResultClick = (productId, productName) => {
    saveRecentSearch(productName);
    setQuery('');
    setShowSearch(false);
    navigate(`/product/${productId}`);
  };

  const saveRecentSearch = (term) => {
    const searches = [...new Set([term, ...recentSearches])].slice(0, 5);
    setRecentSearches(searches);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim() && results.length > 0) {
      handleResultClick(results[0]._id, results[0].name);
    } else if (query.trim()) {
      saveRecentSearch(query);
      setShowSearch(false);
      navigate(`/collection?search=${encodeURIComponent(query)}`);
    }
  };

  if (typeof window !== 'undefined' && window.innerWidth < 768 && !showSearch) {
    return <MobileSearchBar />;
  }

  if (!showSearch) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 z-50"
    >
      <motion.div 
        ref={searchRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl mx-4 border border-white/20"
      >
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="p-6 border-b border-gray-100/80">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products, categories, brands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-none outline-none px-2 py-2 text-gray-800 bg-transparent text-xl placeholder:text-gray-400 font-light"
                autoComplete="off"
              />
              
              {loading && (
                <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
              )}
              
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="ml-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
        
        <div className="max-h-[70vh] overflow-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* Recent searches section */}
            {!query && recentSearches.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 border-b border-gray-100/80"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-gray-50 hover:bg-primary/5 text-gray-700 rounded-xl text-sm cursor-pointer transition-all duration-300 hover:shadow-md flex items-center group"
                    >
                      <span className="mr-2 text-primary group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {term}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Loading state */}
            {loading && query && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center text-gray-500 flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mb-4"></div>
                <p className="text-lg font-light">Searching for products...</p>
              </motion.div>
            )}
            
            {/* Search results */}
            {!loading && results.length > 0 && (
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-gray-100/80"
              >
                {results.map((product, index) => (
                  <motion.li
                    key={product._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleResultClick(product._id, product.name)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-300 flex items-center group"
                  >
                    <div className="w-16 h-20 mr-4 overflow-hidden rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300">
                      <img 
                        src={product.image?.[0] || 'https://via.placeholder.com/150'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">{product.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-white bg-primary/90 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                        {product.isNew && (
                          <span className="text-xs font-medium text-white bg-green-500/90 px-3 py-1 rounded-full">New</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-auto flex flex-col items-end">
                      <div className="font-semibold text-primary px-4 py-2 bg-primary/10 rounded-xl">
                        {currency}{product.price?.toFixed(2)}
                      </div>
                      {product.rating && (
                        <div className="flex items-center mt-2 text-amber-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-1 text-sm">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 text-gray-400 group-hover:text-primary transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
            
            {/* No results state */}
            {!loading && query && results.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-12 text-center"
              >
                <div className="mb-6">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                  >
                    {/* Light blue background circle */}
                    <circle cx="40" cy="40" r="40" fill="#E6F3F7" />
                    
                    {/* Magnifying glass with exclamation */}
                    <g transform="translate(16, 16)">
                      <circle cx="22" cy="22" r="18" stroke="#0077B6" strokeWidth="4" fill="none"/>
                      <path d="M35 35L45 45" stroke="#0077B6" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M22 16V24" stroke="#0077B6" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="22" cy="28" r="2" fill="#0077B6"/>
                    </g>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try a different search term or browse our collections</p>
                <button 
                  onClick={() => {
                    setShowSearch(false);
                    navigate('/collection');
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Browse Collections
                </button>
              </motion.div>
            )}
            
            {/* Initial state hint */}
            {!query && results.length === 0 && recentSearches.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-12 text-center"
              >
                <p className="text-lg text-gray-600 mb-6">Popular Searches</p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {['Dresses', 'Accessories', 'New Arrivals', 'Summer Collection'].map((term, index) => (
                    <motion.div 
                      key={term}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setQuery(term.toLowerCase())}
                      className="px-4 py-3 bg-gray-50 hover:bg-primary/5 rounded-xl text-gray-700 cursor-pointer transition-all duration-300 hover:shadow-md group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{term}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-4 bg-gray-50/80 border-t border-gray-100/80 text-xs text-gray-500 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-primary mr-2">Pro tip:</span>
            Press <kbd className="px-2 py-1 bg-white rounded-lg shadow-sm border border-gray-200 mx-1.5 text-gray-700">Enter</kbd> to search
          </div>
          <div className="flex items-center">
            Press <kbd className="px-2 py-1 bg-white rounded-lg shadow-sm border border-gray-200 mx-1.5 text-gray-700">ESC</kbd> to close
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchBar; 