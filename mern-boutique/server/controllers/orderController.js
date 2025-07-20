import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'; // Added import for Product
import NotificationService from '../services/notificationService.js';

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

    // Validate payment method
    const validPaymentMethods = ['visa', 'mastercard', 'paypal', 'stripe'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      res.status(400);
      throw new Error('Invalid payment method');
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

    // Create notification for order placement
    await NotificationService.orderPlaced(req.user._id, createdOrder._id);

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
  const order = await Order.findById(req.params.id);

  if (order) {
    // Validate payment result
    const { id, status, update_time, payment_method, email_address, error_message } = req.body;
    
    if (!id || !status || !update_time || !payment_method) {
      res.status(400);
      throw new Error('Invalid payment result data');
    }

    // Update order payment details
    order.isPaid = status === 'COMPLETED';
    order.paidAt = status === 'COMPLETED' ? Date.now() : undefined;
    order.paymentResult = {
      id,
      status,
      update_time,
      payment_method,
      email_address,
      error_message
    };

    const updatedOrder = await order.save();

    // Send appropriate notification based on payment status
    if (status === 'COMPLETED') {
      await NotificationService.paymentProcessed(
        order.user,
        order._id,
        order.totalPrice
      );
    } else if (status === 'FAILED') {
      await NotificationService.paymentFailed(
        order.user,
        order._id,
        error_message || 'Payment processing failed'
      );
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Handle failed payment
// @route   PUT /api/orders/:id/payment-failed
// @access  Private
const handlePaymentFailure = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.paymentResult = {
            id: req.body.id,
            status: 'FAILED',
            update_time: Date.now(),
            error: req.body.error
        };

        const updatedOrder = await order.save();

        // Send failure notification
        await NotificationService.paymentFailed(
            order.user,
            order._id,
            req.body.error || 'Payment processing error'
        );

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
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

    // Create notification for order delivery
    await NotificationService.orderDelivered(order.user, order._id);

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