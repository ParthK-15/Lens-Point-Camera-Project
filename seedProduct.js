const mongoose = require("mongoose");
const Product = require("./models/product");
const cameras = require("./Data/camera.js");
const lenses = require("./Data/lens.js");
const tripods = require("./Data/tripod.js");

async function seedDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sumatiColourLab");

  await Product.deleteMany({});
  console.log("Old products deleted");

  const allProducts = [...cameras, ...lenses, ...tripods];
  await Product.insertMany(allProducts);
  console.log(`Inserted ${allProducts.length} products total (${cameras.length} cameras, ${lenses.length} lenses, ${tripods.length} tripods).`);

  mongoose.connection.close();
}

seedDB();