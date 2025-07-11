// Define translations for different languages
const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    collection: 'Collection',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    search: 'Search',
    cart: 'Cart',
    wishlist: 'Wishlist',

    // Settings page
    accountSettings: 'Account Settings',
    appearance: 'Appearance',
    notifications: 'Notifications',
    privacy: 'Privacy',
    language: 'Language',
    appearanceAndDisplay: 'Appearance & Display',
    currency: 'Currency',
    currencyDescription: 'This changes the display currency and performs approximate conversion for your convenience.',
    currentActiveCurrency: 'Current active currency',
    languagePreferences: 'Language Preferences',
    currentLanguage: 'Current language',
    
    // Notification settings
    notificationPreferences: 'Notification Preferences',
    orderUpdates: 'Order Updates',
    orderUpdatesDesc: 'Get notified about your order status changes',
    promotions: 'Promotions & Deals',
    promotionsDesc: 'Receive information about sales and special offers',
    newArrivals: 'New Arrivals',
    newArrivalsDesc: 'Be the first to know about new products',
    priceDrops: 'Price Drops',
    priceDropsDesc: 'Get alerts when items in your wishlist go on sale',
    notificationNote: 'Changes will apply to both email and in-app notifications.',
    
    // Privacy settings
    privacySettings: 'Privacy Settings',
    shareActivity: 'Share Activity',
    shareActivityDesc: 'Allow us to use your browsing activity to improve recommendations',
    saveSearchHistory: 'Save Search History',
    saveSearchHistoryDesc: 'Store your recent searches for quicker access',
    allowCookies: 'Allow Cookies',
    allowCookiesDesc: 'Enable cookies to remember your preferences and login information',
    clearBrowsingData: 'Clear my browsing data',
    privacyNote: 'Your privacy settings determine how we use your data to enhance your shopping experience.',
    
    // Buttons
    saveSettings: 'Save Settings',
    saving: 'Saving...',
  },
  fr: {
    // Navigation & Common
    home: 'Accueil',
    collection: 'Collection',
    about: 'À propos',
    contact: 'Contact',
    login: 'Connexion',
    register: 'S\'inscrire',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    search: 'Rechercher',
    cart: 'Panier',
    wishlist: 'Favoris',

    // Settings page
    accountSettings: 'Paramètres du compte',
    appearance: 'Apparence',
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    language: 'Langue',
    appearanceAndDisplay: 'Apparence et affichage',
    currency: 'Devise',
    currencyDescription: 'Cela change la devise d\'affichage et effectue une conversion approximative pour votre commodité.',
    currentActiveCurrency: 'Devise active actuelle',
    languagePreferences: 'Préférences de langue',
    currentLanguage: 'Langue actuelle',
    
    // Notification settings
    notificationPreferences: 'Préférences de notification',
    orderUpdates: 'Mises à jour des commandes',
    orderUpdatesDesc: 'Soyez informé des changements de statut de votre commande',
    promotions: 'Promotions et offres',
    promotionsDesc: 'Recevez des informations sur les ventes et les offres spéciales',
    newArrivals: 'Nouveautés',
    newArrivalsDesc: 'Soyez le premier à connaître les nouveaux produits',
    priceDrops: 'Baisses de prix',
    priceDropsDesc: 'Recevez des alertes lorsque les articles de votre liste de souhaits sont en promotion',
    notificationNote: 'Les modifications s\'appliqueront aux notifications par e-mail et dans l\'application.',
    
    // Privacy settings
    privacySettings: 'Paramètres de confidentialité',
    shareActivity: 'Partager l\'activité',
    shareActivityDesc: 'Permettez-nous d\'utiliser votre activité de navigation pour améliorer les recommandations',
    saveSearchHistory: 'Enregistrer l\'historique de recherche',
    saveSearchHistoryDesc: 'Stocker vos recherches récentes pour un accès plus rapide',
    allowCookies: 'Autoriser les cookies',
    allowCookiesDesc: 'Activer les cookies pour mémoriser vos préférences et informations de connexion',
    clearBrowsingData: 'Effacer mes données de navigation',
    privacyNote: 'Vos paramètres de confidentialité déterminent comment nous utilisons vos données pour améliorer votre expérience d\'achat.',
    
    // Buttons
    saveSettings: 'Enregistrer les paramètres',
    saving: 'Enregistrement...',
  }
};

// Get translation for a specific key based on the current language
const getTranslation = (key, lang = 'en') => {
  // Get the translations for the specified language, fallback to English
  const langTranslations = translations[lang] || translations.en;
  
  // Return the translation for the key or the key itself if not found
  return langTranslations[key] || translations.en[key] || key;
};

export { getTranslation, translations }; 