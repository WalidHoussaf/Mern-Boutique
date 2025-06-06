import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/top', getTopProducts);
router.route('/:id/reviews').post(protect, createProductReview);

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router; 