import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateProductTranslations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products that don't have French translation fields
    const products = await Product.find({
      $or: [
        { nameFr: { $exists: false } },
        { descriptionFr: { $exists: false } }
      ]
    });

    console.log(`Found ${products.length} products that need French translation fields`);

    // Update each product to include empty French fields
    for (const product of products) {
      const updateData = {};
      
      if (!product.nameFr) {
        updateData.nameFr = '';
      }
      
      if (!product.descriptionFr) {
        updateData.descriptionFr = '';
      }

      if (Object.keys(updateData).length > 0) {
        await Product.findByIdAndUpdate(product._id, updateData);
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log('Migration completed successfully!');
    console.log('Note: French translation fields have been added as empty strings.');
    console.log('You can now manually add French translations through the admin panel.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProductTranslations();
}

export default migrateProductTranslations; 