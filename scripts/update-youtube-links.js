const mongoose = require("mongoose");
const Product = require("../models/product");

const YOUTUBE_MAPPINGS = [
  { keywords: ["sony", "a7", "iii"], url: "https://www.youtube.com/embed/2m0400Q_214" },
  { keywords: ["canon", "r5"], url: "https://www.youtube.com/embed/V3aM_s_5ZqI" },
  { keywords: ["nikon", "z6"], url: "https://www.youtube.com/embed/Xq4vV6z63x8" },
  { keywords: ["fujifilm", "x-t4"], url: "https://www.youtube.com/embed/2P5G1f9x4d0" },
  { keywords: ["sony", "24-70mm"], url: "https://www.youtube.com/embed/V6dK7q7b9_o" },
  { keywords: ["peak", "design", "tripod"], url: "https://www.youtube.com/embed/6n6J290z2x8" },
  { keywords: ["godox", "v1"], url: "https://www.youtube.com/embed/Q4X-3hZ6Rj8" },
  { keywords: ["sanDisk", "extreme"], url: "https://www.youtube.com/embed/5D_3jJ6xZ9o" }
];

async function updateYouTubeLinks() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/sumatiColourLab");
    console.log("Connected to MongoDB.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;
    for (const product of products) {
      if (!product.youtubeUrl) {
        const titleLower = product.title.toLowerCase();
        const match = YOUTUBE_MAPPINGS.find(m => m.keywords.every(kw => titleLower.includes(kw)));
        if (match) {
          product.youtubeUrl = match.url;
        } else {
          product.youtubeUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(product.title + " camera review")}`;
        }
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} products with YouTube embed links.`);
    mongoose.connection.close();
  } catch (err) {
    console.error("Error updating YouTube links:", err);
    process.exit(1);
  }
}

updateYouTubeLinks();
