import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShopContext } from '../../context/ShopContext';
import axios from 'axios';
import BackToDashboard from '../../components/BackToDashboard';
import useTranslation from '../../utils/useTranslation';

const ProductForm = () => {
  const { t } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshProducts } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [product, setProduct] = useState({
    name: '',
    nameFr: '',
    brand: '',
    category: '',
    subCategory: '',
    description: '',
    descriptionFr: '',
    price: '',
    originalPrice: '',
    countInStock: '',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 0,
    numReviews: 0,
    features: [],
    featuresFr: [],
    images: [],
    isNew: false,
    featured: false,
    bestseller: false
  });

  // Available categories, brands, subcategories for selection
  const categories = ['Men', 'Women', 'Kids'];
  const subcategories = ['Topwear', 'Bottomwear', 'Winterwear', 'Accessories', 'Jackets', 'Shirts', 'Dresses', 'Pants', 'Shoes', 'Hats'];
  const [newSubCategory, setNewSubCategory] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!isAuthenticated() || !user?.isAdmin) {
      navigate('/login?redirect=/admin/dashboard');
      return;
    }

    // If productId exists, fetch product data
    if (productId && productId !== 'new') {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/products/${productId}`);
          
          // Format the data to match our form structure
          const productData = {
            ...response.data,
            originalPrice: response.data.originalPrice || '',
            // Ensure sizes is always an array and has default values if empty
            sizes: Array.isArray(response.data.sizes) && response.data.sizes.length > 0 
              ? response.data.sizes 
              : ['S', 'M', 'L', 'XL'],
            // Ensure rating is always a number
            rating: typeof response.data.rating === 'number' ? response.data.rating : 0,
            numReviews: response.data.numReviews || 0,
            subCategory: response.data.subCategory || '',
            features: response.data.features || [],
            featuresFr: response.data.featuresFr || [],
            images: Array.isArray(response.data.image) ? response.data.image : response.data.image ? [response.data.image] : []
          };
          
          setProduct(productData);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error(t('failed_load_product'));
          navigate('/admin/products');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [productId, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for rating to ensure it's within 0-5 range
    if (name === 'rating') {
      // Restrict to 0-5 range and maximum one decimal place
      let ratingValue = value === '' ? 0 : parseFloat(parseFloat(value).toFixed(1));
      if (isNaN(ratingValue)) ratingValue = 0;
      if (ratingValue > 5) ratingValue = 5;
      if (ratingValue < 0) ratingValue = 0;
      
      setProduct({
        ...product,
        [name]: ratingValue
      });
      return;
    }
    
    setProduct({
      ...product,
      [name]: name === 'price' || name === 'originalPrice' || name === 'countInStock' || name === 'numReviews'
        ? value === '' ? '' : Number(value)
        : value
    });
  };

  const handleSizeToggle = (size) => {
    setProduct(prev => {
      if (prev.sizes.includes(size)) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, size]
        };
      }
    });
  };

  const handleFeatureChange = (index, value, lang = 'en') => {
    if (lang === 'fr') {
      const updatedFeaturesFr = [...product.featuresFr];
      updatedFeaturesFr[index] = value;
      setProduct({
        ...product,
        featuresFr: updatedFeaturesFr
      });
    } else {
      const updatedFeatures = [...product.features];
      updatedFeatures[index] = value;
      setProduct({
        ...product,
        features: updatedFeatures
      });
    }
  };

  const addFeature = () => {
    setProduct({
      ...product,
      features: [...product.features, ''],
      featuresFr: [...product.featuresFr, '']
    });
  };

  const removeFeature = (index) => {
    const updatedFeatures = product.features.filter((_, i) => i !== index);
    const updatedFeaturesFr = product.featuresFr.filter((_, i) => i !== index);
    setProduct({
      ...product,
      features: updatedFeatures,
      featuresFr: updatedFeaturesFr
    });
  };

  // Replace handleImageUpload with new logic for uploading to /api/upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    // Limit to 5 images
    if (product.images.length + files.length > 5) {
      toast.warning(t('maximum_images'));
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      // Upload to /api/upload
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const urls = response.data.data.map((img) => img.url);
        setProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...urls],
        }));
        toast.success(t('images_uploaded').replace('{count}', urls.length));
      } else {
        toast.error(t('image_upload_failed'));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(t('failed_upload_images'));
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Update removeImage to remove by index from URLs
  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (product.sizes.length === 0) {
      toast.error(t('please_select_size'));
      return;
    }
    
    if (product.images.length === 0) {
      toast.error(t('please_upload_image'));
      return;
    }
    
    // Prepare data for API
    const productData = {
      ...product,
      // Convert empty strings to null or appropriate values for numerical fields
      originalPrice: product.originalPrice === '' ? null : Number(product.originalPrice),
      price: product.price === '' ? 0 : Number(product.price),
      countInStock: product.countInStock === '' ? 0 : Number(product.countInStock),
      rating: typeof product.rating === 'number' ? product.rating : parseFloat(product.rating || 0),
      numReviews: product.numReviews === '' ? 0 : Number(product.numReviews),
      // Ensure sizes is an array
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      // Use images array directly - our server now handles both base64 and URLs
      image: product.images, // Use URLs
      // Include boolean flags
      isNew: Boolean(product.isNew),
      featured: Boolean(product.featured),
      bestseller: Boolean(product.bestseller),
      features: product.features,
      featuresFr: product.featuresFr
    };
    
    setIsSubmitting(true);
    try {
      let response;
      
      if (productId && productId !== 'new') {
        // Update existing product
        response = await axios.put(`/api/products/${productId}`, productData);
        toast.success(t('product_updated'));
      } else {
        // Create new product
        response = await axios.post('/api/products', productData);
        toast.success(t('product_created'));
      }
      
      // Refresh products in context to show latest data
      await refreshProducts();
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('failed_save_product');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewSubCategory = () => {
    if (!newSubCategory || newSubCategory.trim() === '') {
      toast.error(t('enter_subcategory_name'));
      return;
    }
    
    // Check if subcategory already exists
    if (subcategories.includes(newSubCategory)) {
      toast.error(t('subcategory_exists'));
      return;
    }
    
    // Set the new subcategory as the selected subcategory
    setProduct({
      ...product,
      subCategory: newSubCategory
    });
    
    // Reset the new subcategory input
    setNewSubCategory('');
    
    toast.success(t('subcategory_added').replace('{name}', newSubCategory));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <BackToDashboard />
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {productId && productId !== 'new' ? t('edit_product') : t('add_new_product')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('product_name_english')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t('enter_product_name')}
                />
              </div>
              
              <div>
                <label htmlFor="nameFr" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('product_name_french')}
                </label>
                <input
                  type="text"
                  id="nameFr"
                  name="nameFr"
                  value={product.nameFr}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t('enter_product_name_fr')}
                />
              </div>
              
              <div>
                <label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {t('brand')} *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t('enter_brand_name')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c6 0 10 6 10 6s-4 6-10 6-10-6-10-6 4-6 10-6zm0 10a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  {t('category')} *
                </label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gradient-to-r from-white to-gray-50"
                >
                  <option value="">{t('select_category')}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                </div>
                
                <div>
                  <label htmlFor="subCategory" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {t('subcategory')} *
                  </label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={product.subCategory}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gradient-to-r from-white to-gray-50"
                  >
                    <option value="">{t('select_subcategory')}</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="newSubCategory" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('add_new_subcategory')}
                </label>
                <div className="flex bg-gray-50 rounded-md shadow-sm">
                  <input
                    type="text"
                    id="newSubCategory"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-secondary focus:border-secondary bg-white"
                    placeholder={t('enter_new_subcategory')}
                  />
                  <button
                    type="button"
                    onClick={addNewSubCategory}
                    className="px-4 py-2 bg-secondary text-white rounded-r-md hover:bg-secondary/90 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('add')}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 italic">
                  {t('custom_subcategory_note')}
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description_english')} *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t('enter_product_description')}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="descriptionFr" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description_french')}
                </label>
                <textarea
                  id="descriptionFr"
                  name="descriptionFr"
                  value={product.descriptionFr}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder={t('enter_product_description_fr')}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('price')} ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('original_price')} ($)
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={product.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('stock_quantity')} *
                  </label>
                  <input
                    type="number"
                    id="countInStock"
                    name="countInStock"
                    value={product.countInStock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('rating_0_5')}
                  </label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={product.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label htmlFor="numReviews" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('number_of_reviews')}
                  </label>
                  <input
                    type="number"
                    id="numReviews"
                    name="numReviews"
                    value={product.numReviews}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  {t('available_sizes')} *
                </span>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-md border ${
                        product.sizes.includes(size) 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {t('product_features')}
                </span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-500 mb-4 italic">
                    {t('features_description')}
                  </p>
                  <div className="space-y-3">
                {product.features.map((feature, index) => (
                      <div key={index} className="flex flex-col md:flex-row items-center group bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all gap-2 md:gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value, 'en')}
                          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder={t('enter_product_feature_english')}
                        />
                        <input
                          type="text"
                          value={product.featuresFr[index] || ''}
                          onChange={(e) => handleFeatureChange(index, e.target.value, 'fr')}
                          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder={t('enter_product_feature_fr')}
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 p-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('remove_feature')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                ))}
                  </div>
                {product.features.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{t('no_features_added')}</p>
                  </div>
                )}
              <button
                type="button"
                onClick={addFeature}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-primary/80 to-primary text-white rounded-md hover:shadow-md transition-all flex items-center justify-center"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('add_feature')}
              </button>
              </div>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                {t('product_images')} *
              </span>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadLoading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">{t('click_to_upload')}</span> {t('drag_and_drop')}
                        </p>
                        <p className="text-xs text-gray-500">{t('file_types')}</p>
                      </>
                    )}
                  </div>
                <input
                    id="dropzone-file" 
                  type="file"
                    className="hidden" 
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadLoading}
                />
              </label>
          </div>
        </div>
        
            <div className="pt-4">
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {t('product_status_flags')}
                </span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        id="isNew"
                        name="isNew"
                        type="checkbox"
                        checked={product.isNew}
                        onChange={(e) => setProduct({...product, isNew: e.target.checked})}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isNew" className="ml-2 block text-sm text-gray-700">
                        <span className="font-medium">{t('new_arrival')}</span>
                        <span className="block text-xs text-gray-500">{t('new_arrival_desc')}</span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        checked={product.featured}
                        onChange={(e) => setProduct({...product, featured: e.target.checked})}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                        <span className="font-medium">{t('featured')}</span>
                        <span className="block text-xs text-gray-500">{t('featured_desc')}</span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="bestseller"
                        name="bestseller"
                        type="checkbox"
                        checked={product.bestseller}
                        onChange={(e) => setProduct({...product, bestseller: e.target.checked})}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-700">
                        <span className="font-medium">{t('bestseller')}</span>
                        <span className="block text-xs text-gray-500">{t('bestseller_desc')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
          <button
            type="submit"
            disabled={isSubmitting}
                className={`w-full px-6 py-3 text-white rounded-lg flex items-center justify-center ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    {productId && productId !== 'new' ? t('updating') : t('creating')}
                  </>
            ) : (
                  <>{productId && productId !== 'new' ? t('update_product') : t('create_product')}</>
            )}
          </button>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 