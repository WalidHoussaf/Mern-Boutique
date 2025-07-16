import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js'; // Added import for Order

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 100;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const category = req.query.category
    ? { category: { $regex: req.query.category, $options: 'i' } }
    : {};

  const count = await Product.countDocuments({ ...keyword, ...category });
  const products = await Product.find({ ...keyword, ...category })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  console.log(`Fetched ${products.length} products out of ${count} total`);
  
  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;
  
  const products = await Product.find({ featured: true })
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Create product endpoint hit');
    console.log('Request user:', req.user ? req.user._id : 'No user');
    
    const {
      name,
      nameFr,
      price,
      description,
      descriptionFr,
      image,
      images,
      brand,
      category,
      countInStock,
      featured,
      isNew,
      bestseller,
      sizes,
      colors,
      features,
      featuresFr,
      originalPrice,
      subCategory,
      date
    } = req.body;

    // Handle image field - prioritize image, then images, then default
    let productImage;
    if (image) {
      // Check if images are base64 encoded (from client-side FileReader)
      if (Array.isArray(image) && image.length > 0) {
        // If they're base64 strings from the client's FileReader preview
        if (typeof image[0] === 'string' && image[0].startsWith('data:image')) {
          console.log('Base64 images detected, using placeholder instead');
          productImage = ['https://via.placeholder.com/600x600'];
        } else {
          productImage = image;
        }
      } else {
        productImage = Array.isArray(image) ? image : [image];
      }
    } else if (images) {
      // Same check for images field
      if (Array.isArray(images) && images.length > 0) {
        if (typeof images[0] === 'string' && images[0].startsWith('data:image')) {
          console.log('Base64 images detected in images field, using placeholder instead');
          productImage = ['https://via.placeholder.com/600x600'];
        } else {
          productImage = images;
        }
      } else {
        productImage = Array.isArray(images) ? images : [images];
      }
    } else {
      productImage = ['https://via.placeholder.com/600x600'];
    }

    console.log('Final image data:', 
      Array.isArray(productImage) ? 
        `Array with ${productImage.length} items` : 
        typeof productImage
    );

    // If request body contains product data, use it; otherwise use default values
    const product = new Product({
      name: name || 'Sample name',
      nameFr: nameFr || '',
      price: price !== undefined ? price : 0,
      user: req.user._id,
      image: productImage,
      brand: brand || 'Sample brand',
      category: category || 'Sample category',
      countInStock: countInStock !== undefined ? countInStock : 0,
      numReviews: req.body.numReviews !== undefined ? parseInt(req.body.numReviews) : 0,
      description: description || 'Sample description',
      descriptionFr: descriptionFr || '',
      featured: featured !== undefined ? featured : false,
      isNew: isNew !== undefined ? isNew : false,
      bestseller: bestseller !== undefined ? bestseller : false,
      sizes: sizes || [],
      colors: colors || [],
      features: features || [],
      featuresFr: featuresFr || [],
      originalPrice: originalPrice !== undefined ? originalPrice : null,
      subCategory: subCategory || '',
      date: date !== undefined ? date : null,
      rating: req.body.rating !== undefined ? parseFloat(req.body.rating) : 0
    });

    console.log('Product model created with rating:', product.rating, typeof product.rating);
    const createdProduct = await product.save();
    console.log('Product saved successfully with ID:', createdProduct._id);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error in product creation:', error);
    res.status(500).json({ 
      message: 'Server error in product creation', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Update product endpoint hit for ID:', req.params.id);
    console.log('Request user:', req.user ? req.user._id : 'No user');
    
    const {
      name,
      nameFr,
      price,
      description,
      descriptionFr,
      image,
      images,
      brand,
      category,
      countInStock,
      featured,
      isNew,
      bestseller,
      sizes,
      colors,
      features,
      featuresFr,
      originalPrice,
      subCategory,
      date
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Process image data
    let productImage = product.image; // Default to existing images
    
    // Handle image field - prioritize image, then images
    if (image) {
      // Check if images are base64 encoded (from client-side FileReader)
      if (Array.isArray(image) && image.length > 0) {
        // If they're base64 strings from the client's FileReader preview
        if (typeof image[0] === 'string' && image[0].startsWith('data:image')) {
          console.log('Base64 images detected, keeping existing images');
          // Keep existing images since we don't have image upload API yet
          productImage = product.image;
        } else {
          productImage = image;
        }
      } else {
        productImage = Array.isArray(image) ? image : [image];
      }
    } else if (images) {
      // Same check for images field
      if (Array.isArray(images) && images.length > 0) {
        if (typeof images[0] === 'string' && images[0].startsWith('data:image')) {
          console.log('Base64 images detected in images field, keeping existing images');
          productImage = product.image;
        } else {
          productImage = images;
        }
      } else {
        productImage = Array.isArray(images) ? images : [images];
      }
    }

    console.log('Final image data:', 
      Array.isArray(productImage) ? 
        `Array with ${productImage.length} items` : 
        typeof productImage
    );

    // Update product fields
    product.name = name || product.name;
    product.nameFr = nameFr !== undefined ? nameFr : product.nameFr;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.descriptionFr = descriptionFr !== undefined ? descriptionFr : product.descriptionFr;
    product.image = productImage;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.featured = featured !== undefined ? featured : product.featured;
    product.isNew = isNew !== undefined ? isNew : product.isNew;
    product.bestseller = bestseller !== undefined ? bestseller : product.bestseller;
    product.sizes = sizes || product.sizes;
    product.colors = colors || product.colors;
    product.features = features || product.features;
    product.featuresFr = featuresFr || product.featuresFr;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.subCategory = subCategory || product.subCategory;
    product.date = date !== undefined ? date : product.date;
    
    // Explicitly handle rating and numReviews to ensure they're saved correctly
    if (req.body.rating !== undefined) {
      product.rating = parseFloat(req.body.rating) || 0;
      console.log(`Setting product ${product._id} rating to:`, product.rating, typeof product.rating);
    }
    
    if (req.body.numReviews !== undefined) {
      product.numReviews = parseInt(req.body.numReviews) || 0;
    }

    const updatedProduct = await product.save();
    console.log('Product updated successfully with ID:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in product update:', error);
    res.status(500).json({ 
      message: 'Server error in product update', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    // Check if user has purchased the product
    const orders = await Order.find({ 
      user: req.user._id,
      'orderItems.product': product._id,
      isPaid: true
    });
    const verifiedPurchase = orders.length > 0;

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      images: images || [],
      verifiedPurchase,
      helpfulVotes: 0,
      votedBy: []
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to update this review');
      }

      review.rating = Number(rating) || review.rating;
      review.comment = comment || review.comment;
      review.images = images || review.images;

      // Recalculate average rating
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.json({ message: 'Review updated' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
      }

      product.reviews.pull(req.params.reviewId);
      product.numReviews = product.reviews.length;
      
      if (product.reviews.length > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Vote on review helpfulness
// @route   POST /api/products/:id/reviews/:reviewId/vote
// @access  Private
const voteReview = asyncHandler(async (req, res) => {
  const { helpful } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      const existingVote = review.votedBy.find(
        vote => vote.user.toString() === req.user._id.toString()
      );

      if (existingVote) {
        if (existingVote.helpful !== helpful) {
          // Change vote
          existingVote.helpful = helpful;
          review.helpfulVotes += helpful ? 1 : -1;
        }
      } else {
        // New vote
        review.votedBy.push({
          user: req.user._id,
          helpful
        });
        review.helpfulVotes += helpful ? 1 : 0;
      }

      await product.save();
      res.json({ message: 'Vote recorded', helpfulVotes: review.helpfulVotes });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name profileImage location profession');

  if (product) {
    // Sort reviews by date, verified purchase, and helpful votes
    const sortedReviews = product.reviews.sort((a, b) => {
      if (a.verifiedPurchase !== b.verifiedPurchase) {
        return b.verifiedPurchase ? 1 : -1;
      }
      if (a.helpfulVotes !== b.helpfulVotes) {
        return b.helpfulVotes - a.helpfulVotes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(sortedReviews);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// @desc    Get featured reviews (4 and 5 stars)
// @route   GET /api/products/reviews/featured
// @access  Public
const getFeaturedReviews = asyncHandler(async (req, res) => {
  // Find all products that have reviews with rating >= 4
  const products = await Product.find({
    'reviews.rating': { $gte: 4 }
  }).populate('reviews.user', 'name profileImage location profession');

  // Extract all reviews with rating >= 4 and add product info
  let featuredReviews = [];
  products.forEach(product => {
    const highRatedReviews = product.reviews
      .filter(review => review.rating >= 4)
      .map(review => ({
        ...review.toObject(),
        product: {
          _id: product._id,
          name: product.name
        }
      }));
    featuredReviews.push(...highRatedReviews);
  });

  // Sort by rating (highest first) and date (newest first)
  featuredReviews.sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Limit to 10 reviews
  featuredReviews = featuredReviews.slice(0, 10);

  res.json(featuredReviews);
});

export {
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
}; 