import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    images: {
      type: [String],
      default: [],
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    votedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      helpful: Boolean,
    }],
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    nameFr: {
      type: String,
      required: false,
    },
    image: {
      type: [String],
      required: true,
    },
    brand: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionFr: {
      type: String,
      required: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 10,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [String],
      required: false,
    },
    colors: {
      type: [String],
      required: false,
    },
    features: {
      type: [String],
      required: false,
    },
    featuresFr: {
      type: [String],
      required: false,
    },
    date: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product; 