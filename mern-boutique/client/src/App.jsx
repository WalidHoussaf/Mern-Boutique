import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { ShopContext } from './context/ShopContext';

// Pages
import Home from './pages/Home.jsx';
import Collection from './pages/Collection.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Product from './pages/Product.jsx';
import Orders from './pages/Orders.jsx';
import Cart from './pages/Cart.jsx';
import PlaceOrder from './pages/PlaceOrder.jsx';
import Login from './pages/Login.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.jsx';
import ProductList from './pages/admin/ProductList.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import UserList from './pages/admin/UserList.jsx';
import UserDetail from './pages/admin/UserDetail.jsx';
import OrderList from './pages/admin/OrderList.jsx';
import OrderDetails from './pages/admin/OrderDetails.jsx';
import DashboardOverview from './pages/admin/DashboardOverview.jsx';
import Messages from './pages/admin/Messages.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SearchBar from './components/SearchBar.jsx';

// Component wrapper to force remounting
const RemountComponent = ({ component: Component, ...rest }) => {
  const location = useLocation();
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [location.pathname]);
  
  return <Component key={key} {...rest} />;
};

const App = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const { user, language } = useContext(ShopContext);
  
  // Set the language attribute on the html element
  useEffect(() => {
    if (language) {
      document.documentElement.lang = language;
    }
  }, [language]);
  
  // Add transition effects when navigating
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    
    if (mainContent) {
      // Apply fade out effect
      mainContent.style.opacity = '0';
      mainContent.style.transition = 'opacity 0.15s ease-out';
      
      // Fade back in after a short delay
      setTimeout(() => {
        mainContent.style.opacity = '1';
      }, 150);
    }
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Update previous path
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const [showMobileSearch, setShowMobileSearch] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 40) {
        setShowMobileSearch(false); 
      } else {
        setShowMobileSearch(true);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='px-2 sm:px-4 md:px-[9vw]'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{
          width: 'auto',
          maxWidth: '800px',
        }}
        toastStyle={{
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
        }}
        limit={3}
        preventDuplicates
      />
      <Navbar />
      {/* Mobile: SearchBar below navbar - only on collection page */}
      {location.pathname === '/collection' && (
        <div className={`block md:hidden sticky top-16 z-30 bg-white/90 backdrop-blur-md px-2 py-2 border-b border-gray-100 transition-transform duration-300 -mt-8 ${showMobileSearch ? 'translate-y-0' : '-translate-y-20'}`}>
          <SearchBar />
        </div>
      )}
      {/* Desktop: SearchBar */}
      <div className="hidden md:block">
        <SearchBar />
      </div>
      <div 
        id="main-content" 
        style={{ transition: 'opacity 0.15s ease-in' }}
        className="mt-8 pt-4"
      >
        <Routes key={location.key}>
          <Route path='/' element={<RemountComponent component={Home} />} />
          <Route path='/collection' element={<RemountComponent component={Collection} />} />
          <Route path='/about' element={<RemountComponent component={About} />} />
          <Route path='/contact' element={<RemountComponent component={Contact} />} />
          <Route path='/product/:productId' element={<RemountComponent component={Product} />} />
          <Route path='/cart' element={<RemountComponent component={Cart} />} />
          <Route path='/login' element={<RemountComponent component={Login} />} />
          <Route path='/profile' element={<RemountComponent component={Profile} />} />
          <Route path='/settings' element={<RemountComponent component={Settings} />} />
          <Route path='/place-order' element={<RemountComponent component={PlaceOrder} />} />
          <Route path='/orders' element={<RemountComponent component={Orders} />} />
          <Route path='/order/:id' element={<RemountComponent component={Orders} />} />
          <Route path='/wishlist' element={<RemountComponent component={Wishlist} />} />
          
          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={<RemountComponent component={Dashboard} />}>
            <Route index element={<DashboardOverview />} />
          </Route>
          <Route path='/admin/products' element={<RemountComponent component={ProductList} />} />
          <Route path='/admin/products/new' element={<RemountComponent component={ProductForm} />} />
          <Route path='/admin/products/:productId/edit' element={<RemountComponent component={ProductForm} />} />
          <Route path='/admin/orders' element={<RemountComponent component={OrderList} />} />
          <Route path='/admin/orders/:id' element={<RemountComponent component={OrderDetails} />} />
          <Route path='/admin/users' element={<RemountComponent component={UserList} />} />
          <Route path='/admin/users/:userId' element={<RemountComponent component={UserDetail} />} />
          <Route path='/admin/messages' element={<RemountComponent component={Messages} />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App; 