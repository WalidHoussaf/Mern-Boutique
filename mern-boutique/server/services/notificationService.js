import Notification from '../models/notificationModel.js';

class NotificationService {
    static async createNotification(userId, type, title, message) {
        try {
            return await Notification.create({
                userId,
                type,
                title,
                message
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
            // Don't throw - we don't want notification failures to break main functionality
            return null;
        }
    }

    // Format device info to be more user-friendly
    static formatDeviceInfo(userAgent) {
        try {
            // Extract browser name
            const browserMatch = userAgent.match(/(Firefox|Chrome|Safari|Edge|MSIE|Opera)\/?\s*(\d+)/i);
            const browser = browserMatch ? browserMatch[1] : 'Unknown Browser';

            // Extract OS
            let os = 'Unknown OS';
            if (userAgent.includes('Windows')) {
                os = 'Windows';
            } else if (userAgent.includes('Mac')) {
                os = 'Mac';
            } else if (userAgent.includes('Linux')) {
                os = 'Linux';
            } else if (userAgent.includes('iPhone')) {
                os = 'iPhone';
            } else if (userAgent.includes('Android')) {
                os = 'Android';
            }

            // Extract device type
            let deviceType = 'Desktop';
            if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
                deviceType = 'Mobile';
            } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
                deviceType = 'Tablet';
            }

            return `${browser} on ${deviceType} (${os})`;
        } catch (error) {
            console.error('Error formatting device info:', error);
            return 'Unknown Device';
        }
    }

    // Order related notifications
    static async orderPlaced(userId, orderId) {
        return this.createNotification(
            userId,
            'success',
            'Order Placed Successfully',
            `Your order #${orderId} has been placed successfully. Please complete the payment to process your order.`
        );
    }

    static async orderShipped(userId, orderId, trackingNumber) {
        return this.createNotification(
            userId,
            'info',
            'Order Shipped',
            `Order #${orderId} has been shipped! ${trackingNumber ? `Tracking number: ${trackingNumber}` : ''}`
        );
    }

    static async orderDelivered(userId, orderId) {
        return this.createNotification(
            userId,
            'success',
            'Order Delivered',
            `Order #${orderId} has been delivered. Enjoy your purchase!`
        );
    }

    // Authentication related notifications
    static async newLogin(userId, deviceInfo) {
        const formattedDevice = this.formatDeviceInfo(deviceInfo);
        return this.createNotification(
            userId,
            'info',
            'New Login Detected',
            `New login detected from ${formattedDevice}. If this wasn't you, please secure your account.`
        );
    }

    // Product related notifications
    static async productBackInStock(userId, productName) {
        return this.createNotification(
            userId,
            'info',
            'Product Back in Stock',
            `${productName} is back in stock! Order now while supplies last.`
        );
    }

    static async wishlistItemOnSale(userId, productName, discount) {
        return this.createNotification(
            userId,
            'info',
            'Wishlist Item on Sale',
            `${productName} from your wishlist is now on sale with ${discount}% off!`
        );
    }

    // Account related notifications
    static async profileUpdated(userId) {
        return this.createNotification(
            userId,
            'success',
            'Profile Updated',
            'Your profile information has been successfully updated.'
        );
    }

    // Review related notifications
    static async reviewApproved(userId, productName) {
        return this.createNotification(
            userId,
            'success',
            'Review Approved',
            `Your review for ${productName} has been approved and is now live.`
        );
    }

    static async reviewResponse(userId, productName) {
        return this.createNotification(
            userId,
            'info',
            'New Response to Your Review',
            `A seller has responded to your review of ${productName}. Check it out!`
        );
    }

    // Promotion notifications
    static async specialPromotion(userId, promoDetails) {
        return this.createNotification(
            userId,
            'info',
            'Special Offer Available',
            `${promoDetails}. Check it out now!`
        );
    }

    static async categoryPromotion(userId, category, discount) {
        return this.createNotification(
            userId,
            'info',
            `${category} Sale!`,
            `All ${category} items are now ${discount}% off! Limited time offer.`
        );
    }

    // Payment related notifications
    static async paymentProcessed(userId, orderId, amount) {
        return this.createNotification(
            userId,
            'success',
            'Payment Successful',
            'Payment processed successfully'
        );
    }

    static async paymentFailed(userId, orderId, reason) {
        return this.createNotification(
            userId,
            'error',
            'Payment Failed',
            'Payment processing failed'
        );
    }

    // Password related notifications
    static async passwordChanged(userId) {
        return this.createNotification(
            userId,
            'success',
            'Password Updated',
            'Your password has been successfully changed. If you did not make this change, please contact support immediately.'
        );
    }
}

export default NotificationService; 