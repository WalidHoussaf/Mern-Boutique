import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';

// Demo products (in a real app, these would come from the API)
const demoProducts = [
  {
    _id: "1",
    name: "Elegant Evening Dress",
    category: "Dresses",
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.8,
    image: [assets.product_img1, assets.product_img2],
    isNew: true
  },
  {
    _id: "2",
    name: "Classic Leather Handbag",
    category: "Accessories",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.6,
    image: [assets.product_img3, assets.product_img4]
  },
  {
    _id: "3",
    name: "Designer Sunglasses",
    category: "Accessories",
    price: 59.99,
    rating: 4.5,
    image: [assets.product_img5, assets.product_img6]
  },
  {
    _id: "4",
    name: "Summer Floral Dress",
    category: "Dresses",
    price: 79.99,
    originalPrice: 95.99,
    rating: 4.7,
    image: [assets.product_img7, assets.product_img8],
    isNew: true
  },
];

const FeaturedProducts = () => {
  const { allProducts, navigate } = useContext(ShopContext);
  
  // Use API products if available, otherwise use demo products
  const products = allProducts.length > 0 
    ? allProducts.filter(product => product.featured).slice(0, 4) 
    : demoProducts;

  return (
    <section className="py-16 relative">
      {/* Inner frame with blue corners */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary opacity-10"></div>
          <div className="absolute top-1/2 -left-10 w-40 h-40 rounded-full bg-secondary opacity-10"></div>
          <div className="absolute -bottom-10 right-1/3 w-56 h-56 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-primary opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Elegant heading with improved styling */}
          <div className="text-center mb-16 relative px-4 py-10 mx-auto max-w-4xl">            
            {/* Top Selection badge - styled as in the image */}
            <div className="flex justify-center mb-2">
              <span className="flex items-center px-6 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                <span className="text-xs font-medium tracking-wide text-primary uppercase">Top Selection</span>
              </span>
            </div>
            
            {/* Main heading with elegant styling */}
            <h2 className="text-4xl md:text-5xl font-prata text-secondary mb-3">
              Featured Products
            </h2>
            
            {/* Divider that matches the image */}
            <div className="relative py-4 flex justify-center items-center mb-4">
              <div className="w-16 h-0.5 bg-primary"></div>
              <div className="absolute w-2.5 h-2.5 rounded-full bg-primary"></div>
            </div>
            
            {/* Description with subtle styling */}
            <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
              Discover our handpicked selection of exceptional pieces that combine style, quality, and comfort.
              Each item is carefully selected to ensure the highest standards.
            </p>
          </div>
          
          {/* Products Grid with enhanced styling and backdrop */}
          <div className="relative mb-20 px-4 md:px-4 py-14 rounded-2xl overflow-hidden">
            {/* Decorative backgrounds for grid section */}
            <div className="absolute inset-0 bg-gray-50/80 rounded-2xl -z-10"></div>
            <div className="absolute inset-0 opacity-10 -z-10">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#015A89,transparent_70%)]"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#77513B,transparent_70%)]"></div>
            </div>
            <div className="absolute inset-0 opacity-5 pattern-dots pattern-gray-500 pattern-size-2 -z-10"></div>
            
            {/* Subtle shadow around grid area */}
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
          
          {/* Enhanced CTA section with decorative elements */}
          <div className="text-center relative">
            {/* Decorative elements */}
            <div className="absolute left-1/4 -top-4 w-24 h-24 rounded-full bg-secondary/5 blur-xl -z-10"></div>
            <div className="absolute right-1/4 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-xl -z-10"></div>
            
            {/* Fancy border decoration above CTA */}
            <div className="w-full max-w-sm mx-auto mb-10 opacity-30">
              <div className="flex items-center justify-center">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="mx-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>
            
            {/* Enhanced CTA Button */}
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