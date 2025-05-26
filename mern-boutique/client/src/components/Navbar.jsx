import { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import './navbar.css'; // Add reference to CSS file for keyframes

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { setShowSearch, getCartCount, getWishlistCount, navigate, user, logout } = useContext(ShopContext);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleNavigation = (path) => {
    setVisible(false);
    setShowNotifications(false);
    navigate(path);
  };

  const handleNavLinkClick = () => {
    window.scrollTo(0, 0);
    setShowSearch(false);
  };

  // Sample notifications data
  const notifications = [
    { id: 1, type: 'info', message: 'New collection arrived!', time: '2 hours ago' },
    { id: 2, type: 'discount', message: '25% off on summer collection', time: '1 day ago' },
    { id: 3, type: 'shipping', message: 'Your order has been shipped', time: '3 days ago' }
  ];

  // Handle registration link separately from normal navigation
  const handleRegister = () => {
    setVisible(false);
    navigate('/login');
    // Set the login form to registration mode after navigation
    setTimeout(() => {
      const registerButton = document.querySelector('button.text-primary');
      if (registerButton && registerButton.textContent.includes('Sign Up')) {
        registerButton.click();
      }
    }, 100);
  };

  // Get wishlist count
  const wishlistCount = getWishlistCount();

  return (
    <>
      {/* Add a spacer to account for the fixed navbar */}
      <div className={`${scrolled ? 'h-[50px]' : 'h-[65px]'}`}></div>
      
      {/* SVG Definitions for gold gradients */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="20%" stopColor="#FCF6BA" />
            <stop offset="40%" stopColor="#B38728" />
            <stop offset="60%" stopColor="#FBF5B7" />
            <stop offset="80%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#FCF6BA" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled 
          ? 'bg-gradient-to-r from-white/85 via-white/80 to-white/85 backdrop-blur-sm shadow-md py-2 border-b border-primary/10' 
          : 'bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-sm py-3'}`}>
        
        {/* Decorative accent line with animation */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse"></div>
        
        {/* Golden geometric patterns - keeping only the triangle patterns */}
        <div className="gold-triangle-pattern absolute top-5 left-1/4"></div>
        <div className="gold-triangle-pattern absolute top-5 right-1/4"></div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 relative">
          {/* Logo with subtle animation - removing gold sparkles */}
          <div 
            onClick={() => handleNavigation('/')} 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-md relative"
          >
            <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-all duration-500"></div>
            <img src={assets.logo} className="w-32 relative z-10" alt="Boutique Logo" />
          </div>

          {/* Navigation Links with improved indicators */}
          <ul className="hidden md:flex gap-8 text-sm text-gray-700 font-semibold">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">Home</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/collection" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">Collection</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">About</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">Contact</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            {/* Wishlist link with counter */}
            <NavLink 
              to="/wishlist" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary' : ''}`}
              onClick={handleNavLinkClick}
            >
              <div className="flex items-center gap-1">
                <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">Wishlist</p>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 gold-heart">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-r from-red-500 to-red-600 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                        {wishlistCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            
            {/* New Categories dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 group-hover:text-primary uppercase tracking-wide transition-colors duration-300">
                Categories
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
              
              {/* Enhanced Categories dropdown menu */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute left-0 pt-6 transition-all duration-300 z-50 w-[280px] translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-100/80 overflow-hidden animate-dropdown">
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-4 border-b border-gray-100/80">
                    <h3 className="font-medium text-primary text-sm uppercase tracking-wide">Shop by Category</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-0.5 p-2">
                    <NavLink 
                      to="/collection?category=Women" 
                      className="flex flex-col items-center p-3 hover:bg-primary/5 rounded-md transition-all duration-200 group/item"
                      onClick={handleNavLinkClick}
                    >
                      <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform">
                        <img src={assets.woman_icon} alt="Women" className="w-7 h-7 object-contain woman-icon" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">Women</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Men" 
                      className="flex flex-col items-center p-3 hover:bg-primary/5 rounded-md transition-all duration-200 group/item"
                      onClick={handleNavLinkClick}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform">
                        <img src={assets.man_icon} alt="Men" className="w-7 h-7 object-contain man-icon" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">Men</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Kids" 
                      className="flex flex-col items-center p-3 hover:bg-primary/5 rounded-md transition-all duration-200 group/item"
                      onClick={handleNavLinkClick}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform">
                        <img src={assets.kids_icon} alt="Kids" className="w-7 h-7 object-contain kids-icon" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">Kids</span>
                    </NavLink>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-gray-100/80">
                    <NavLink 
                      to="/collection"
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                      onClick={handleNavLinkClick}
                    >
                      <span>View All Categories</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </ul>

          {/* Search, Notifications, Profile, Cart, and Menu with enhanced styling */}
          <div className="flex items-center gap-7">
            {/* Search Icon - Enhanced design */}
            <div 
              onClick={() => setShowSearch(true)} 
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </div>
            </div>

            {/* New Notification Bell */}
            <div className="relative group z-50">
              <div 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
                  </svg>
                  <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                </div>
                <span className="absolute -right-1 -top-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-white z-20"></span>
              </div>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  {/* Overlay to catch clicks outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100/80 overflow-hidden transition-all duration-300 transform origin-top-right animate-dropdown z-50">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/20 py-3 px-4">
                      <h3 className="font-medium text-primary text-sm uppercase tracking-wide gold-gradient">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-100/80">
                      {notifications.map(note => (
                        <div key={note.id} className="p-3 hover:bg-primary/5 cursor-pointer transition-colors duration-200">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                              note.type === 'info' ? 'bg-blue-100 text-blue-500' : 
                              note.type === 'discount' ? 'bg-green-100 text-green-500' : 
                              'bg-primary/10 text-primary'
                            }`}>
                              {note.type === 'info' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                                </svg>
                              )}
                              {note.type === 'discount' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.25 0 012 15.25v-8.5A2.75 2.25 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                                </svg>
                              )}
                              {note.type === 'shipping' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">{note.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50/50 text-center">
                      <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown with Enhanced Login/Register Design */}
            <div className="group relative z-50">
              <div className="relative cursor-pointer group">
                <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                  <img className="w-5 h-5" src={assets.profile_icon} alt="Profile" />
                  <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                </div>
              </div>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-0 pt-4 z-50 translate-y-2 group-hover:translate-y-0">
                {user ? (
                  <div className="flex flex-col w-48 overflow-hidden rounded-lg shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100/80">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/20 py-3 px-5">
                      <p className="font-medium text-primary text-center">{user.name}</p>
                    </div>
                    <div className="py-2 px-3">
                      <div onClick={() => handleNavigation('/profile')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                          </svg>
                        </span>
                        <p className="text-sm">My Profile</p>
                      </div>
                      <div onClick={() => handleNavigation('/orders')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M2 4.5A2.25 2.25 0 014.5 2h11a2.25 2.25 0 010 5h-11A2.25 2.25 0 012 4.5zM2.75 9.083a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 12.663a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 16.25a.75.75 0 000 1.5h14.5a.75.75 0 100-1.5H2.75z" />
                          </svg>
                        </span>
                        <p className="text-sm">My Orders</p>
                      </div>
                      
                      {user.isAdmin && (
                        <div onClick={() => handleNavigation('/admin/dashboard')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center bg-purple-100 rounded-full text-purple-600 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                            </svg>
                          </span>
                          <p className="text-sm">Admin Dashboard</p>
                        </div>
                      )}
                      
                      <div onClick={() => handleNavigation('/settings')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <p className="text-sm">Settings</p>
                      </div>
                      <div onClick={logout} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <p className="text-sm">Logout</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-60 overflow-hidden rounded-lg shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100/80 transform origin-top-right animate-dropdown">
                    <div className="bg-gradient-to-r from-purple-500/10 to-primary/20 py-3 px-5">
                      <h3 className="font-medium text-primary text-center text-sm uppercase tracking-wide gold-gradient">Account Access</h3>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-3">
                      <div 
                        onClick={() => handleNavigation('/login')} 
                        className="cursor-pointer py-2.5 px-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-md transition-all duration-300 hover:shadow-md hover:from-primary/90 hover:to-primary flex items-center justify-center gap-2 text-sm group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                        </svg>
                        Login
                      </div>
                      
                      <div className="relative">
                        <hr className="border-t border-gray-200/80 my-1" />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 px-3 text-xs text-gray-400">or</span>
                      </div>
                      
                      <div 
                        onClick={handleRegister} 
                        className="cursor-pointer py-2.5 px-4 bg-white border border-primary/20 text-primary rounded-md transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 text-sm group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
                          <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
                        </svg>
                        Create Account
                      </div>
                      
                      <p className="text-xs text-center text-gray-500 px-2 mt-1">Join our community for exclusive offers and faster checkout</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Icon with enhanced animation */}
            <div onClick={() => handleNavigation('/cart')} className="relative cursor-pointer group">
              <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                <img src={assets.cart_icon} className="w-5 h-5" alt="Cart" />
                <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </div>
              {getCartCount() > 0 && (
                <div className="absolute -right-1.5 -top-1.5 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-primary to-primary/90 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                    {getCartCount()}
                  </span>
                </div>
              )}
            </div>

            {/* Menu Icon for Mobile with improved styling */}
            <div className="md:hidden relative group">
              <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <div onClick={() => setVisible(true)} className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                <img src={assets.menu_icon} className="w-5 h-5" alt="Menu" />
                <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for Mobile Screens - removing golden accent line */}
        <div className={`fixed top-0 right-0 h-full z-50 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out ${visible ? 'w-72' : 'w-0'}`}>
          <div className="flex flex-col text-gray-700 h-full relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-purple-500/40 to-primary/30"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-purple-500/40 to-primary/30"></div>
            <div className="absolute -left-24 top-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/5 blur-3xl"></div>
            <div className="absolute -right-24 bottom-1/4 w-48 h-48 rounded-full bg-gradient-to-tl from-primary/10 to-purple-500/5 blur-3xl"></div>
            
            {/* Golden decorative elements - keeping only triangles */}
            <div className="gold-triangle-pattern absolute top-20 left-6"></div>
            <div className="gold-triangle-pattern absolute bottom-40 right-6"></div>
            
            {/* Header with logo and close button */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/80 bg-gradient-to-r from-white/40 to-primary/5 relative z-10">
              <img src={assets.logo} className="w-28" alt="Boutique Logo" />
              <button 
                onClick={() => setVisible(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile navigation links with enhanced styling */}
            <div className="py-4 px-3 relative z-10">
              <div onClick={() => handleNavigation('/')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                  <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                </svg>
                <p className="uppercase font-medium group-hover:text-primary transition-colors">Home</p>
              </div>
              <div onClick={() => handleNavigation('/collection')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                  <path d="M2.97 1.35A1 1 0 013.73 1h8.54a1 1 0 01.76.35l2.609 3.044A1.5 1.5 0 0116.5 5.5v9.64a1 1 0 01-1 1H4.5a1 1 0 01-1-1V5.5a1.5 1.5 0 01.859-1.356L2.97 1.35zM6.5 7a1 1 0 100 2h3a1 1 0 100-2h-3zm0 4a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                </svg>
                <p className="uppercase font-medium group-hover:text-primary transition-colors">Collection</p>
              </div>
              <div onClick={() => handleNavigation('/about')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                <p className="uppercase font-medium group-hover:text-primary transition-colors">About</p>
              </div>
              <div onClick={() => handleNavigation('/contact')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.879a1.5 1.5 0 011.11.502l1.022 1.132a.75.75 0 00.555.251h7.179a1.5 1.5 0 011.5 1.5v1.836a1.5 1.5 0 01-.459 1.077l-5.547 5.114a1.5 1.5 0 01-2.037 0l-5.57-5.114A1.5 1.5 0 012 7.3V3.5zm3.94 1a.75.75 0 00-1.371.61l5.393 5.254a.75.75 0 001.06 0l5.377-5.255a.75.75 0 00-1.379-.609l-4.596 1.82a.75.75 0 01-.554 0l-3.93-1.82zm5.56 7a.75.75 0 01.76.019l5.5 3.5a.75.75 0 01-.76 1.412l-5.5-3.5a.75.75 0 010-1.431zm-7.5 1.5a.75.75 0 01.658-.359l3.5.5a.75.75 0 01.591.976l-1 3a.75.75 0 01-1.422-.474l.48-1.442-3.158-.316a.75.75 0 01-.649-.885z" clipRule="evenodd" />
                </svg>
                <p className="uppercase font-medium group-hover:text-primary transition-colors">Contact</p>
              </div>
              
              {/* New wishlist link for mobile */}
              <div onClick={() => handleNavigation('/wishlist')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <div className="relative mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 gold-heart">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-r from-red-500 to-red-600 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                        {wishlistCount}
                      </span>
                    </div>
                  )}
                </div>
                <p className="uppercase font-medium group-hover:text-primary transition-colors">Wishlist</p>
              </div>
              
              {/* Conditional user menu items */}
              {user ? (
                <>
                  <div onClick={() => handleNavigation('/orders')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                    <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                      <path d="M2 4.5A2.25 2.25 0 014.5 2h11a2.25 2.25 0 010 5h-11A2.25 2.25 0 012 4.5zM2.75 9.083a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 12.663a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 16.25a.75.75 0 000 1.5h14.5a.75.75 0 100-1.5H2.75z" />
                    </svg>
                    <p className="uppercase font-medium group-hover:text-primary transition-colors">My Orders</p>
                  </div>
                  
                  <div onClick={() => handleNavigation('/profile')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                    <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                    <p className="uppercase font-medium group-hover:text-primary transition-colors">My Profile</p>
                  </div>
                  
                  {user.isAdmin && (
                    <div onClick={() => handleNavigation('/admin/dashboard')} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                      <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-600 mr-2">
                        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                      </svg>
                      <p className="uppercase font-medium group-hover:text-primary transition-colors">Admin Dashboard</p>
                    </div>
                  )}
                  
                  <div onClick={logout} className="py-3 border-b border-gray-100/80 flex items-center group cursor-pointer px-2 rounded-md hover:bg-primary/5 transition-all duration-300">
                    <span className="w-1 h-5 bg-gradient-to-b from-primary/40 to-purple-500/80 rounded mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                    <p className="uppercase font-medium group-hover:text-primary transition-colors">Logout</p>
                  </div>
                </>
              ) : (
                <div className="py-4 border-b border-gray-100/80">
                  <div className="flex flex-col gap-3 px-2">
                    <div 
                      onClick={() => handleNavigation('/login')} 
                      className="cursor-pointer py-2 px-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-md transition-all duration-300 hover:shadow-md hover:from-primary/90 hover:to-primary flex items-center justify-center gap-2 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                      </svg>
                      Login
                    </div>
                    
                    <div 
                      onClick={handleRegister} 
                      className="cursor-pointer py-2 px-3 bg-white border border-primary/20 text-primary rounded-md transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 text-sm group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
                        <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
                      </svg>
                      Create Account
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Categories Dropdown for Mobile */}
            <div className="py-3 border-b border-gray-100/80">
              <div className="px-2 rounded-md mb-2 group cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                  <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0110 18.25v-5.764a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
                </svg>
                <p className="uppercase font-medium text-primary">Categories</p>
              </div>
              <div className="grid grid-cols-3 gap-2 px-2 mt-3">
                <div onClick={() => handleNavigation('/collection?category=Women')} className="group cursor-pointer p-3 rounded-md hover:bg-primary/5 transition-all duration-300 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <img src={assets.woman_icon} alt="Women" className="w-6 h-6 object-contain woman-icon" />
                  </div>
                  <p className="text-sm group-hover:text-primary transition-colors font-medium">Women</p>
                </div>
                
                <div onClick={() => handleNavigation('/collection?category=Men')} className="group cursor-pointer p-3 rounded-md hover:bg-primary/5 transition-all duration-300 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <img src={assets.man_icon} alt="Men" className="w-6 h-6 object-contain man-icon" />
                  </div>
                  <p className="text-sm group-hover:text-primary transition-colors font-medium">Men</p>
                </div>
                
                <div onClick={() => handleNavigation('/collection?category=Kids')} className="group cursor-pointer p-3 rounded-md hover:bg-primary/5 transition-all duration-300 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <img src={assets.kids_icon} alt="Kids" className="w-6 h-6 object-contain kids-icon" />
                  </div>
                  <p className="text-sm group-hover:text-primary transition-colors font-medium">Kids</p>
                </div>
              </div>
              
              <div className="mt-3 px-2">
                <div onClick={() => handleNavigation('/collection')} className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors bg-primary/5 rounded-md">
                  <span>View All Categories</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Footer section with gradient and enhanced styling */}
            <div className="mt-auto">
              {/* Social media links */}
              <div className="flex justify-center gap-4 py-4">
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 1-.923-1.417A3.911 3.911 0 0 1 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
              </div>
            
              <div className="bg-gradient-to-b from-white/60 to-primary/10 p-5">
                <p className="text-sm text-gray-600 text-center">© 2024 Boutique. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overlay when sidebar is open */}
        {visible && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in"
            onClick={() => setVisible(false)}
          ></div>
        )}
      </div>
    </>
  );
};

export default Navbar; 