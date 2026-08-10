const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    key: String,
    value: String,
  },
  { _id: false }
);

const specDetailSchema = new mongoose.Schema(
  {
    image: String,
    heading: String,
    text: String,
    title: String,       // Alias compatibility
    description: String, // Alias compatibility
  },
  { _id: false }
);

const connectivitySchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    description: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    company: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: []
    },

    sliderImages: [String],

    description: String,

    highlights: {
      type: [String],
      default: []
    },

    features: [String],

    specifications: [specificationSchema],

    specDetails: [specDetailSchema],
    detailSections: [specDetailSchema],

    designBlocks: [specDetailSchema],
    designSections: [specDetailSchema],

    connectivity: [connectivitySchema],

    youtubeUrl: {
      type: String,
      default: ""
    },
    youtubeVideo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);