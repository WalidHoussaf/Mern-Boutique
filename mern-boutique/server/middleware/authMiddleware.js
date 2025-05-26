import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Protect routes - verify JWT token and set user in request
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // JWT Secret from environment or fallback
  const secret = process.env.JWT_SECRET || 'abc123';

  console.log('Auth Middleware - Headers:', req.headers);
  
  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth Middleware - Token found:', token.substring(0, 10) + '...');

      // Verify token
      const decoded = jwt.verify(token, secret);
      console.log('Auth Middleware - Token decoded:', decoded);

      // Find user by id (without password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error('Auth Middleware - User not found for id:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('Auth Middleware - User found:', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin
      });

      next();
    } catch (error) {
      console.error('Auth Middleware - Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.error('Auth Middleware - No token provided');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin }; 