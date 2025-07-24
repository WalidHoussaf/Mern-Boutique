import Product from '../models/productModel.js';

/**
 * Updates product stock quantities atomically after a successful order
 * @param {Array} orderItems - Array of order items with product ID and quantity
 * @returns {Promise<void>}
 */
export const updateProductStock = async (orderItems) => {
  try {
    // Use Promise.all to update all products in parallel
    await Promise.all(
      orderItems.map(async (item) => {
        // Use findOneAndUpdate with $inc operator for atomic decrement
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            countInStock: { $gte: item.qty } // Ensure we have enough stock
          },
          {
            $inc: { countInStock: -item.qty } // Decrement stock atomically
          },
          {
            new: true, // Return updated document
            runValidators: true // Run schema validators
          }
        );

        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product ${item.product}`);
        }
      })
    );
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}; 