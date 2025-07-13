import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import BackToDashboard from '../../components/BackToDashboard';
import useTranslation from '../../utils/useTranslation';

const ProductList = () => {
  const { t } = useTranslation();
  const { allProducts, loading } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Try the regular products endpoint instead of admin-specific endpoint
        const response = await axios.get('/api/products');
        
        // Check data structure and extract products
        if (response.data) {
          if (Array.isArray(response.data)) {
            setProducts(response.data);
          } else if (response.data.products && Array.isArray(response.data.products)) {
            setProducts(response.data.products);
          } else {
            console.warn('Unexpected product data format:', response.data);
            throw new Error('Invalid data format');
          }
        }
      } catch (error) {
        console.error('Error fetching products for admin:', error);
        
        // Only show toast if we have no fallback data
        if (!allProducts || allProducts.length === 0) {
          toast.error(t('failed_load_products'));
        }
        
        // Fallback to using allProducts from context if API fails
        setProducts(allProducts || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [allProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      toast.success(t('product_deleted'));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || t('failed_delete_product'));
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Safe formatting function
  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : '$0.00';
  };

  // Category translation function
  const translateCategory = (category) => {
    if (!category) return t('uncategorized');
    
    const categoryKey = `category_${category.toLowerCase()}`;
    return t(categoryKey) || category; // Fallback to original if translation not found
  };

  return (
    <div>
      <BackToDashboard />
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{t('products')}</h2>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search_products')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link
              to="/admin/products/new"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('add_product')}
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">{t('no_products_found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('price')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={Array.isArray(product.image) ? product.image[0] : product.image} 
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {translateCategory(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 0 
                          ? t('in_stock').replace('{count}', product.countInStock) 
                          : t('out_of_stock')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/admin/products/${product._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        >
                          {t('edit')}
                        </Link>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          {t('delete')}
                        </button>
                        <Link 
                          to={`/product/${product._id}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          {t('view')}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirm_delete')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('confirm_delete_product_desc').replace('{productName}', productToDelete?.name)}
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 ${
                      deleteLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('deleting')}
                      </div>
                    ) : t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList; 