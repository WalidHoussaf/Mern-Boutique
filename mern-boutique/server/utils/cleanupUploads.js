// Usage: node utils/cleanupUploads.js
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Adjust these paths as needed
const uploadsDir = path.join(__dirname, '../../uploads');
const productModelPath = path.join(__dirname, '../models/productModel.js');
const productModelUrl = pathToFileURL(productModelPath).href;
const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boutique';

// Dynamically import Product model
const importProductModel = async () => {
  const { default: Product } = await import(productModelUrl);
  return Product;
};

const getAllUploadFiles = () => {
  return fs.readdirSync(uploadsDir);
};

const getAllReferencedFiles = async (Product) => {
  const products = await Product.find({});
  const referenced = new Set();
  for (const product of products) {
    if (Array.isArray(product.image)) {
      product.image.forEach((imgUrl) => {
        // Extract filename from URL or path
        const match = imgUrl.match(/\/uploads\/([^\/]+)$/);
        if (match) referenced.add(match[1]);
        else if (imgUrl && typeof imgUrl === 'string') referenced.add(path.basename(imgUrl));
      });
    }
  }
  return referenced;
};

const promptDelete = async (unusedFiles) => {
  if (unusedFiles.length === 0) {
    console.log('No unused files found.');
    return;
  }
  console.log('Unused files:');
  unusedFiles.forEach(f => console.log('  ' + f));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Delete these files? (y/N): ', (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer));
    });
  });
};

const deleteFiles = (files) => {
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log('Deleted:', file);
    } catch (err) {
      console.error('Failed to delete', file, err.message);
    }
  }
};

const main = async () => {
  await mongoose.connect(dbUri);
  const Product = await importProductModel();
  const allFiles = getAllUploadFiles();
  const referenced = await getAllReferencedFiles(Product);
  const unused = allFiles.filter(f => !referenced.has(f));
  console.log(`\nTotal files in uploads: ${allFiles.length}`);
  console.log(`Referenced by products: ${referenced.size}`);
  console.log(`Unused files: ${unused.length}`);
  if (unused.length > 0) {
    const confirm = await promptDelete(unused);
    if (confirm) deleteFiles(unused);
    else console.log('No files deleted.');
  }
  await mongoose.disconnect();
};

main().catch(err => { console.error(err); process.exit(1); }); 