import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';

const FeaturedProducts = () => {
  const { allProducts, navigate } = useContext(ShopContext);
  
  // Get featured products from API
  const products = allProducts.filter(product => product.featured).slice(0, 4);

  return (
    <section className="py-8 relative">
      {/* Inner frame */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary opacity-10"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-primary opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Elegant heading */}
          <div className="text-center mb-16 relative px-4 py-10 mx-auto max-w-4xl">            
            {/* Top Selection badge */}
            <div className="flex justify-center mb-2">
              <span className="flex items-center px-6 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                <span className="text-xs font-medium tracking-wide text-primary uppercase">Top Selection</span>
              </span>
            </div>
            
            {/* Main heading */}
            <h2 className="text-4xl md:text-5xl font-prata text-secondary mb-3">
              Featured Products
            </h2>
            
            {/* Divider */}
            <div className="relative py-4 flex justify-center items-center mb-4">
              <div className="w-16 h-[3px] bg-primary"></div>
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
              Discover our handpicked selection of exceptional pieces that combine style, quality, and comfort.
              Each item is carefully selected to ensure the highest standards.
            </p>
          </div>
          
          {/* Products Grid */}
          <div className="relative mb-20 px-4 md:px-4 py-14 rounded-2xl overflow-hidden">
            {/* Decorative backgrounds */}
            <div className="absolute inset-0 bg-gray-50/80 rounded-2xl -z-10"></div>
            <div className="absolute inset-0 opacity-10 -z-10">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#015A89,transparent_70%)]"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#77513B,transparent_70%)]"></div>
            </div>
            <div className="absolute inset-0 opacity-5 pattern-dots pattern-gray-500 pattern-size-2 -z-10"></div>
            
            {/* Subtle shadow */}
            <div className="absolute inset-0 shadow-inner rounded-2xl -z-10"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
              {products.map((product, index) => (
                <div 
                  key={product._id} 
                  className="opacity-100 transition-all duration-500 ease-out transform hover:scale-105"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <ProductItem
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      image={product.image}
                      rating={product.rating}
                      isNew={product.isNew}
                      category={product.category}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA section */}
          <div className="text-center relative">
            {/* Decorative elements */}
            <div className="absolute left-1/4 -top-4 w-24 h-24 rounded-full bg-secondary/5 blur-xl -z-10"></div>
            <div className="absolute right-1/4 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-xl -z-10"></div>
            
            {/* Border decoration */}
            <div className="w-full max-w-sm mx-auto mb-10 opacity-30">
              <div className="flex items-center justify-center">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="mx-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-gray-400 animate-bounce" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    style={{
                      animation: 'bounce 2s infinite',
                      animationTimingFunction: 'cubic-bezier(0.28, 0.84, 0.42, 1)'
                    }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M7 10L12 15L17 10"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M7 6L12 11L17 6"
                      className="opacity-50"
                    />
                  </svg>
                </div>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>
            
            {/* CTA Button */}
            <button 
              onClick={() => navigate('/collection')}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-medium tracking-wide text-white transition-all duration-300 ease-in-out bg-primary rounded-lg overflow-hidden shadow-md hover:shadow-xl"
            >
              <span className="relative z-10">View All Products</span>
              <span className="absolute inset-0 h-full w-full bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left opacity-10"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;