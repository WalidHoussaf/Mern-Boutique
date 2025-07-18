import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getTranslation } from "../utils/translations";

export const ShopContext = createContext(null);

export const ShopContextProvider = (props) => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Initialize currency from localStorage if available
  const initialCurrency = localStorage.getItem('currency') || "$";
  const [currency, setCurrency] = useState(initialCurrency);
  
  // Initialize language from localStorage
  const initialLanguage = localStorage.getItem('language') || "en";
  const [language, setLanguage] = useState(initialLanguage);
  
  const [exchangeRates, setExchangeRates] = useState({
    "$": 1,      // USD
    "€": 0.93,   // EUR
    "£": 0.79,   // GBP
    "MAD": 10.1  // Moroccan Dirham
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    
    const setupAuthToken = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          if (parsedUser && parsedUser.token) {
            // Setting the Authorization header for every request
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          } else {
            console.warn('User info found in localStorage but no token available');
            // Clear invalid user data
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user info from localStorage:', error);
          // Clear invalid user data
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };

    // Initial setup
    setupAuthToken();
    
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // Refresh token setup on each request
        setupAuthToken();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/products');
        if (response.status === 200) {
          const data = response.data;
          
          // Check if data is an array or has a products property
          if (Array.isArray(data)) {
            setAllProducts(data);
          } else if (data.products && Array.isArray(data.products)) {
            setAllProducts(data.products);
          } else {
            console.error('Unexpected data format from API:', data);
            setAllProducts([]);
          }
        } else {
          console.error('Failed to fetch products:', response.status);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Create a function to refresh products
  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      if (response.status === 200) {
        const data = response.data;
        
        // Check if data is an array or has a products property
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        } else {
          console.error('Unexpected data format from API during refresh:', data);
        }
      } else {
        console.error('Failed to refresh products:', response.status);
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      toast.error(getTranslation('failed_refresh_products', language));
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist from the server when user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      
      setWishlistLoading(true);
      try {
        const response = await axios.get('/api/wishlist');
        if (response.data && response.data.products) {
          // Convert array from server to object format for consistency in our app
          const wishlistObj = {};
          response.data.products.forEach(item => {
            wishlistObj[item.product._id] = {
              productId: item.product._id,
              dateAdded: item.dateAdded,
              product: item.product // Store the full product data
            };
          });
          setWishlistItems(wishlistObj);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        // If unauthorized, the token might be expired - don't show any error
        if (error.response && error.response.status !== 401) {
          toast.error(getTranslation('failed_load_wishlist', language));
        }
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // Debug log whenever allProducts changes
  useEffect(() => {
    console.log(`ShopContext now has ${allProducts.length} products`);
  }, [allProducts]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (language !== initialLanguage) {
      localStorage.setItem('language', language);
    }
  }, [language, initialLanguage]);
  
  // Helper to generate a cart item key from productId and size
  const getCartItemKey = (productId, size) => {
    return `${productId}_${size}`;
  };

  // Parse cart item key to get productId and size
  const parseCartItemKey = (key) => {
    const [productId, size] = key.split('_');
    return { productId, size };
  };

  // Add to cart function
  const addToCart = (productId, quantity = 1, size) => {
    if (!size) {
      return false;
    }
    
    // Find the product
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
      toast.error(getTranslation('product_not_found', language));
      return false;
    }

    // Check if product is in stock
    if (product.countInStock <= 0) {
      toast.error(getTranslation('out_of_stock', language));
      return false;
    }

    const itemKey = getCartItemKey(productId, size);
    
    // Check if adding this quantity would exceed available stock
    const currentQuantity = cartItems[itemKey]?.quantity || 0;
    if (currentQuantity + quantity > product.countInStock) {
      toast.error(getTranslation('insufficient_stock', language).replace('{available}', product.countInStock));
      return false;
    }
    
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemKey]) {
        newCart[itemKey] = {
          ...newCart[itemKey],
          quantity: newCart[itemKey].quantity + quantity
        };
      } else {
        newCart[itemKey] = {
          productId,
          size,
          quantity
        };
      }
      
      return newCart;
    });
    
    return true;
  };

  // Remove from cart function
  const removeFromCart = (itemKey) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      delete newCart[itemKey];
      
      toast.info(getTranslation('item_removed_cart', language));
      return newCart;
    });
  };

  // Update cart quantity
  const updateCartQuantity = (itemKey, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemKey]) {
        newCart[itemKey] = {
          ...newCart[itemKey],
          quantity: newQuantity
        };
      }
      return newCart;
    });
  };

  // Get cart count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart total with currency conversion
  const getCartTotal = () => {
    return Object.entries(cartItems).reduce((total, [itemKey, item]) => {
      const product = allProducts.find(p => p._id === item.productId);
      if (product) {
        // Convert price to current currency
        const price = product.price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  // Wishlist functions
  const addToWishlist = async (productId) => {
    // Check if user is logged in
    if (!user) {
      toast.info(getTranslation('please_login_wishlist', language));
      navigate('/login?redirect=/product/' + productId);
      return;
    }
    
    // Check if product already in wishlist
    if (isInWishlist(productId)) {
      // If already in wishlist, remove it
      await removeFromWishlist(productId);
      return;
    }
    
    // Add to wishlist on the server
    setWishlistLoading(true);
    try {
      const response = await axios.post('/api/wishlist', { productId });
      
      if (response.data && response.data.products) {
        // Convert array from server to object format for consistency in our app
        const wishlistObj = {};
        response.data.products.forEach(item => {
          wishlistObj[item.product._id] = {
            productId: item.product._id,
            dateAdded: item.dateAdded,
            product: item.product // Store the full product data
          };
        });
        setWishlistItems(wishlistObj);
        toast.success(getTranslation('added_to_wishlist', language));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      let errorMessage = getTranslation('failed_add_wishlist', language);
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = getTranslation('please_login_wishlist', language);
          navigate('/login?redirect=/product/' + productId);
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const removeFromWishlist = async (productId) => {
    // Check if user is logged in
    if (!user) {
      toast.info(getTranslation('please_login_manage_wishlist', language));
      return;
    }
    
    setWishlistLoading(true);
    try {
      await axios.delete(`/api/wishlist/${productId}`);
      
      // Update local state
      setWishlistItems(prev => {
        const newWishlist = { ...prev };
        delete newWishlist[productId];
        return newWishlist;
      });
      
      toast.info(getTranslation('removed_from_wishlist', language));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      let errorMessage = getTranslation('failed_remove_wishlist', language);
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const clearWishlist = async () => {
    // Check if user is logged in
    if (!user) {
      toast.info(getTranslation('please_login_manage_wishlist', language));
      return;
    }
    
    setWishlistLoading(true);
    try {
      await axios.delete('/api/wishlist');
      
      // Clear local state
      setWishlistItems({});
      toast.info(getTranslation('wishlist_cleared', language));
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error(getTranslation('failed_clear_wishlist', language));
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const isInWishlist = (productId) => {
    return !!wishlistItems[productId];
  };
  
  const getWishlistCount = () => {
    return Object.keys(wishlistItems).length;
  };

  // Login function
  const login = (userData) => {
    // Make sure we're storing the token 
    if (userData && userData.token) {
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      toast.success(getTranslation('welcome_back', language).replace('{name}', userData.name));
      navigate('/');
    } else {
      console.error('Login failed: No token received in userData:', userData);
      toast.error(getTranslation('auth_failed_no_token', language));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Backend logout (optional - to invalidate token on server)
      // await axios.post('/api/users/logout');
      
      // Clear user data
      setUser(null);
      localStorage.removeItem('user');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear wishlist on logout
      setWishlistItems({});
      
      toast.info(getTranslation('logged_out', language));
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server request fails
      setUser(null);
      localStorage.removeItem('user');
      setWishlistItems({});
      toast.info(getTranslation('logged_out', language));
      navigate('/');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!user.token;
  };

  // Get user profile data
  const getUserProfile = async () => {
    if (!isAuthenticated()) {
      return null;
    }
    
    try {
      const response = await axios.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // If 401 Unauthorized, token might be expired - logout
      if (error.response && error.response.status === 401) {
        logout();
      }
      
      return null;
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem('cart');
  };

  // New method for creating an order
  const createOrder = async (orderData) => {
    try {
      // Ensure authentication headers are set
      const config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      } else {
        console.error('No authentication token available');
        toast.error(getTranslation('please_login_purchase', language));
        navigate('/login?redirect=place-order');
        throw new Error('Authentication required');
      }
      
      const response = await axios.post('/api/orders', orderData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      } else {
      }
      throw error;
    }
  };

  // Fetch user's orders
  const fetchUserOrders = async () => {
    if (!user || !user.token) return [];
    
    try {
      setOrdersLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const response = await axios.get('/api/orders/myorders', config);
      setOrders(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
      return [];
    } finally {
      setOrdersLoading(false);
    }
  };

  // Get a specific order by ID
  const getOrderById = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  };

  // Update order to paid
  const updateOrderToPaid = async (orderId, paymentResult) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/pay`, paymentResult);
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  // Load currency from localStorage on initial load and save it when it changes
  useEffect(() => {
    // Load on initial render
    const storedCurrency = localStorage.getItem('currency');
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }

    // This function will be called whenever currency changes
    const saveCurrency = () => {
      localStorage.setItem('currency', currency);
    };
    
    // Save whenever currency changes (skipped on initial render)
    if (currency !== initialCurrency) {
      saveCurrency();
    }
  }, [currency, initialCurrency]);

  // Function to convert price to the selected currency
  const convertPrice = (priceInUSD, targetCurrency = currency) => {
    if (!priceInUSD) return 0;
    
    // Make sure we have a valid number
    const price = Number(priceInUSD);
    if (isNaN(price)) return 0;
    
    // Use explicit conversion rates for each currency type
    if (targetCurrency === "$") {
      return price; // No conversion needed for USD
    } else if (targetCurrency === "€") {
      return price * 0.93; // Convert USD to EUR
    } else if (targetCurrency === "£") {
      return price * 0.79; // Convert USD to GBP
    } else if (targetCurrency === "MAD") {
      return price * 10.1; // Convert USD to MAD
    }
    
    // Fallback to using rates from the state
    const rate = exchangeRates[targetCurrency] || 1;
    return price * rate;
  };

  // Set a new currency with proper localStorage persistence
  const updateCurrency = (newCurrency) => {
    // Validate currency
    if (!['$', '€', '£', 'MAD'].includes(newCurrency)) {
      console.error(`Invalid currency: ${newCurrency}, defaulting to $`);
      newCurrency = '$';
    }
    
    // Update local storage directly
    localStorage.setItem('currency', newCurrency);
    
    // Update state
    setCurrency(newCurrency);
  };

  // Update language with localStorage persistence
  const updateLanguage = (newLanguage) => {
    // Validate language
    const validLanguages = ['en', 'fr'];
    if (!validLanguages.includes(newLanguage)) {
      console.error(`Invalid language: ${newLanguage}, defaulting to en`);
      newLanguage = 'en';
    }
    
    // Update local storage directly
    localStorage.setItem('language', newLanguage);
    
    // Update state
    setLanguage(newLanguage);
  };

  const contextValue = {
    allProducts,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartCount,
    getCartTotal,
    clearCart,
    loading,
    setLoading,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    wishlistLoading,
    showSearch,
    setShowSearch,
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    getUserProfile,
    navigate,
    getCartItemKey,
    parseCartItemKey,
    refreshProducts,
    orders,
    setOrders,
    ordersLoading,
    fetchUserOrders,
    getOrderById,
    updateOrderToPaid,
    createOrder,
    currency,
    setCurrency: updateCurrency,
    convertPrice,
    exchangeRates,
    language,
    setLanguage: updateLanguage
  };
  
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
}; 