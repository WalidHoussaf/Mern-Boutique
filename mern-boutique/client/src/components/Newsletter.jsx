import { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(t('invalidEmail'));
      return;
    }
    
    setSubmitting(true);
    setTimeout(() => {
      toast.success(t('thanksForSubscribing'));
      setEmail('');
      setSubmitting(false);
    }, 1000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(234,88,12,0.1),transparent_50%)]"></div>
      <div className="absolute left-1/4 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <motion.div 
        className="relative max-w-6xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Left content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 mb-6">
                  <span className="animate-ping w-2 h-2 bg-primary rounded-full mr-2"></span>
                  <span className="text-xs font-semibold tracking-wider text-primary uppercase">{t('stayConnected')}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-prata text-secondary mb-4 leading-tight">
                  {t('stayInStyle')}
                </h2>
                
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>
                
                <p className="text-gray-600 text-lg mb-8 leading-relaxed text-justify">
                  {t('newsletterDescription')}
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    t('benefit1'),
                    t('benefit2'),
                    t('benefit3'),
                    t('benefit4')
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-600">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Right content */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-8 md:p-12 flex flex-col justify-center relative">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                  <h3 className="text-2xl font-semibold text-primary mb-2">{t('subscribeToday')}</h3>
                  <p className="text-gray-600 mb-6">{t('joinFashionEnthusiasts')}</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('emailAddress')}</label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('emailPlaceholder')}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 pl-12"
                          required
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-xl 
                        hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 
                        ${submitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('subscribing')}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center group">
                          <span>{t('subscribeNow')}</span>
                          <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </form>
                  
                  {/* Trust indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <img 
                            key={i}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                            src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${20 + i}.jpg`}
                            alt=""
                          />
                        ))}
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-primary/10 text-xs font-medium text-primary">
                          5k+
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      {t('privacyNotice')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter; 