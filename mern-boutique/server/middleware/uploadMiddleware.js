import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store uploads in the uploads directory at the project root
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userid-timestamp.ext
    const userId = req.user._id;
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    cb(null, `user-${userId}-${timestamp}${fileExtension}`);
  },
});

// File filter to only allow certain image types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only! Please upload a valid image file (jpeg, jpg, png, gif, webp)'));
  }
};

// Initialize the upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

export default upload; 