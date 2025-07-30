import asyncHandler from 'express-async-handler';
import fetch from 'node-fetch';
import Order from '../models/orderModel.js';
import NotificationService from '../services/notificationService.js';
import { updateProductStock } from '../utils/stockUtils.js';
import { PAYPAL_API_BASE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '../config/paypal.js';

// Get PayPal access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await response.json();
  return data.access_token;
};

// @desc    Create PayPal checkout session
// @route   POST /api/paypal/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order from database
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Calculate prices
    const itemsPrice = Number(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2));
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const shippingPrice = Number((itemsPrice > 100 ? 0 : 10).toFixed(2));
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    const accessToken = await getAccessToken();

    // Create PayPal order
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: totalPrice.toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: itemsPrice.toString()
              },
              tax_total: {
                currency_code: 'USD',
                value: taxPrice.toString()
              },
              shipping: {
                currency_code: 'USD',
                value: shippingPrice.toString()
              }
            }
          },
          items: order.orderItems.map(item => ({
            name: item.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toString()
            },
            quantity: item.qty
          }))
        }],
        application_context: {
          return_url: `${process.env.CLIENT_URL}/order/${orderId}?success=true`,
          cancel_url: `${process.env.CLIENT_URL}/order/${orderId}?canceled=true`
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'PayPal API error');
    }

    // Find the approval URL
    const approvalUrl = data.links.find(link => link.rel === 'approve')?.href;
    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found');
    }

    res.json({ url: approvalUrl });
  } catch (error) {
    console.error('Error creating PayPal checkout session:', error);
    res.status(500).json({
      message: 'Error creating PayPal checkout session',
      error: error.message
    });
  }
});

// @desc    Handle PayPal webhook events
// @route   POST /api/paypal/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res) => {
  try {
    let event;
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (err) {
      console.error('Error parsing webhook body:', err);
      return res.status(400).json({ 
        message: 'Webhook error: Invalid payload',
        error: err.message,
        receivedBody: req.body
      });
    }

    const eventType = event.event_type;

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        const resource = event.resource;
        const orderId = resource.purchase_units[0].reference_id;
        const paypalOrderId = resource.id;

        // Get the order from database
        const order = await Order.findById(orderId);
        if (!order) {
          console.error('Order not found in database:', orderId);
          return res.status(404).json({ message: 'Order not found' });
        }

        // Capture the payment
        const accessToken = await getAccessToken();
        
        const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const captureData = await captureResponse.json();

        if (captureData.status === 'COMPLETED') {
          // Update order status
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: paypalOrderId,
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: resource.payer?.email_address,
            payment_method: 'paypal'
          };

          await order.save();

          // Update stock and send notifications
          try {
            await updateProductStock(order.orderItems);
            
            await NotificationService.paymentProcessed(
              order.user,
              orderId,
              order.totalPrice
            );
          } catch (error) {
            console.error('Error in post-payment processing:', error);
          }
        } else {
          console.error('Payment capture failed:', captureData);
          throw new Error('Payment capture failed');
        }

        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED':
        // We already handled this in the APPROVED event
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const orderId = event.resource.purchase_units[0].reference_id;

        const order = await Order.findById(orderId);
        if (order) {
          order.paymentResult = {
            status: 'FAILED',
            update_time: new Date().toISOString(),
            error_message: event.resource.status_details?.reason || 'Payment failed'
          };
          await order.save();
        }
        break;
      }

      default:
        // Unhandled event type
    }

    res.json({ 
      received: true,
      event_type: eventType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({ 
      message: 'Webhook error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}); 