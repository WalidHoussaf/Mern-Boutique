import { useContext } from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Categories from '../components/Categories';
import Newsletter from '../components/Newsletter';
import Testimonials from '../components/Testimonials';
import { ShopContext } from '../context/ShopContext';

const Home = () => {
  const { loading } = useContext(ShopContext);

  return (
    <div className="space-y-20 py-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Hero />
          <FeaturedProducts />
          <Categories />
          <Testimonials />
          <Newsletter />
        </>
      )}
    </div>
  );
};

export default Home; 