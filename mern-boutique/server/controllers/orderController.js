import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'; // Added import for Product

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    console.log('Creating new order. User ID:', req.user?._id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      res.status(400);
      throw new Error('Missing required fields');
    }

    // Ensure user exists in req
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    // Validate stock availability for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(400);
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.countInStock}, Requested: ${item.qty}`);
      }
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
    });

    console.log('Order object created, saving to database...');
    const createdOrder = await order.save();
    console.log('Order saved successfully:', createdOrder._id);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in addOrderItems:', error);
    res.status(500);
    throw new Error(`Failed to create order: ${error.message}`);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'countInStock');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('orderItems.product', 'countInStock');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Validate stock availability before processing payment
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(400);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}. Available: ${product.countInStock}, Requested: ${item.qty}`);
    }
  }

  // Update stock for each ordered item
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    product.countInStock = Math.max(0, product.countInStock - item.qty);
    await product.save();
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order removed successfully' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  deleteOrder,
}; 