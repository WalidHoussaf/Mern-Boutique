import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlistModel.js';
import Product from '../models/productModel.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  // Find the wishlist for the current user
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'products.product',
      select: 'name price originalPrice image brand category subCategory countInStock rating numReviews description isNew bestseller sizes date',
    });

  if (!wishlist) {
    // If no wishlist exists yet, return an empty one
    return res.json({ products: [] });
  }

  // Process the products to ensure consistent image data
  if (wishlist.products && wishlist.products.length > 0) {
    wishlist.products = wishlist.products.map(item => {
      if (item.product) {
        // Make a copy to avoid modifying the mongoose document directly
        const product = { ...item.product.toObject() };
        
        // Log the product data for debugging
        console.log(`Wishlist product ${product._id} data:`, {
          name: product.name,
          image: Array.isArray(product.image) ? `Array[${product.image.length}]` : typeof product.image,
          rating: product.rating,
          ratingType: typeof product.rating,
          originalPrice: product.originalPrice
        });
        
        return {
          ...item.toObject(),
          product
        };
      }
      return item;
    });
  }

  res.json(wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find the user's wishlist or create one if it doesn't exist
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      products: [{ product: productId }],
    });
  } else {
    // Check if product already exists in wishlist
    const productExists = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    if (productExists) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }

    // Add product to wishlist
    wishlist.products.push({ product: productId });
  }

  // Save wishlist
  await wishlist.save();

  // Return updated wishlist with populated product details
  wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products.product',
    select: 'name price originalPrice image brand category subCategory countInStock rating numReviews description isNew bestseller sizes date',
  });

  // Process the products to ensure consistent image data
  if (wishlist.products && wishlist.products.length > 0) {
    wishlist.products = wishlist.products.map(item => {
      if (item.product) {
        // Make a copy to avoid modifying the mongoose document directly
        const product = { ...item.product.toObject() };
        
        // Log the product data for debugging
        console.log(`Wishlist product ${product._id} data:`, {
          name: product.name,
          image: Array.isArray(product.image) ? `Array[${product.image.length}]` : typeof product.image,
          rating: product.rating,
          ratingType: typeof product.rating,
          originalPrice: product.originalPrice
        });
        
        return {
          ...item.toObject(),
          product
        };
      }
      return item;
    });
  }

  res.status(201).json(wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  // Find the user's wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  // Check if product exists in wishlist
  const productIndex = wishlist.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (productIndex === -1) {
    res.status(404);
    throw new Error('Product not found in wishlist');
  }

  // Remove product from wishlist
  wishlist.products.splice(productIndex, 1);

  // Save wishlist
  await wishlist.save();

  // Return updated wishlist with populated product details
  wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products.product',
    select: 'name price originalPrice image brand category subCategory countInStock rating numReviews description isNew bestseller sizes date',
  });

  // Process the products to ensure consistent image data
  if (wishlist.products && wishlist.products.length > 0) {
    wishlist.products = wishlist.products.map(item => {
      if (item.product) {
        // Make a copy to avoid modifying the mongoose document directly
        const product = { ...item.product.toObject() };
        
        // Log the product data for debugging
        console.log(`Wishlist product ${product._id} data:`, {
          name: product.name,
          image: Array.isArray(product.image) ? `Array[${product.image.length}]` : typeof product.image,
          rating: product.rating,
          ratingType: typeof product.rating,
          originalPrice: product.originalPrice
        });
        
        return {
          ...item.toObject(),
          product
        };
      }
      return item;
    });
  }

  res.json(wishlist);
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  // Find the user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  // Clear products array
  wishlist.products = [];

  // Save wishlist
  await wishlist.save();

  res.json({ message: 'Wishlist cleared', products: [] });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  // Find the user's wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.json({ inWishlist: false });
  }

  // Check if product exists in wishlist
  const productExists = wishlist.products.some(
    (item) => item.product.toString() === productId
  );

  res.json({ inWishlist: productExists });
});

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
}; 