import { useContext, useState, useRef, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';

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
        setRecentSearches(JSON.parse(saved).slice(0, 5)); // Keep only the 5 most recent
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Handle clicks outside the search component to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowSearch]);

  // Auto-focus input when search is shown
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [showSearch]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [setShowSearch]);

  // Filter products based on search query
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Simulate a slight delay to show loading state (like a real search)
    const timer = setTimeout(() => {
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filteredProducts.slice(0, 6)); // Limit to 6 results
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Navigate to product page when a result is clicked
  const handleResultClick = (productId, productName) => {
    // Save to recent searches
    saveRecentSearch(productName);
    
    setQuery('');
    setShowSearch(false);
    navigate(`/product/${productId}`);
  };

  // Save recent search
  const saveRecentSearch = (term) => {
    const searches = [...new Set([term, ...recentSearches])].slice(0, 5);
    setRecentSearches(searches);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  };

  // Clear all recent searches
  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim() && results.length > 0) {
      // Navigate to first result
      handleResultClick(results[0]._id, results[0].name);
    } else if (query.trim()) {
      // Save to recent searches even if no results
      saveRecentSearch(query);
      
      // Navigate to collection with search query
      setShowSearch(false);
      navigate(`/collection?search=${encodeURIComponent(query)}`);
    }
  };

  if (!showSearch) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in">
      <div 
        ref={searchRef}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-full max-w-xl mx-4 border border-gray-100 animate-dropdown"
      >
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center">
              {/* Search icon */}
              <div className="text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Search input */}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products, categories, brands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-none outline-none px-2 py-2 text-gray-800 bg-transparent text-lg placeholder:text-gray-400"
                autoComplete="off"
              />
              
              {/* Loading indicator */}
              {loading && (
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-2"></div>
              )}
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="ml-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
        
        {/* Search Results Area with enhanced styling */}
        <div className="max-h-80 overflow-auto custom-scrollbar">
          {/* Recent searches section */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100/80">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-500">Recent Searches</h3>
                <button 
                  onClick={clearRecentSearches}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <div 
                    key={index}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary/5 text-gray-700 rounded-full text-sm cursor-pointer transition-colors flex items-center"
                  >
                    <span className="mr-1 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {term}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {loading && query && (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin mb-3"></div>
              <p>Searching for products...</p>
            </div>
          )}
          
          {/* Search results */}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-100/80">
              {results.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleResultClick(product._id, product.name)}
                  className="p-4 hover:bg-primary/5 cursor-pointer transition-colors flex items-center group"
                >
                  {/* Product image with enhanced styling */}
                  <div className="w-14 h-14 mr-4 overflow-hidden rounded-lg shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                    <img 
                      src={product.image?.[0] || 'https://via.placeholder.com/150'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  </div>
                  
                  {/* Product details */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">{product.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-white bg-primary/80 px-2 py-0.5 rounded-full">{product.category}</span>
                      {product.isNew && (
                        <span className="text-xs text-white bg-green-500 px-2 py-0.5 rounded-full ml-2">New</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Price with badge styling */}
                  <div className="ml-auto flex flex-col items-end">
                    <p className="font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                      {currency}{product.price?.toFixed(2)}
                    </p>
                    {product.rating && (
                      <div className="flex items-center mt-1 text-amber-400 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="ml-2 text-gray-400 group-hover:text-primary transition-colors transform translate-x-0 group-hover:translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {/* No results state */}
          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 mx-auto">
                  <path d="M6.5 9a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a4 4 0 00-4 4 1 1 0 01-2 0 6 6 0 1111.874 1.355 1 1 0 01-1.731 1.003 4.002 4.002 0 00-4.143-6.358z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term or browse our collections</p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    setShowSearch(false);
                    navigate('/collection');
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Browse Collections
                </button>
              </div>
            </div>
          )}
          
          {/* Initial state hint */}
          {!query && results.length === 0 && recentSearches.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Type to search for products</p>
              <div className="mt-4 grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <div 
                  onClick={() => setQuery('dress')}
                  className="px-3 py-2 bg-gray-100 hover:bg-primary/5 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  Dresses
                </div>
                <div 
                  onClick={() => setQuery('accessories')}
                  className="px-3 py-2 bg-gray-100 hover:bg-primary/5 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  Accessories
                </div>
                <div 
                  onClick={() => setQuery('new')}
                  className="px-3 py-2 bg-gray-100 hover:bg-primary/5 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  New Arrivals
                </div>
                <div 
                  onClick={() => setQuery('summer')}
                  className="px-3 py-2 bg-gray-100 hover:bg-primary/5 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  Summer Collection
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with search tips */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
          <div>
            <span className="inline-block mr-2">Pro tip:</span>
            Press <kbd className="px-2 py-0.5 bg-white rounded border border-gray-200 mx-1 text-gray-600">Enter</kbd> to search
          </div>
          <div>
            <kbd className="px-2 py-0.5 bg-white rounded border border-gray-200 mx-1 text-gray-600">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 