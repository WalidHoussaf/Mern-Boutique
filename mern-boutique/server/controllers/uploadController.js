import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');

// @desc    Upload images
// @route   POST /api/upload
// @access  Private
const uploadImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    // Just return the original file URLs as saved by multer
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedImages = req.files.map((file) => {
      return {
        originalname: file.originalname,
        filename: file.filename,
        url: `${baseUrl}/uploads/${file.filename}`
      };
    });

    res.status(200).json({
      success: true,
      count: uploadedImages.length,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error in image upload:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete an image
// @route   DELETE /api/upload/:filename
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404);
      throw new Error('Image not found');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
});

export { uploadImages, deleteImage }; 