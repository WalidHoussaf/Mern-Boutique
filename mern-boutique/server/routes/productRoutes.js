import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  voteReview,
  getProductReviews,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/featured', getFeaturedProducts);
router.get('/top', getTopProducts);

router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

// Review routes
router.route('/:id/reviews').get(getProductReviews).post(protect, createProductReview);
router
  .route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);
router.route('/:id/reviews/:reviewId/vote').post(protect, voteReview);

export default router; 