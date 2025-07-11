import dotenv from 'dotenv';
import users from './data/users.js';
import sampleProducts from './data/sampleProducts.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import data function
const importData = async () => {
  try {
    // Clear all collections
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);

    // Get admin user id
    const adminUser = createdUsers[0]._id;

    // Add user reference to products and add missing fields
    // Remove custom string _id fields and let MongoDB generate ObjectIds
    const productsWithUser = sampleProducts.map(product => {
      // Create a new object without the _id field
      const { _id, ...productWithoutId } = product;
      
      return { 
        ...productWithoutId, 
        user: adminUser,
        // Set default values for required fields that might be missing
        brand: product.brand || product.category,
        countInStock: product.countInStock || 10,
        numReviews: product.numReviews || 0,
        featured: product.bestseller || false,
        isNew: product.isNew || false,
      };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsWithUser);

    console.log('Data imported!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdProducts.length} products`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data function
const destroyData = async () => {
  try {
    // Clear all collections
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Determine which function to run based on command line arg
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 