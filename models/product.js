const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    key: String,
    value: String,
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
  },
  { _id: false }
);

const connectivitySchema = new mongoose.Schema(
  {
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

    sliderImages: [String],

    description: String,

    features: [String],

    specifications: [specificationSchema],

    detailSections: [sectionSchema],

    designSections: [sectionSchema],

    connectivity: [connectivitySchema],

    youtubeVideo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);