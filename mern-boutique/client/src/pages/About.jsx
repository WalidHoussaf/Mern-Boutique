import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '50+', label: 'Team Members' },
    { value: '10k+', label: 'Happy Customers' },
    { value: '25+', label: 'Countries Shipped' },
  ];

  const values = [
    {
      title: 'Quality Craftsmanship',
      description: 'Every piece is meticulously crafted with attention to detail and quality.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: 'Sustainability',
      description: 'We\'re committed to ethical production methods and reducing our social and environmental impact.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Inclusivity',
      description: 'Fashion should be for everyone. We design for all body types, styles, and preferences.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Innovation',
      description: 'We constantly explore new techniques and designs to bring fresh perspectives to fashion.',
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
        <h1 className="text-4xl md:text-5xl font-prata text-secondary mb-4">About Vogue Vault Boutique</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">Crafting timeless fashion pieces since 2025. Discover our story, values, and the people behind our brand.</p>
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
            alt="About Vogue Vault Boutique"
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
            Our Story
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            Founded in 2025, Vogue Vault Boutique began with a simple mission: to provide high-quality, stylish clothing and accessories that help people express themselves confidently. What started as a small passion project has grown into a beloved brand with customers around the world.
          </p>
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            Our journey has been one of continuous growth and learning. From our first small collection to our current expansive range, we've stayed true to our commitment to quality, sustainability, and timeless design.
          </p>
          
          <motion.button 
            className="self-start px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/collection')}
          >
            Our Collections
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
          <h2 className="text-3xl font-prata text-secondary mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do, from design to customer service.</p>
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
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-medium text-secondary mb-2">{value.title}</h3>
              <p className="text-gray-600 text-justify">{value.description}</p>
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
            Our Philosophy
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-secondary"></span>
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed text-justify">
            We believe that fashion should be both beautiful and sustainable. That's why we carefully select materials and partner with ethical manufacturers who share our values. Each piece in our collection is designed to be timeless, transcending seasonal trends.
          </p>
          
          <p className="text-gray-600 text-lg leading-relaxed text-justify">
            Our approach combines artisanal craftsmanship with modern techniques, creating garments that honor traditional expertise while embracing innovation. We're dedicated to reducing waste and environmental impact throughout our production process.
          </p>
        </div>
      </motion.div>

      {/* Team Section with enhanced cards */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-prata text-secondary mb-4">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto ">The passionate individuals who bring our vision to life every day.</p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "James Watkins",
              position: "Founder & Creative Director",
              src: assets.people1,
              bio: "With 15 years of experience in fashion design, James brings creative vision and industry expertise to Vogue Vault Boutique."
            },
            {
              name: "Michael Chen",
              position: "Head of Operations",
              src: assets.people2,
              bio: "Michael ensures that every aspect of our business runs smoothly, from supply chain to customer service."
            },
            {
              name: "Elena Rodriguez",
              position: "Lead Designer",
              src: assets.people3,
              bio: "Elena's innovative designs blend classic elegance with contemporary trends, creating unique pieces for our collections."
            }
          ].map((member, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={member.src} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 w-full flex justify-center space-x-3 pb-4 opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all duration-300">
                  <motion.button 
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.667 2.476c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </motion.button>
                  <motion.button 
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </motion.button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-justify">
                  {member.bio}
                </p>
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
            <h2 className="text-3xl font-prata mb-6">Our Promise</h2>
            <p className="text-white/90 mb-6 leading-relaxed text-justify">
              When you shop with Vogue Vault Boutique, you're not just buying clothing – you're investing in pieces that are made to last, both in style and durability. We're committed to providing exceptional customer service and a shopping experience that makes you feel valued and understood.
            </p>
            <p className="text-white/90 leading-relaxed text-justify">
              We stand behind every product we sell with our satisfaction guarantee. If you're not completely happy with your purchase, we'll make it right.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-8 md:p-12 text-gray-800">
            <h2 className="text-2xl font-prata text-secondary mb-4">Join Our Community</h2>
            <p className="text-gray-600 mb-6 text-justify">
              Subscribe to receive updates on new collections, exclusive offers, and fashion inspiration.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow rounded-l-md border-gray-300 border p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <motion.button 
                className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-primary-dark transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 