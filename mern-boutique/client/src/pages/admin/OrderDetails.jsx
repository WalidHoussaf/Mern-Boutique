import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import useTranslation from '../../utils/useTranslation';

const OrderDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(ShopContext);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markDeliveredLoading, setMarkDeliveredLoading] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !user?.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/orders/${id}`);
        const orderData = response.data;
        
        // Ensure all price fields exist with proper values
        if (orderData) {
          // Calculate itemsPrice if it's missing
          if (!orderData.itemsPrice) {
            orderData.itemsPrice = orderData.orderItems?.reduce(
              (sum, item) => sum + (item.price * item.qty || 0), 
              0
            ) || 0;
          }
          
          // Ensure other price fields have values
          orderData.shippingPrice = orderData.shippingPrice || 0;
          orderData.taxPrice = orderData.taxPrice || 0;
          
          // Verify total price or recalculate it
          if (!orderData.totalPrice) {
            orderData.totalPrice = 
              orderData.itemsPrice + 
              orderData.shippingPrice + 
              orderData.taxPrice;
          }
        }
        
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error(t('failed_load_order'));
        navigate('/admin/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, user, navigate]);

  const handleMarkDelivered = async () => {
    setMarkDeliveredLoading(true);
    try {
      const response = await axios.put(`/api/orders/${id}/deliver`);
      setOrder(response.data);
      toast.success(t('order_marked_delivered'));
      setShowDeliveredModal(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || t('failed_mark_delivered'));
    } finally {
      setMarkDeliveredLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/orders/${id}`);
      toast.success(t('order_deleted_success'));
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || t('failed_delete_order'));
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('not_available');
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (num) => {
    if (num === undefined || num === null) return '$0.00';
    return '$' + num.toFixed(2);
  };
  
  // Calculate the actual total from order items
  const calculateOrderTotal = () => {
    if (!order || !order.orderItems) return { itemsPrice: 0, total: 0 };
    
    const itemsPrice = order.orderItems.reduce(
      (sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 
      0
    );
    
    const shippingPrice = order.shippingPrice || 0;
    const taxPrice = order.taxPrice || 0;
    const calculatedTotal = itemsPrice + shippingPrice + taxPrice;
    
    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      calculatedTotal
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('order_not_found')}</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t('back_to_orders')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/orders')}
                className="mr-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                {t('order_details')}
              </h2>
            </div>
            <p className="text-gray-500 mt-1">
              {t('order_id')}: <span className="font-medium text-gray-700">{order._id}</span>
            </p>
            <p className="text-gray-500">
              {t('placed_on')}: <span className="font-medium text-gray-700">{formatDate(order.createdAt)}</span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {!order.isDelivered && order.isPaid && (
              <button
                onClick={() => setShowDeliveredModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('mark_as_delivered')}
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t('delete_order')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('order_status')}</h3>
            <div className="flex items-center">
              {order.isDelivered ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {t('delivered_on')} {formatDate(order.deliveredAt)}
                </span>
              ) : order.isPaid ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {t('paid_not_delivered')}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {t('not_paid')}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('payment_status')}</h3>
            <div>
              {order.isPaid ? (
                <div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {t('paid')}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{t('date')}: {formatDate(order.paidAt)}</p>
                  {order.paymentResult && (
                    <p className="text-sm text-gray-700">{t('method')}: {order.paymentMethod}</p>
                  )}
                </div>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {t('not_paid')}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('customer')}</h3>
            <p className="text-sm font-medium text-gray-800">{order.user?.name || t('unknown_user')}</p>
            <p className="text-sm text-gray-600">{order.user?.email || t('no_email_available')}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('order_total')}</h3>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(calculateOrderTotal().calculatedTotal)}</p>
            <p className="text-xs text-gray-500">
              {order.orderItems?.length || 0} {(order.orderItems?.length || 0) === 1 ? t('item') : t('items')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('order_items')}</h3>
            <div className="border rounded-lg overflow-hidden">
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
                      {t('quantity')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(order.orderItems || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(item.price || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.qty || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency((item.price || 0) * (item.qty || 0))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('order_summary')}</h3>
              {(() => {
                const { itemsPrice, shippingPrice, taxPrice, calculatedTotal } = calculateOrderTotal();
                const displayTotal = calculatedTotal;
                
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('items')}:</span>
                      <span className="font-medium">{formatCurrency(itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('shipping')}:</span>
                      <span className="font-medium">{formatCurrency(shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tax')}:</span>
                      <span className="font-medium">{formatCurrency(taxPrice)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">{t('total')}:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(displayTotal)}</span>
                    </div>
                    {Math.abs(displayTotal - (order.totalPrice || 0)) > 0.01 && (
                      <div className="text-xs text-orange-600 italic text-right">
                        {t('calculated_total_differs')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('shipping_address')}</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">{t('name')}:</span> {order.user?.name || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('address')}:</span> {order.shippingAddress?.address || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('city')}:</span> {order.shippingAddress?.city || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('postal_code')}:</span> {order.shippingAddress?.postalCode || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">{t('country')}:</span> {order.shippingAddress?.country || 'N/A'}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-gray-700">
                      <span className="font-medium">{t('phone')}:</span> {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('payment_method')}</h3>
                <p className="text-gray-700">
                  {order.paymentMethod || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Delivered Modal */}
      {showDeliveredModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeliveredModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('confirm_delivery_status')}</h3>
              <p className="text-gray-600 mb-6 text-center">
                {t('confirm_delivery_desc')}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                  onClick={() => setShowDeliveredModal(false)}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    markDeliveredLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={handleMarkDelivered}
                  disabled={markDeliveredLoading}
                >
                  {markDeliveredLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('processing')}
                    </div>
                  ) : t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('confirm_delete')}</h3>
              <p className="text-gray-600 mb-6 text-center">
                {t('confirm_delete_order_desc')}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
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
                  ) : t('delete_order_confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails; 