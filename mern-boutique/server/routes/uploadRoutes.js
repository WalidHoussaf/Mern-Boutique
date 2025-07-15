import express from 'express';
import { uploadImages, deleteImage } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadUtils.js';

const router = express.Router();

// Route for uploading multiple images
router.post('/', protect, upload.array('images', 10), uploadImages);

// Route for deleting an image
router.delete('/:filename', protect, admin, deleteImage);

export default router; 