import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import Order from '../models/orderModel.js';

// @desc    Create Stripe checkout session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log('Creating checkout session for order:', orderId);

    // Get the order from database
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      res.status(404);
      throw new Error('Order not found');
    }

    console.log('Found order:', order);

    // Create line items for Stripe
    const lineItems = order.orderItems.map(item => {
      // Handle image URL
      let imageUrl = item.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Convert relative path to absolute URL
        imageUrl = `${process.env.CLIENT_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : [], // Only include images array if we have a valid URL
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.qty,
      };
    });

    console.log('Line items:', lineItems);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: orderId,
      success_url: `${process.env.CLIENT_URL}/order/${orderId}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/order/${orderId}?canceled=true`,
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString(),
      },
    });

    console.log('Stripe session created:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      message: 'Error creating checkout session', 
      error: error.message 
    });
  }
});

// @desc    Handle Stripe webhook events
// @route   POST /api/stripe/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('Received webhook event');
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event verified:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Processing completed checkout session:', session.id);
        
        // Update order status
        const order = await Order.findById(session.metadata.orderId);
        if (order) {
          console.log('Updating order:', order._id);
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: session.id,
            status: session.payment_status,
            update_time: new Date().toISOString(),
            email_address: session.customer_email,
          };
          await order.save();
          console.log('Order updated successfully');
        } else {
          console.error('Order not found:', session.metadata.orderId);
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.error('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    console.error('Request body:', req.body);
    console.error('Stripe signature:', sig);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
}); 