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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleNavLinkClick = () => {
    window.scrollTo(0, 0);
    setShowSearch(false);
  };

  // Handle registration link separately from normal navigation
  const handleRegister = () => {
    setVisible(false);
    setMobileMenuOpen(false);
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
        
        {/* Mobile: Hamburger, Logo, Profile, Cart */}
        <div className="relative flex items-center justify-between px-4 md:hidden w-full h-16 -mt-3">
          {/* Hamburger menu (modern icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/10 transition-colors mr-2 z-20 text-black"
            aria-label="Open menu"
          >
            {/* SVG Hamburger Icon */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path fillRule="evenodd" clipRule="evenodd" d="M20.75 7C20.75 7.41421 20.4142 7.75 20 7.75L4 7.75C3.58579 7.75 3.25 7.41421 3.25 7C3.25 6.58579 3.58579 6.25 4 6.25L20 6.25C20.4142 6.25 20.75 6.58579 20.75 7Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20.75 12C20.75 12.4142 20.4142 12.75 20 12.75L4 12.75C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25L20 11.25C20.4142 11.25 20.75 11.5858 20.75 12Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20.75 17C20.75 17.4142 20.4142 17.75 20 17.75L4 17.75C3.58579 17.75 3.25 17.4142 3.25 17C3.25 16.5858 3.58579 16.25 4 16.25L20 16.25C20.4142 16.25 20.75 16.5858 20.75 17Z" fill="currentColor"/>
            </svg>
          </button>
          {/* Centered Logo */}
          <div 
            onClick={() => handleNavigation('/')} 
            className="absolute left-1/2 -translate-x-1/2 mx-auto z-10 cursor-pointer flex items-center transition-all duration-300 hover:scale-105 hover:drop-shadow-md pointer-events-auto"
            style={{ minWidth: '7rem' }}
          >
            <img src={assets.logo_mobile} className="w-28 h-auto max-h-12 object-contain" alt="Boutique Logo" />
          </div>
          {/* Spacer to push icons right */}
          <div className="flex items-center gap-2 ml-auto z-20">
            {/* Profile icon */}
            <button
              onClick={() => handleNavigation(user ? '/profile' : '/login')}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary/10 transition-colors relative text-black"
              aria-label="Profile"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover mx-auto my-auto" />
              ) : (
                <svg className="w-6 h-6 mx-auto my-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            {/* Cart icon */}
            <button
              onClick={() => handleNavigation('/cart')}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary/10 transition-colors relative text-black"
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.23737 2.28848C1.84442 2.15749 1.41968 2.36986 1.28869 2.76282C1.15771 3.15578 1.37008 3.58052 1.76303 3.7115L2.02794 3.79981C2.70435 4.02527 3.15155 4.17554 3.481 4.3288C3.79296 4.47392 3.92784 4.59072 4.01426 4.71062C4.10068 4.83052 4.16883 4.99541 4.20785 5.33726C4.24907 5.69826 4.2502 6.17003 4.2502 6.88303L4.2502 9.55487C4.25018 10.9225 4.25017 12.0248 4.36673 12.8917C4.48774 13.7918 4.74664 14.5497 5.34855 15.1516C5.95047 15.7536 6.70834 16.0125 7.60845 16.1335C8.47541 16.25 9.57773 16.25 10.9453 16.25H19.0002C19.4144 16.25 19.7502 15.9142 19.7502 15.5C19.7502 15.0858 19.4144 14.75 19.0002 14.75H11.0002C9.56479 14.75 8.56367 14.7484 7.80832 14.6468C7.07455 14.5482 6.68598 14.3677 6.40921 14.091C6.31252 13.9943 6.22758 13.8839 6.15378 13.75H16.0587C16.507 13.75 16.9014 13.75 17.2288 13.7147C17.5832 13.6764 17.9266 13.5914 18.2497 13.3784C18.5728 13.1653 18.7862 12.8832 18.961 12.5725C19.1224 12.2855 19.2778 11.923 19.4544 11.5109L19.9212 10.4216C20.3057 9.52464 20.6273 8.77419 20.7883 8.16384C20.9563 7.5271 21 6.86229 20.6038 6.26138C20.2076 5.66048 19.5793 5.4388 18.9278 5.34236C18.3034 5.24992 17.4869 5.24995 16.511 5.24999L5.70696 5.24999C5.70421 5.222 5.70129 5.19437 5.69817 5.16711C5.64282 4.68229 5.52222 4.23743 5.23112 3.83355C4.94002 3.42968 4.55613 3.17459 4.1137 2.96876C3.69746 2.77513 3.16814 2.59871 2.54176 2.38994L2.23737 2.28848ZM5.7502 6.74999C5.75021 6.78023 5.75021 6.8107 5.7502 6.84138L5.7502 9.49999C5.7502 10.672 5.75127 11.5544 5.80693 12.25H16.022C16.5179 12.25 16.8305 12.249 17.0678 12.2234C17.287 12.1997 17.3713 12.1608 17.424 12.1261C17.4766 12.0914 17.5455 12.0292 17.6537 11.8371C17.7707 11.629 17.8948 11.3421 18.0901 10.8863L18.5187 9.88631C18.9332 8.91911 19.2087 8.2713 19.3379 7.78124C19.4636 7.30501 19.3999 7.16048 19.3515 7.08712C19.3032 7.01376 19.1954 6.89831 18.7082 6.82619C18.2068 6.75196 17.5029 6.74999 16.4506 6.74999H5.7502Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74284 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74284 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0858 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0858 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M16.5002 21.7501C15.2576 21.7501 14.2502 20.7427 14.2502 19.5001C14.2502 18.2574 15.2576 17.2501 16.5002 17.2501C17.7428 17.2501 18.7502 18.2574 18.7502 19.5001C18.7502 20.7427 17.7428 21.7501 16.5002 21.7501ZM15.7502 19.5001C15.7502 19.9143 16.086 20.2501 16.5002 20.2501C16.9144 20.2501 17.2502 19.9143 17.2502 19.5001C17.2502 19.0859 16.9144 18.7501 16.5002 18.7501C16.086 18.7501 15.7502 19.0859 15.7502 19.5001Z" fill="currentColor"/>
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Desktop: Original layout */}
        <div className="max-w-7xl mx-auto items-center justify-between px-6 hidden md:flex">
          {/* Logo left */}
          <div 
            onClick={() => handleNavigation('/')} 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-md relative"
          >
            <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-all duration-500"></div>
            <img src={assets.logo} className="w-32 relative z-10" alt="Boutique Logo" />
          </div>
          {/* Nav links center */}
          <ul className="flex gap-8 text-sm text-gray-700 font-semibold">
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
          {/* Icons right */}
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
                      <h3 className="font-medium text-primary text-center text-2xs uppercase tracking-wide gold-gradient">{t('account_access')}</h3>
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{t('menu')}</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-6">
                  <NavLink 
                    to="/" 
                    end 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('home')}
                  </NavLink>
                  
                  <NavLink 
                    to="/collection" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {t('collection')}
                  </NavLink>
                  
                  <NavLink 
                    to="/about" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('about')}
                  </NavLink>
                  
                  <NavLink 
                    to="/contact" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('contact')}
                  </NavLink>
                  
                  <NavLink 
                    to="/wishlist" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                    </svg>
                    <span className="flex-1">{t('wishlist')}</span>
                    {wishlistCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {wishlistCount}
                      </span>
                    )}
                  </NavLink>
                </nav>

                {/* Mobile Categories Section */}
                <div className="px-6 mt-8">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">{t('categories')}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <NavLink 
                      to="/collection?category=Women" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                        <img src={assets.woman_icon} alt="Women" className="w-5 h-5 object-contain woman-icon" />
                      </div>
                      {t('women')}
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Men" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <img src={assets.man_icon} alt="Men" className="w-5 h-5 object-contain man-icon" />
                      </div>
                      {t('men')}
                    </NavLink>
                    
                    <NavLink 
                      to="/collection?category=Kids" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <img src={assets.kids_icon} alt="Kids" className="w-5 h-5 object-contain kids-icon" />
                      </div>
                      {t('kids')}
                    </NavLink>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="border-t border-gray-200 p-6">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.profileImage ? (
                          <img 
                            className="w-6 h-6 rounded-full object-cover"
                            src={user.profileImage}
                            alt={user.name || "User Profile"}
                          />
                        ) : (
                          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('profile')}
                      </button>
                      <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      {t('login')}
                    </button>
                    <button
                      onClick={handleRegister}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      {t('create_account')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar; 