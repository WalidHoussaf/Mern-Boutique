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
  getFeaturedReviews,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes that need to be matched first
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/featured', getFeaturedProducts);
router.get('/top', getTopProducts);
router.get('/reviews/featured', getFeaturedReviews);

// Review routes
router.route('/:id/reviews').get(getProductReviews).post(protect, createProductReview);
router
  .route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);
router.route('/:id/reviews/:reviewId/vote').post(protect, voteReview);

// Product routes with :id parameter
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router; 