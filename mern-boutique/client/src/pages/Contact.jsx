import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getTranslation } from '../utils/translations';
import { ShopContext } from '../context/ShopContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useContext(ShopContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(getTranslation('required_fields', language));
      return;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error(getTranslation('invalid_email', language));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.message) {
        toast.success(getTranslation('contact_success', language));
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(
        error.response?.data?.message || 
        getTranslation('contact_error', language)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: getTranslation('visit_us', language),
      details: getTranslation('address', language),
      link: "https://maps.google.com",
      linkText: getTranslation('get_directions', language)
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: getTranslation('email_us', language),
      details: getTranslation('email', language),
      link: "mailto:voguevault@boutique.com",
      linkText: getTranslation('send_email', language)
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: getTranslation('call_us', language),
      details: getTranslation('phone', language),
      link: "tel:+2125551234567",
      linkText: getTranslation('make_call', language)
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: getTranslation('business_hours', language),
      details: (
        <>
          {getTranslation('business_hours_weekday', language)}<br />
          {getTranslation('business_hours_saturday', language)}<br />
          {getTranslation('business_hours_sunday', language)}
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full -translate-x-1/3 translate-y-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-prata text-secondary mb-4">{getTranslation('get_in_touch', language)}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {getTranslation('contact_description', language)}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6"></div>
        </motion.div>

        {/* Contact Methods Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {contactMethods.map((method, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              variants={fadeIn}
            >
              <div className="text-primary mb-4">
                {method.icon}
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.details}</p>
              {method.link && (
                <a 
                  href={method.link} 
                  className="mt-auto text-primary hover:text-primary-dark transition-colors font-medium text-sm flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {method.linkText}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row">
            {/* Map and Contact Info */}
            <div className="md:w-1/2 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 lg:p-12">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="h-full flex flex-col"
              >
                <h2 className="text-2xl font-prata text-secondary mb-6 relative inline-block">
                  Vogue Vault Boutique
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
                </h2>
                
                <div className="mb-6">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                    <iframe 
                      title="Vogue Vault Boutique Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26822.097141763136!2d-7.659560069357913!3d33.59561247473907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d2da89079481%3A0x5a6e9587e4023d1!2sBoulevard%20Zerktouni%2C%20Casablanca%2C%20Morocco!5e0!3m2!1sen!2sus!4v1656954423076!5m2!1sen!2sus" 
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen="" 
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
                
                <div className="space-y-6 flex-grow">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 text-justify">
                    {getTranslation('about_description', language)}
                  </p>
                  
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-3">{getTranslation('follow_social_media', language)}</h3>
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
                          <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.889-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="md:w-1/2 p-8 lg:p-12">
              <motion.form 
                onSubmit={handleSubmit}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('contact_form_name', language)}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('contact_form_email', language)}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('contact_form_subject', language)}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('contact_form_message', language)}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? getTranslation('contact_form_sending', language) : getTranslation('contact_form_submit', language)}
                </motion.button>
              </motion.form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 