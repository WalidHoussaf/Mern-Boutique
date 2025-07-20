import { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import './navbar.css';
import useTranslation from '../utils/useTranslation';
import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { setShowSearch, getCartCount, getWishlistCount, navigate, user, logout } = useContext(ShopContext);
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

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
        
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 relative">
          {/* Logo with subtle animation */}
          <div 
            onClick={() => handleNavigation('/')} 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-md relative"
          >
            <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-all duration-500"></div>
            <img src={assets.logo} className="w-32 relative z-10" alt="Boutique Logo" />
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex gap-8 text-sm text-gray-700 font-semibold">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary nav-link-active' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">{t('home')}</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/collection" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary nav-link-active' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">{t('collection')}</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary nav-link-active' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">{t('about')}</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary nav-link-active' : ''}`}
              onClick={handleNavLinkClick}
            >
              <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">{t('contact')}</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
            </NavLink>
            {/* Wishlist link with counter */}
            <NavLink 
              to="/wishlist" 
              className={({ isActive }) => `relative group ${isActive ? 'text-primary nav-link-active' : ''}`}
              onClick={handleNavLinkClick}
            >
              <div className="flex items-center gap-1">
                <p className="group-hover:text-primary uppercase tracking-wide transition-colors duration-300">{t('wishlist')}</p>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 gold-heart">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                      <span className="animate-ping absolute flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative flex rounded-full h-3.5 w-3.5 bg-gradient-to-r from-primary to-primary/90 text-[9px] font-bold text-white items-center justify-center shadow-sm">
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
                {t('categories')}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-all duration-300 group-hover:w-full w-0"></span>
              
              {/* Categories dropdown menu */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute left-0 pt-6 transition-all duration-300 z-50 w-[280px] translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-100/80 overflow-hidden animate-dropdown">
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-4 border-b border-gray-100/80">
                    <h3 className="font-medium text-primary text-sm uppercase tracking-wide">{t('shop_by_category')}</h3>
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
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">{t('women')}</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Men" 
                      className="flex flex-col items-center p-3 hover:bg-primary/5 rounded-md transition-all duration-200 group/item"
                      onClick={handleNavLinkClick}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform">
                        <img src={assets.man_icon} alt="Men" className="w-7 h-7 object-contain man-icon" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">{t('men')}</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Kids" 
                      className="flex flex-col items-center p-3 hover:bg-primary/5 rounded-md transition-all duration-200 group/item"
                      onClick={handleNavLinkClick}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform">
                        <img src={assets.kids_icon} alt="Kids" className="w-7 h-7 object-contain kids-icon" />
                      </div>
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">{t('kids')}</span>
                    </NavLink>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-gray-100/80">
                    <NavLink 
                      to="/collection"
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                      onClick={handleNavLinkClick}
                    >
                      <span>{t('view_all_categories')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </ul>

          {/* Search, Notifications, Cart, Profile*/}
          <div className="flex items-center gap-7">
            {/* Search Icon */}
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

            {/* Notification Bell */}
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
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-white z-20"></span>
                )}
              </div>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  {/* Overlay to catch clicks outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <NotificationCenter onClose={() => setShowNotifications(false)} />
                </>
              )}
            </div>

            {/* Cart Icon */}
            <div onClick={() => handleNavigation('/cart')} className="relative cursor-pointer group">
              <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                <img src={assets.cart_icon} className="w-5 h-5 primary-icon" alt="Cart" />
                <span className="absolute -bottom-1 -left-1 -right-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </div>
              {getCartCount() > 0 && (
                <div className="absolute -right-1.5 -top-1.5 flex items-center justify-center">
                  <span className="animate-ping absolute flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative flex rounded-full h-4 w-4 bg-gradient-to-r from-primary to-primary/90 text-[9px] font-bold text-white items-center justify-center shadow-sm">
                    {getCartCount()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <div className="group relative z-50">
              <div className="relative cursor-pointer group">
                <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="relative z-10 flex items-center justify-center w-9 h-9 group-hover:text-primary transition-colors">
                  {user?.profileImage ? (
                    <img 
                      className="w-7 h-7 rounded-full object-cover border border-gray-200"
                      src={user.profileImage}
                      alt={user.name || "User Profile"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.profile_icon;
                        e.target.className = "w-5 h-5 primary-icon";
                      }}
                    />
                  ) : (
                    <img className="w-5 h-5 primary-icon" src={assets.profile_icon} alt="Profile" />
                  )}
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
                        <p className="text-sm">{t('my_profile')}</p>
                      </div>
                      <div onClick={() => handleNavigation('/orders')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M2 4.5A2.25 2.25 0 014.5 2h11a2.25 2.25 0 010 5h-11A2.25 2.25 0 012 4.5zM2.75 9.083a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 12.663a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 16.25a.75.75 0 000 1.5h14.5a.75.75 0 100-1.5H2.75z" />
                          </svg>
                        </span>
                        <p className="text-sm">{t('my_orders')}</p>
                      </div>
                      
                      {user.isAdmin && (
                        <div onClick={() => handleNavigation('/admin/dashboard')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center bg-purple-100 rounded-full text-purple-600 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                            </svg>
                          </span>
                          <p className="text-sm">{t('admin_dashboard')}</p>
                        </div>
                      )}
                      
                      <div onClick={() => handleNavigation('/settings')} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <p className="text-sm">{t('settings')}</p>
                      </div>
                      <div onClick={logout} className="cursor-pointer py-2 px-3 hover:bg-primary/5 rounded-md transition-colors duration-300 flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-primary text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <p className="text-sm">{t('logout')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-60 overflow-hidden rounded-lg shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100/80 transform origin-top-right animate-dropdown">
                    <div className="bg-gradient-to-r from-purple-500/10 to-primary/20 py-3 px-5">
                      <h3 className="font-medium text-primary text-center text-sm uppercase tracking-wide gold-gradient">{t('account_access')}</h3>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-3">
                      <div 
                        onClick={() => handleNavigation('/login')} 
                        className="cursor-pointer py-2.5 px-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-md transition-all duration-300 hover:shadow-md hover:from-primary/90 hover:to-primary flex items-center justify-center gap-2 text-sm group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                        </svg>
                        {t('login')}
                      </div>
                      
                      <div className="relative">
                        <hr className="border-t border-gray-200/80 my-1" />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 px-3 text-xs text-gray-400">{t('or')}</span>
                      </div>
                      
                      <div 
                        onClick={handleRegister} 
                        className="cursor-pointer py-2.5 px-4 bg-white border border-primary/20 hover:border-primary/40 text-primary rounded-md transition-all duration-300 hover:shadow-sm flex items-center justify-center gap-2 text-sm group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
                          <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
                        </svg>
                        {t('create_account')}
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {t('join_community')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 