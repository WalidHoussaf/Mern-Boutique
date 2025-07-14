import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../utils/translations';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const About = () => {
  const navigate = useNavigate();
  const { language } = useContext(ShopContext);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const stats = [
    { value: '10+', label: getTranslation('years_experience', language) },
    { value: '50+', label: getTranslation('team_members', language) },
    { value: '10k+', label: getTranslation('happy_customers', language) },
    { value: '5+', label: getTranslation('countries_shipped', language) },
  ];

  const values = [
    {
      title: getTranslation('quality_craftsmanship', language),
      description: getTranslation('quality_craftsmanship_desc', language),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: getTranslation('sustainability', language),
      description: getTranslation('sustainability_desc', language),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: getTranslation('inclusivity', language),
      description: getTranslation('inclusivity_desc', language),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: getTranslation('innovation', language),
      description: getTranslation('innovation_desc', language),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ];

  return (
    <div className="py-12 px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-prata text-secondary mb-4">{getTranslation('about_vogue_vault', language)}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">{getTranslation('about_vogue_vault_description', language)}</p>
        <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-6"></div>
      </motion.div>

      {/* Story Section with Image */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center mb-20">
        {/* Image with decorative elements */}
        <motion.div 
          className="md:w-1/2 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="absolute -left-4 -top-4 w-full h-full border-2 border-primary/20 rounded-lg"></div>
          <img
            src={assets.about_img}
            alt={getTranslation('about_vogue_vault', language)}
            className="w-full h-auto object-cover rounded-lg shadow-md relative z-10"
          />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full"></div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="md:w-1/2 flex flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-prata text-secondary mb-6 relative inline-block">
            {getTranslation('our_story', language)}
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            {getTranslation('our_story_p1', language)}
          </p>
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            {getTranslation('our_story_p2', language)}
          </p>
          
          <motion.button 
            className="self-start px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/collection')}
          >
            {getTranslation('our_collections', language)}
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div 
        className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 mb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl md:text-5xl font-prata text-primary mb-2">{stat.value}</span>
              <span className="text-gray-600">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Our Values Section */}
      <motion.div 
        className="mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-prata text-secondary mb-4">{getTranslation('our_values', language)}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{getTranslation('our_values_description', language)}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                {value.icon}
              </div>
              <h3 className="text-xl font-medium text-center text-secondary mb-2">{value.title}</h3>
              <p className="text-gray-600 text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Philosophy Section */}
      <motion.div 
        className="flex flex-col md:flex-row-reverse gap-10 md:gap-16 items-center mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        {/* Image */}
        <div className="md:w-1/2 relative">
          <div className="rounded-xl overflow-hidden">
            <img
              src={assets.about_img1}
              alt="Sustainable Fashion"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-secondary/10 rounded-full -z-10"></div>
        </div>

        {/* Content */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-prata text-secondary mb-6 relative inline-block">
            {getTranslation('our_philosophy', language)}
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-secondary"></span>
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            {getTranslation('our_philosophy_p1', language)}
          </p>
          
          <p className="text-gray-600 text-lg leading-relaxed text-justify">
            {getTranslation('our_philosophy_p2', language)}
          </p>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-prata text-secondary mb-4">{getTranslation('meet_our_team', language)}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto ">{getTranslation('meet_our_team_description', language)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Walid Houssaf",
              position: getTranslation('founder_creative_director', language),
              src: assets.people1,
              bio: getTranslation('james_bio', language)
            },
            {
              name: "Zakaria El Haddad",
              position: getTranslation('head_operations', language),
              src: assets.people2,
              bio: getTranslation('michael_bio', language)
            },
            {
              name: "Asmae Amir",
              position: getTranslation('lead_designer', language),
              src: assets.people3,
              bio: getTranslation('elena_bio', language)
            }
          ].map((member, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="relative">
                <img 
                  src={member.src} 
                  alt={member.name}
                  className="w-full h-80 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-1">{member.name}</h3>
                <p className="text-primary mb-4">{member.position}</p>
                <p className="text-gray-600 text-justify">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Promise & Newsletter Section */}
      <motion.div 
        className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-prata mb-6">{getTranslation('our_promise', language)}</h2>
            <p className="text-white/90 mb-6 leading-relaxed text-justify">
              {getTranslation('promise_description', language)}
            </p>
            <p className="text-white/90 leading-relaxed text-justify">
              {getTranslation('satisfaction_guarantee', language)}
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-8 md:p-12 text-gray-800">
            <h2 className="text-2xl font-prata text-secondary mb-4">{getTranslation('join_community', language)}</h2>
            <p className="text-gray-600 mb-6 text-justify">
              {getTranslation('newsletter_description', language)}
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={getTranslation('email_placeholder', language)}
                className="flex-grow rounded-l-md border-gray-300 border p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <motion.button 
                className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-primary-dark transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getTranslation('subscribe_button', language)}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 