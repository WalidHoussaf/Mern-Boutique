import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import BackToDashboard from '../../components/BackToDashboard';
import useTranslation from '../../utils/useTranslation';

const OrderList = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [orderToMarkDelivered, setOrderToMarkDelivered] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(t('failed_load_orders'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated() && user?.isAdmin) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/orders/${orderToDelete._id}`);
      setOrders(orders.filter(o => o._id !== orderToDelete._id));
      toast.success(t('order_deleted_success'));
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || t('failed_delete_order'));
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const confirmMarkDelivered = (order) => {
    setOrderToMarkDelivered(order);
    setShowDeliveredModal(true);
  };

  const handleMarkDelivered = async () => {
    if (!orderToMarkDelivered) return;
    
    try {
      const response = await axios.put(`/api/orders/${orderToMarkDelivered._id}/deliver`);
      
      setOrders(orders.map(o => 
        o._id === orderToMarkDelivered._id ? response.data : o
      ));
      
      toast.success(t('order_updated'));
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || t('failed_update_order'));
    } finally {
      setShowDeliveredModal(false);
      setOrderToMarkDelivered(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchMatch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') {
      return searchMatch;
    } else if (statusFilter === 'paid') {
      return searchMatch && order.isPaid && !order.isDelivered;
    } else if (statusFilter === 'delivered') {
      return searchMatch && order.isDelivered;
    } else if (statusFilter === 'unpaid') {
      return searchMatch && !order.isPaid;
    }
    
    return searchMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return t('not_available');
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (num) => {
    return '$' + num.toFixed(2);
  };

  return (
    <div>
      <BackToDashboard />
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{t('orders')}</h2>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search_orders')}
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
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="all">{t('all_orders')}</option>
              <option value="unpaid">{t('unpaid')}</option>
              <option value="paid">{t('paid_not_delivered')}</option>
              <option value="delivered">{t('delivered')}</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">{t('no_orders_found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('order_id')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('total')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('payment')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('delivery')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order._id.substring(order._id.length - 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user?.name || t('unknown_user')}</div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isPaid ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('paid')} {formatDate(order.paidAt)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {t('not_paid')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isDelivered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('delivered')} {formatDate(order.deliveredAt)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {t('pending')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {t('view_details')}
                        </Link>
                        {order.isPaid && !order.isDelivered && (
                          <button
                            onClick={() => confirmMarkDelivered(order)}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                          >
                            {t('mark_delivered')}
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(order)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          {t('delete')}
                        </button>
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
                  {t('confirm_delete_desc').replace('#{orderId}', orderToDelete?._id.substring(orderToDelete?._id.length - 8))}
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

        {/* Mark as Delivered Confirmation Modal */}
        {showDeliveredModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowDeliveredModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirm_delivery_status_list')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('confirm_delivery_desc_list').replace('#{orderId}', orderToMarkDelivered?._id.substring(orderToMarkDelivered?._id.length - 8))}
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    onClick={() => setShowDeliveredModal(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
                    onClick={handleMarkDelivered}
                  >
                    {t('confirm')}
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

export default OrderList; 