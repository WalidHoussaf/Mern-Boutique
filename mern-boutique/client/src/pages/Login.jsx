import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import useTranslation from '../utils/useTranslation';

const Login = () => {
  const location = useLocation();
  const { login, user, navigate } = useContext(ShopContext);
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formFocus, setFormFocus] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Get redirect path if exists
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error(t('required_fields'));
      return false;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error(t('invalid_email'));
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error(t('password_too_short'));
      return false;
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!formData.name) {
        toast.error(t('enter_name'));
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('passwords_not_match'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await axios.post('/api/users/login', {
          email: formData.email,
          password: formData.password
        });
      } else {
        // Register
        response = await axios.post('/api/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }
      
      // Handle successful response
      const userData = response.data;
      
      if (!userData || !userData.token) {
        toast.error(t('auth_failed'));
        return;
      }
      
      login(userData);
      toast.success(isLogin ? t('login_success') : t('register_success'));
      
      // Clear form data after successful registration
      if (!isLogin) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
      
      // Redirect after successful login/register
      navigate(redirect);
    } catch (error) {
      console.error('Authentication error:', error);
      
      let errorMessage = t('auth_failed');
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = t('invalid_credentials');
        } else if (error.response.status === 400 && !isLogin) {
          errorMessage = t('user_exists');
        }
      } else if (error.request) {
        errorMessage = t('server_error');
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFormToggle = () => {
    // Add a slight animation effect when toggling between login and register
    const form = document.querySelector('.auth-form-container');
    form.classList.add('form-toggle-animation');
    
    setTimeout(() => {
      setIsLogin(!isLogin);
      form.classList.remove('form-toggle-animation');
    }, 300);
  };

  const handleFocus = (field) => {
    setFormFocus(field);
  };

  const handleBlur = () => {
    setFormFocus('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Top-right decorative circle */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary opacity-5 rounded-full"></div>
        
        {/* Bottom-left decorative circle */}
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-secondary opacity-5 rounded-full"></div>
        
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute h-full w-full pattern-dots pattern-gray-500 pattern-size-2 pattern-opacity-20"></div>
        </div>
        
        {/* Small floating elements - only visible on larger screens */}
        <div className="hidden md:block">
          <div className="absolute top-[15%] right-[20%] w-6 h-6 bg-primary opacity-20 rounded-full animate-pulse"></div>
          <div className="absolute top-[30%] left-[15%] w-4 h-4 bg-secondary opacity-20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-[25%] right-[30%] w-5 h-5 bg-primary opacity-20 rounded-md animate-pulse" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-[15%] left-[25%] w-3 h-3 bg-secondary opacity-20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="font-prata text-4xl text-secondary mb-2">
            {isLogin ? t('welcome_back_login') : t('join_us')}
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLogin ? t('sign_in_desc') : t('join_desc')}
          </p>
        </div>
        
        {/* Auth Card */}
        <div className="auth-form-container bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all animate-fadeIn">
          {/* Card Header with Gradient */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-secondary"></div>
          
          <div className="px-8 py-10">
            {/* Form Title */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {isLogin ? t('sign_in') : t('create_account')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Register Only) */}
              {!isLogin && (
                <div className="form-field-container">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('full_name')}
                  </label>
                  <div className={`relative transition-all duration-300 ${formFocus === 'name' ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors duration-300 ${formFocus === 'name' ? 'text-primary' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder={t('name_placeholder')}
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all duration-300"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="form-field-container">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email_address')}
                </label>
                <div className={`relative transition-all duration-300 ${formFocus === 'email' ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors duration-300 ${formFocus === 'email' ? 'text-primary' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t('email_placeholder')}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="form-field-container">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')}
                </label>
                <div className={`relative transition-all duration-300 ${formFocus === 'password' ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors duration-300 ${formFocus === 'password' ? 'text-primary' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder={t('password_placeholder')}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-primary transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-primary transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isLogin ? '' : t('password_min_length')}
                </p>
              </div>
              
              {/* Confirm Password (Register Only) */}
              {!isLogin && (
                <div className="form-field-container">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirm_password')}
                  </label>
                  <div className={`relative transition-all duration-300 ${formFocus === 'confirmPassword' ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors duration-300 ${formFocus === 'confirmPassword' ? 'text-primary' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder={t('password_placeholder')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={handleBlur}
                      className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all duration-300"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              {/* Forgot Password Link (Login Only) */}
              {isLogin && (
                <div className="flex items-center justify-end">
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    {t('forgot_password')}
                  </Link>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full relative py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-95 transition-all shadow-md ${
                  isLoading ? 'opacity-80 cursor-wait' : 'hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? t('signing_in') : t('creating_account')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isLogin ? t('sign_in') : t('create_account')} 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
              
              {/* Social Login Options */}
              <div className="relative mt-6 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t('or_continue_with')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-400 cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mx-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" fill="currentColor"/>
                  </svg>
                </button>
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-400 cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mx-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="currentColor"/>
                  </svg>
                </button>
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-400 cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mx-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.127 10.127 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </form>
            
            {/* Toggle between Login/Register */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? t('no_account') : t('have_account')}
                <button
                  type="button"
                  onClick={handleFormToggle}
                  className="ml-2 text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  {isLogin ? t('sign_up') : t('sign_in')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for the form toggle animation */}
      <style>{`
        .form-toggle-animation {
          animation: formToggle 0.3s ease-in-out;
        }
        
        @keyframes formToggle {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          50% {
            opacity: 0.8;
            transform: translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 