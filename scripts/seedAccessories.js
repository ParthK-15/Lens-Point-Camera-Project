require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/product");
const accessories = require("../data/accessories.js");

async function seedAccessories() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumatiColourLab";
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to database");

  // Check which products already exist by slug
  const existingSlugs = (await Product.find({}, "slug").lean()).map(
    (p) => p.slug
  );
  const newProducts = accessories.filter(
    (p) => !existingSlugs.includes(p.slug)
  );

  if (newProducts.length === 0) {
    console.log("⚠️  All accessory products already exist in the database.");
  } else {
    await Product.insertMany(newProducts);
    console.log(`✅ Inserted ${newProducts.length} new accessory products:`);
    newProducts.forEach((p) => console.log(`   • ${p.title} (${p.category})`));
  }

  const total = await Product.countDocuments();
  const cats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  console.log(`\n📊 Total products in database: ${total}`);
  cats.forEach((c) => console.log(`   ${c._id}: ${c.count}`));

  await mongoose.connection.close();
}

seedAccessories().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
