import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { getTranslation } from './translations';

/**
 * Custom hook to handle translations based on the current language
 * @returns {Object} t - Translation function and current language
 */
const useTranslation = () => {
  const { language } = useContext(ShopContext);
  
  // Translation function
  const t = (key) => getTranslation(key, language);
  
  return { t, language };
};

export default useTranslation; 