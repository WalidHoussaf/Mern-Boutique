import mongoose from 'mongoose';
import Product from './models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateFeaturesFr = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all products that don't have featuresFr field
    const productsWithoutFeaturesFr = await Product.find({
      $or: [
        { featuresFr: { $exists: false } },
        { featuresFr: null }
      ]
    });

    console.log(`Found ${productsWithoutFeaturesFr.length} products without featuresFr field`);

    if (productsWithoutFeaturesFr.length === 0) {
      console.log('All products already have featuresFr field');
      return;
    }

    // Update each product to add empty featuresFr array
    for (const product of productsWithoutFeaturesFr) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { featuresFr: [] } }
      );
      console.log(`Updated product: ${product.name}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateFeaturesFr(); 