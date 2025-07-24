import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import useTranslation from '../utils/useTranslation';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 mt-16 relative overflow-hidden border-t border-gray-200">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary opacity-5"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary opacity-5"></div>
      </div>
      
      {/* Newsletter highlight banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-prata text-secondary mb-1">{t('stay_updated')}</h3>
            <p className="text-gray-600 text-sm max-w-md">{t('get_exclusive_offers')}</p>
          </div>
          <Link to="/newsletter" className="px-6 py-3 text-sm bg-white text-primary font-medium rounded-md shadow-sm border border-primary/20 hover:bg-primary hover:text-white transition-colors flex items-center">
            {t('subscribe_to_newsletter')}
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <img src={assets.logo} alt="Boutique Logo" className="h-8 mr-2" />
              <span className="text-2xs font-prata text-primary">Vogue Vault Boutique</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('about_description')}
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a 
                href="#" 
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="font-semibold text-primary mb-4 pb-1 border-b border-gray-200">{t('categories')}</h3>
            <ul className="space-y-2">
              <li><Link to="/collection?category=Women" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('women')}</Link></li>
              <li><Link to="/collection?category=Men" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('men')}</Link></li>
              <li><Link to="/collection?category=Kids" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('kids')}</Link></li>
            </ul>
          </div>

          {/* Company & Policy */}
          <div>
            <h3 className="font-semibold text-primary mb-4 pb-1 border-b border-gray-200">{t('company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('about_us')}</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('contact_us')}</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('faqs')}</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('privacy_policy')}</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t('terms_conditions')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-primary mb-4 pb-1 border-b border-gray-200">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="text-gray-600 text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Boulevard+Mohammed+Zerktouni+N°52+Casablanca+Maroc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {t('address')}
                </a>
              </li>
              <li className="text-gray-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:voguevault@boutique.com" className="hover:text-primary">voguevault@boutique.com</a>
              </li>
              <li className="text-gray-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+15551234567" className="hover:text-primary">+1 (555) 123-4567</a>
              </li>
              <li className="text-gray-600 text-sm flex items-center mt-4">
                <span className="text-xs text-gray-500">{t('we_accept')}</span>
              </li>
              <li className="flex space-x-2">
                <img src="https://cdn-icons-png.flaticon.com/64/196/196578.png" alt="Visa" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196561.png" alt="MasterCard" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196565.png" alt="PayPal" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <img src="https://cdn-icons-png.flaticon.com/64/196/196539.png" alt="American Express" className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Copyright and Links */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {year} {t('copyright', year)}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shipping" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('shipping_policy')}</Link>
            <span className="text-gray-300">|</span>
            <Link to="/returns" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('return_policy')}</Link>
            <span className="text-gray-300">|</span>
            <Link to="/sitemap" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('sitemap')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;