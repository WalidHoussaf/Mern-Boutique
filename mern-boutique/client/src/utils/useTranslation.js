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
  const t = (key, variables = {}) => {
    // Get the current language from localStorage as fallback
    const currentLanguage = language || localStorage.getItem('language') || 'en';
    let translation = getTranslation(key, currentLanguage);
    
    // Replace template variables if provided
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(varKey => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        translation = translation.replace(regex, variables[varKey]);
      });
    }
    
    return translation;
  };

  /**
   * Helper function to get translated product content
   * @param {Object} product - Product object with name, nameFr, description, descriptionFr
   * @param {string} field - Field to translate ('name' or 'description')
   * @returns {string} Translated content
   */
  const getProductTranslation = (product, field) => {
    const currentLanguage = language || localStorage.getItem('language') || 'en';
    
    if (!product) return '';
    
    // For French language
    if (currentLanguage === 'fr') {
      const frenchField = `${field}Fr`;
      if (product[frenchField] && product[frenchField].trim()) {
        return product[frenchField];
      }
    }
    
    // Fallback to English (default field)
    return product[field] || '';
  };
  
  return { t, language, getProductTranslation };
};

export default useTranslation; 