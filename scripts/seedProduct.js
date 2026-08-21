require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/product");
const cameras = require("../data/camera.js");
const lenses = require("../data/lens.js");
const tripods = require("../data/tripod.js");
const accessories = require("../data/accessories.js");

async function seedDB() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumatiColourLab";
  await mongoose.connect(MONGO_URI);

  await Product.deleteMany({});
  console.log("Old products deleted");

  const allProducts = [...cameras, ...lenses, ...tripods, ...accessories];
  await Product.insertMany(allProducts);
  console.log(`Inserted ${allProducts.length} products total (${cameras.length} cameras, ${lenses.length} lenses, ${tripods.length} tripods, ${accessories.length} accessories).`);

  mongoose.connection.close();
}

seedDB();