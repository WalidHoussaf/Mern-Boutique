import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

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
    "$": 1,      // USD (base currency)
    "€": 0.93,   // EUR
    "£": 0.79,   // GBP
    "MAD": 10.1  // Moroccan Dirham
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Configure axios to include credentials with each request
  useEffect(() => {
    // Set default axios configurations
    // Use the Vite proxy configuration to avoid CORS issues (no need for VITE_API_URL)
    axios.defaults.withCredentials = true;
    
    // Set up axios interceptor to add auth token to requests
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          try {
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser && parsedUser.token) {
              // Set the Authorization header for every request
              config.headers.Authorization = `Bearer ${parsedUser.token}`;
              console.log('Added token to request:', parsedUser.token.substring(0, 10) + '...');
            } else {
              console.warn('User info found in localStorage but no token available');
            }
          } catch (error) {
            console.error('Error parsing user info from localStorage:', error);
          }
        } else {
          console.log('No user info in localStorage, request will proceed without auth token');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Also set the default Authorization header if user is already in state
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      console.log('Set default Authorization header with token:', user.token.substring(0, 10) + '...');
    }
    
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [user]);

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/products');
        if (response.status === 200) {
          const data = response.data;
          console.log('API Response:', data); // Debug log
          
          // Check if data is an array or has a products property
          if (Array.isArray(data)) {
            console.log(`Setting ${data.length} products from array`);
            setAllProducts(data);
          } else if (data.products && Array.isArray(data.products)) {
            console.log(`Setting ${data.products.length} products from data.products`);
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
          console.log(`Refreshed ${data.length} products`);
          setAllProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          console.log(`Refreshed ${data.products.length} products`);
          setAllProducts(data.products);
        } else {
          console.error('Unexpected data format from API during refresh:', data);
        }
      } else {
        console.error('Failed to refresh products:', response.status);
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      toast.error('Failed to refresh product data');
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
          toast.error('Failed to load wishlist');
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
      toast.error("Please select a size", {
        position: "bottom-right",
        autoClose: 3000
      });
      return false;
    }
    
    const itemKey = getCartItemKey(productId, size);
    
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
      
      toast.info(`Item removed from cart`);
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
      toast.info("Please log in to add items to your wishlist");
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
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      let errorMessage = 'Failed to add item to wishlist';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Please log in to add items to your wishlist';
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
      toast.info("Please log in to manage your wishlist");
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
      
      toast.info("Removed from wishlist");
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      let errorMessage = 'Failed to remove item from wishlist';
      
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
      toast.info("Please log in to manage your wishlist");
      return;
    }
    
    setWishlistLoading(true);
    try {
      await axios.delete('/api/wishlist');
      
      // Clear local state
      setWishlistItems({});
      toast.info("Wishlist cleared");
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
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
      console.log('Login successful, setting user with token:', userData.token.substring(0, 10) + '...');
      
      // Set user in state
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/');
    } else {
      console.error('Login failed: No token received in userData:', userData);
      toast.error('Authentication failed: No token received');
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
      
      toast.info('You have been logged out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server request fails
      setUser(null);
      localStorage.removeItem('user');
      setWishlistItems({});
      toast.info('You have been logged out');
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
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
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
        toast.error('You must be logged in to place an order');
        navigate('/login?redirect=place-order');
        throw new Error('Authentication required');
      }
      
      const response = await axios.post('/api/orders', orderData, config);
      toast.success('Order placed successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
        const errorMessage = error.response.data.message || 'Failed to place order';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to place order. Network error or server is down.');
      }
      throw error;
    }
  };

  // Fetch user's orders
  const fetchUserOrders = async () => {
    if (!user) return [];
    
    try {
      setOrdersLoading(true);
      const response = await axios.get('/api/orders/myorders');
      
      // Set the orders in context state
      setOrders(response.data);
      
      // Return the data for direct use
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
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
      toast.error('Failed to load order details');
      throw error;
    }
  };

  // Update order to paid
  const updateOrderToPaid = async (orderId, paymentResult) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/pay`, paymentResult);
      toast.success('Payment processed successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to process payment');
      throw error;
    }
  };

  // Load currency from localStorage on initial load and save it when it changes
  useEffect(() => {
    // Load on initial render
    const storedCurrency = localStorage.getItem('currency');
    console.log('ShopContext: Loading currency from localStorage:', storedCurrency);
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }

    // This function will be called whenever currency changes
    const saveCurrency = () => {
      console.log('ShopContext: Saving currency to localStorage:', currency);
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
    
    console.log(`Converting price ${price} USD to ${targetCurrency}`);
    
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
    console.log(`ShopContext: updateCurrency called with ${newCurrency}`);
    
    // Validate currency
    if (!['$', '€', '£', 'MAD'].includes(newCurrency)) {
      console.error(`Invalid currency: ${newCurrency}, defaulting to $`);
      newCurrency = '$';
    }
    
    // Update local storage directly
    localStorage.setItem('currency', newCurrency);
    
    // Update state
    setCurrency(newCurrency);
    
    console.log(`ShopContext: Currency updated to ${newCurrency}`);
    return newCurrency;
  };

  // Update language with localStorage persistence
  const updateLanguage = (newLanguage) => {
    console.log(`ShopContext: updateLanguage called with ${newLanguage}`);
    
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
    
    console.log(`ShopContext: Language updated to ${newLanguage}`);
    return newLanguage;
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