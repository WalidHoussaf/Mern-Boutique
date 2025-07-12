import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { getTranslation } from './translations';

/**
 * Custom hook to handle translations based on the current language
 * @returns {Object} t - Translation function and current language
 */
const useTranslation = () => {
  const { language } = useContext(ShopContext);
  
  // Translation function that always uses the current language
  const t = (key) => {
    // Get the current language from localStorage as fallback
    const currentLanguage = language || localStorage.getItem('language') || 'en';
    return getTranslation(key, currentLanguage);
  };
  
  return { t, language };
};

export default useTranslation; 