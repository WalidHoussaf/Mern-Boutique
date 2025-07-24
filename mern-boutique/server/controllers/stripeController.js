import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import Order from '../models/orderModel.js';
import NotificationService from '../services/notificationService.js';

// @desc    Create Stripe checkout session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order from database
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      res.status(404);
      throw new Error('Order not found');
    }

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
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is missing');
      return res.status(500).send('Webhook secret is not configured');
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        if (!session.metadata?.orderId) {
          console.error('No orderId found in session metadata');
          return res.status(400).send('No orderId in session metadata');
        }

        // Update order status
        const order = await Order.findById(session.metadata.orderId);
        if (!order) {
          console.error('Order not found:', session.metadata.orderId);
          return res.status(404).send('Order not found');
        }

        // Map Stripe payment status to our order status
        const paymentStatus = session.payment_status === 'paid' ? 'COMPLETED' 
                          : session.payment_status === 'unpaid' ? 'PENDING'
                          : 'FAILED';

        // Update the order
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: session.id,
          status: paymentStatus,
          update_time: new Date().toISOString(),
          email_address: session.customer_email,
          payment_method: 'stripe'
        };

        try {
          await order.save();
          
          // Create payment success notification
          if (paymentStatus === 'COMPLETED') {
            await NotificationService.paymentProcessed(
              session.metadata.userId,
              session.metadata.orderId,
              order.totalPrice
            );
          }
          
          res.json({ received: true, type: event.type });
        } catch (err) {
          console.error('Error saving order:', err);
          return res.status(500).send(`Error updating order: ${err.message}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        res.json({ received: true, type: event.type });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('PaymentIntent failed:', {
          id: paymentIntent.id,
          error: paymentIntent.last_payment_error
        });
        res.json({ received: true, type: event.type });
        break;
      }

      default:
        res.json({ received: true, type: event.type });
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
}); 