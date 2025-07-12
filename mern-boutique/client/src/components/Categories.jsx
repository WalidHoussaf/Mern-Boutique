import { useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import useTranslation from '../utils/useTranslation';

const categoryData = [
  {
    id: 1,
    name: "Women",
    image: assets.womencategory,
  },
  {
    id: 3,
    name: "Men",
    image: assets.mancategory,
  },
  {
    id: 4,
    name: "Kids",
    image: assets.kidscategory,
  },
];

const Categories = () => {
  const { navigate, allProducts } = useContext(ShopContext);
  const { t } = useTranslation();

  // Get display name for a category
  const getCategoryDisplayName = (category) => {
    switch(category) {
      case 'All':
        return t('all_collections');
      case 'Women':
        return t('femme_edit');
      case 'Men':
        return t('gents_showcase');
      case 'Kids':
        return t('little_trendsetters');
      default:
        return category;
    }
  };
  
  // Get display name for a subcategory
  const getSubCategoryDisplayName = (subCategory) => {
    switch(subCategory) {
      case 'All':
        return t('all_styles');
      case 'Topwear':
        return t('statement_tops');
      case 'Bottomwear':
        return t('signature_bottoms');
      case 'Winterwear':
        return t('seasonal_layers');
      default:
        return subCategory;
    }
  };

  // Dynamically calculate product counts by category
  const categoriesWithCounts = useMemo(() => {
    // Create a map to count products in each category
    const counts = allProducts.reduce((acc, product) => {
      if (product && product.category) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {});

    // Merge static data with dynamic counts
    return categoryData.map(category => ({
      ...category,
      count: counts[category.name] || 0 // Use real count or 0 if no products
    }));
  }, [allProducts]);

  const handleCategoryClick = (category) => {
    navigate(`/collection?category=${encodeURIComponent(category)}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-8 bg-neutral-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/5"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Top Selection badge */}
          <div className="flex justify-center mb-2">
            <span className="flex items-center px-6 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                {t('curatedCollections')}
              </span>
            </span>
          </div>
          
          {/* Main heading */}
          <h2 className="text-4xl md:text-5xl font-prata text-secondary mb-3">
            {t('shopByCategory')}
          </h2>
          
          {/* Divider */}
          <div className="relative py-4 flex justify-center items-center mb-4">
            <div className="w-16 h-[2px] bg-primary"></div>
            <div 
              className="absolute w-2.5 h-2.5 rounded-full bg-primary"
              style={{
                animation: 'slide 3s ease-in-out infinite',
                transform: 'translateX(-50%)',
              }}
            ></div>
          </div>

          <style>{`
            @keyframes slide {
              0%, 100% {
                left: calc(50% - 32px);
              }
              50% {
                left: calc(50% + 32px);
              }
            }
          `}</style>
          
          {/* Description */}
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
            {t('shopByCategoryDescription')}
          </p>
        </motion.div>

        {/* Categories grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categoriesWithCounts.map((category) => (
            <motion.div 
              key={category.id}
              variants={itemVariants}
              onClick={() => handleCategoryClick(category.name)}
              className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl"
              whileHover={{ 
                scale: 1.03, 
                transition: { duration: 0.3 } 
              }}
            >
              {/* Category Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src={category.image} 
                  alt={getCategoryDisplayName(category.name)} 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Elegant Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-75 transition-opacity"></div>
              
              {/* Category Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300">
                <h3 className="text-3xl font-medium mb-2 font-prata">{getCategoryDisplayName(category.name)}</h3>
                <div className="flex items-center mb-4">
                  <span className="text-sm font-medium bg-primary/80 rounded-full px-4 py-1.5">
                    {category.count} {t('products')}
                  </span>
                </div>
                
                {/* Animated CTA button */}
                <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <button className="bg-white text-primary font-medium py-2.5 px-6 rounded-md shadow-md hover:bg-gray-100 transition-colors flex items-center">
                    <span>{t('browseCollection')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories; 