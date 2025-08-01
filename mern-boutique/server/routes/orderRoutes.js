import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  deleteOrder,
  deleteMultipleOrders
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/bulk')
  .delete(protect, admin, deleteMultipleOrders);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router; 