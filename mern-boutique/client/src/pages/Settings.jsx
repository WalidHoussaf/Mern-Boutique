import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

const Settings = () => {
  const { t } = useTranslation();
  const { 
    user, 
    isAuthenticated, 
    navigate, 
    currency, 
    setCurrency, 
    language, 
    setLanguage
  } = useContext(ShopContext);
  
  // Settings state
  const [settings, setSettings] = useState({
    currency: currency || '$',
    notifications: {
      orderUpdates: true,
      promotions: true,
      newArrivals: false,
      priceDrops: true
    },
    privacy: {
      shareActivity: false,
      saveSearchHistory: true,
      allowCookies: true
    },
    language: language || 'en'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Update settings from context when they change
  useEffect(() => {
    // Update currency when context currency changes
    if (currency !== settings.currency) {
      setSettings(prev => ({
        ...prev,
        currency: currency
      }));
    }
    
    // Update language when context language changes
    if (language !== settings.language) {
      setSettings(prev => ({
        ...prev,
        language: language
      }));
    }
  }, [currency, language]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/settings');
    }
    
    // Fetch user settings
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Try to get user settings from API
        const response = await axios.get('/api/users/settings');
        
        if (response.data) {
          // Merge with defaults and context values
          setSettings(prev => ({
            ...prev,
            ...response.data,
            // Keep values from context (user preference)
            currency: currency || response.data.currency || prev.currency,
            language: language || response.data.language || prev.language,
            // Ensure nested objects are properly merged
            notifications: {
              ...prev.notifications,
              ...(response.data.notifications || {})
            },
            privacy: {
              ...prev.privacy,
              ...(response.data.privacy || {})
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // If settings don't exist yet, we'll use the defaults
        if (error.response && error.response.status !== 404) {
          toast.error(t('failed_load_settings'));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [isAuthenticated, navigate, currency, language]);

  const handleCurrencyChange = (currencySymbol) => {
    // Update settings state
    setSettings(prev => ({
      ...prev,
      currency: currencySymbol
    }));
    
    // Call the context function to update currency globally
    setCurrency(currencySymbol);
    
    toast.success(t('currency_changed', { currency: currencySymbol }));
  };

  const handleLanguageChange = (languageValue) => {
    // Update settings state
    setSettings(prev => ({
      ...prev,
      language: languageValue
    }));
    
    // Call the context function to update language globally
    setLanguage(languageValue);
    
    const languageNames = {
      en: 'English',
      fr: 'Français'
    };
    
    toast.success(t('language_changed', { language: languageNames[languageValue] || languageValue }));
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
      
      // Show toast notification for changes
      toast.info(t('setting_updated', { field }));
    } else {
      // Use dedicated handlers for special settings
      if (field === 'currency') {
        handleCurrencyChange(value);
        return;
      } else if (field === 'language') {
        handleLanguageChange(value);
        return;
      }
      
      // For other top-level settings
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put('/api/users/settings', settings);
      toast.success(t('settings_saved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('failed_save_settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-500 animate-pulse">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-prata text-secondary mb-8">{t('accountSettings')}</h1>
        
        {/* Settings Navigation Tabs */}
        <div className="flex flex-wrap mb-8 border-b border-gray-200">
          {[
            { id: 'appearance', label: t('appearance') },
            { id: 'notifications', label: t('notifications') },
            { id: 'privacy', label: t('privacy') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <h2 className="text-xl font-medium text-secondary mb-6">{t('appearanceAndDisplay')}</h2>
              
              {/* Currency Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currency')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {['$', '€', '£', 'MAD'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-5 py-2.5 border rounded-md text-sm font-medium transition-all ${
                        currency === curr
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {curr} {currency === curr && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {t('currencyDescription')}
                </p>
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-sm">
                      <strong>{t('currentActiveCurrency')}:</strong> {currency} {currency === '$' ? '(USD)' : currency === '€' ? '(EUR)' : currency === '£' ? '(GBP)' : '(MAD)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Language Selection */}
              <div className="mt-10 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('languagePreferences')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'en', name: 'English', flag: '🇺🇸' },
                    { id: 'fr', name: 'Français', flag: '🇫🇷' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                        settings.language === lang.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-sm">
                      <strong>{t('currentLanguage')}:</strong> {settings.language === 'en' ? 'English' : 
                                                    settings.language === 'fr' ? 'Français' : 'English'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <h2 className="text-xl font-medium text-secondary mb-6">{t('notificationPreferences')}</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'orderUpdates', label: t('orderUpdates'), description: t('orderUpdatesDesc') },
                  { id: 'promotions', label: t('promotions'), description: t('promotionsDesc') },
                  { id: 'newArrivals', label: t('newArrivals'), description: t('newArrivalsDesc') },
                  { id: 'priceDrops', label: t('priceDrops'), description: t('priceDropsDesc') }
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-medium text-gray-800">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications[item.id]} 
                        onChange={(e) => handleChange('notifications', item.id, e.target.checked)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm">
                    <strong>{t('notificationPreferences')}:</strong> {t('notificationNote')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <h2 className="text-xl font-medium text-secondary mb-6">{t('privacySettings')}</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'shareActivity', label: t('shareActivity'), description: t('shareActivityDesc') },
                  { id: 'saveSearchHistory', label: t('saveSearchHistory'), description: t('saveSearchHistoryDesc') },
                  { id: 'allowCookies', label: t('allowCookies'), description: t('allowCookiesDesc') }
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-medium text-gray-800">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.privacy[item.id]} 
                        onChange={(e) => handleChange('privacy', item.id, e.target.checked)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
                
                <div className="mt-6 pt-4">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                    onClick={() => {
                      // Clear search history and other browsing data
                      localStorage.removeItem('searchHistory');
                      // Clear other browsing data as needed
                      toast.success(t('browsing_data_cleared'));
                    }}
                  >
                    {t('clearBrowsingData')}
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm">
                    <strong>{t('privacyNote')}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`px-6 py-3 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving')}
              </span>
            ) : (
              t('saveSettings')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 