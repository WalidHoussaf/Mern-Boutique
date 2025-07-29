import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configure environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Raw body parsing for webhooks must be before any other middleware
const rawBodyMiddleware = express.raw({ type: 'application/json' });

app.post('/api/stripe/webhook', rawBodyMiddleware, async (req, res) => {
  console.log('Stripe webhook received');
  const { handleWebhook } = await import('./controllers/stripeController.js');
  return handleWebhook(req, res);
});

app.post('/api/paypal/webhook', rawBodyMiddleware, async (req, res) => {
  console.log('PayPal webhook received');
  try {
    // Convert raw body to string
    req.body = req.body.toString('utf8');
    const { handleWebhook } = await import('./controllers/paypalController.js');
    return handleWebhook(req, res);
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Regular body parsing middleware - must be after the webhook endpoints
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS with PayPal headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Stripe-Signature',
    'Paypal-Auth-Algo',
    'Paypal-Cert-Url',
    'Paypal-Transmission-Id',
    'Paypal-Transmission-Sig',
    'Paypal-Transmission-Time'
  ]
}));

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Get current file directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created');
}

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes (excluding webhook routes which are handled above)
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/paypal', paypalRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 