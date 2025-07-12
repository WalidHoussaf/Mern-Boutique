import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import UserSettings from '../models/userSettingsModel.js';
import Wishlist from '../models/wishlistModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Handle profile image upload if file is present
    if (req.file) {
      // Create the URL for accessing the uploaded image
      const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      user.profileImage = profileImageUrl;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Check if user has orders
    const userOrders = await Order.find({ user: req.params.id });
    
    if (userOrders.length > 0) {
      res.status(400);
      throw new Error('Cannot delete user with associated orders. Please delete their orders first or assign them to another user.');
    }
    
    // If no orders, proceed with deletion
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
    
  } catch (error) {
    // If this is a mongoose error not already handled
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    // Get user's orders
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    
    // Calculate statistics
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
    
    // Add statistics to user object
    const userWithStats = {
      ...user._doc,
      orderCount,
      totalSpent,
      lastOrderDate
    };
    
    res.json(userWithStats);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updatedUser = await user.save();
    
    // Get user's orders for statistics
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    
    // Calculate statistics
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
    
    // Add statistics to response
    const userWithStats = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt,
      orderCount,
      totalSpent,
      lastOrderDate
    };

    res.json(userWithStats);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getUserSettings = asyncHandler(async (req, res) => {
  // Try to find existing settings
  let settings = await UserSettings.findOne({ user: req.user._id });
  
  // If no settings exist yet, create default settings
  if (!settings) {
    settings = await UserSettings.create({
      user: req.user._id,
      // Default values are defined in the schema
    });
  }
  
  res.json(settings);
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateUserSettings = asyncHandler(async (req, res) => {
  // Try to find existing settings
  let settings = await UserSettings.findOne({ user: req.user._id });
  
  // If no settings exist yet, create new settings
  if (!settings) {
    settings = new UserSettings({
      user: req.user._id,
      ...req.body
    });
  } else {
    // Update fields from request body
    if (req.body.currency) settings.currency = req.body.currency;
    if (req.body.theme) settings.theme = req.body.theme;
    if (req.body.language) settings.language = req.body.language;
    
    // Update nested objects if present
    if (req.body.notifications) {
      Object.keys(req.body.notifications).forEach(key => {
        if (settings.notifications.hasOwnProperty(key)) {
          settings.notifications[key] = req.body.notifications[key];
        }
      });
    }
    
    if (req.body.privacy) {
      Object.keys(req.body.privacy).forEach(key => {
        if (settings.privacy.hasOwnProperty(key)) {
          settings.privacy[key] = req.body.privacy[key];
        }
      });
    }
  }
  
  // Save the settings
  const updatedSettings = await settings.save();
  
  res.json(updatedSettings);
});

// @desc    Delete own user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteOwnAccount = asyncHandler(async (req, res) => {
  try {
    // Get user from request (set by auth middleware)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent admin from deleting their account
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Admin accounts cannot be deleted. Please contact the system administrator.');
    }
    
    // Check if user has orders
    const userOrders = await Order.find({ user: req.user._id });
    
    if (userOrders.length > 0) {
      res.status(400);
      throw new Error('Cannot delete account with associated orders. Please contact support for assistance.');
    }
    
    // Delete user settings if they exist
    await UserSettings.findOneAndDelete({ user: req.user._id });
    
    // Delete user's wishlist if it exists
    await Wishlist.findOneAndDelete({ user: req.user._id });
    
    // Delete the user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
    
  } catch (error) {
    // If this is a mongoose error not already handled
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getUserSettings,
  updateUserSettings,
  deleteOwnAccount,
}; 