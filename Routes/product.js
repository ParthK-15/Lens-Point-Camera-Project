const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// ─── GET /products — List all cameras ─────────────────────────
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ category: "camera" });
    res.render("products", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch products.");
  }
});

// ─── GET /products/:slug — Camera details ─────────────────────
router.get("/products/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, category: "camera" });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    res.render("product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch product.");
  }
});

// ─── GET /lenses — List all lenses ────────────────────────────
router.get("/lenses", async (req, res) => {
  try {
    const products = await Product.find({ category: "lens" });
    res.render("lenses", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch lenses.");
  }
});

// ─── GET /lenses/:slug — Lens details ─────────────────────────
router.get("/lenses/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, category: "lens" });

    if (!product) {
      return res.status(404).send("Lens not found.");
    }

    res.render("product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch lens details.");
  }
});

// ─── GET /tripods — List all tripods ──────────────────────────
router.get("/tripods", async (req, res) => {
  try {
    const products = await Product.find({ category: "tripod" });
    res.render("tripods", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch tripods.");
  }
});

// ─── GET /tripods/:slug — Tripod details ──────────────────────
router.get("/tripods/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, category: "tripod" });

    if (!product) {
      return res.status(404).send("Tripod not found.");
    }

    res.render("product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch tripod details.");
  }
});

// ═══════════════════════════════════════════════════════════════
//  DYNAMIC CATEGORY LISTINGS & DETAILS
// ═══════════════════════════════════════════════════════════════

const categoryConfigs = {
  camera: {
    title: "Cameras",
    css: "camera.css",
    js: "camera.js",
    cardClass: "camera-cards",
    priceRanges: [
      { value: "Under 20000", label: "Under ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "50000-70000", label: "₹50,000 - ₹70,000" },
      { value: "70000-100000", label: "₹70,000 - ₹1,00,000" },
      { value: "Over 100000", label: "Over ₹1,00,000" }
    ]
  },
  lens: {
    title: "Lenses",
    css: "Lens.css",
    js: "Lens.js",
    cardClass: "camera-cards",
    priceRanges: [
      { value: "Under 10000", label: "Under ₹10,000" },
      { value: "10000-30000", label: "₹10,000 - ₹30,000" },
      { value: "30000-50000", label: "₹30,000 - ₹50,000" },
      { value: "50000-90000", label: "₹50,000 - ₹90,000" },
      { value: "Over 90000", label: "Over ₹90,000" }
    ]
  },
  tripid: { // Alias mapping just in case
    title: "Tripods",
    css: "tripod.css",
    js: "tripod.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  tripod: {
    title: "Tripods",
    css: "tripod.css",
    js: "tripod.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  battery: {
    title: "Batteries",
    css: "battery.css",
    js: "battery.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 3000", label: "Under ₹3,000" },
      { value: "3000-6000", label: "₹3,000 - ₹6,000" },
      { value: "6000-10000", label: "₹6,000 - ₹10,000" },
      { value: "Over 10000", label: "Over ₹10,000" }
    ]
  },
  storage: {
    title: "Storage Options",
    css: "storage.css",
    js: "storage.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  microphone: {
    title: "Microphones",
    css: "microphones.css",
    js: "microphones.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  lighting: {
    title: "Lighting Equipment",
    css: "lightings.css",
    js: "lightings.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  gimbal: {
    title: "Gimbals",
    css: "gimbal.css",
    js: "gimbal.js",
    cardClass: "camera-cards",
    priceRanges: [
      { value: "under-15000", label: "Under ₹15,000" },
      { value: "15000-25000", label: "₹15,000 - ₹25,000" },
      { value: "25000-40000", label: "₹25,000 - ₹40,000" },
      { value: "over-40000", label: "Over ₹40,000" }
    ]
  },
  bag: {
    title: "Bags & Backpacks",
    css: "bagpack.css",
    js: "bagpack.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  }
};

// GET /category/:category — Dynamic lists for all categories
router.get("/category/:category", async (req, res) => {
  try {
    let categoryInput = req.params.category.toLowerCase();
    
    // Normalize aliases
    if (categoryInput === "tripods") categoryInput = "tripod";
    if (categoryInput === "lenses") categoryInput = "lens";
    if (categoryInput === "microphones") categoryInput = "microphone";
    if (categoryInput === "lightings") categoryInput = "lighting";
    if (categoryInput === "bagpack" || categoryInput === "bags" || categoryInput === "bagpacks") categoryInput = "bag";
    if (categoryInput === "batteries") categoryInput = "battery";

    const config = categoryConfigs[categoryInput];
    if (!config) {
      return res.status(404).send("Category not found.");
    }

    const products = await Product.find({ category: categoryInput });
    
    // Dynamically query unique brands and subcategories from db
    const brands = await Product.distinct("company", { category: categoryInput });
    const subCategories = await Product.distinct("subCategory", { category: categoryInput });

    res.render("category-products", { 
      products, 
      category: categoryInput,
      config,
      brands,
      subCategories
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch category.");
  }
});

// GET /product/:slug — Generic details view for ALL items (accepts slug or ObjectId)
router.get("/product/:slug", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    let product;

    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      product = await Product.findById(req.params.slug);
    } else {
      product = await Product.findOne({ slug: req.params.slug });
    }

    if (!product) {
      return res.status(404).send("Product not found.");
    }
    res.render("product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch product details.");
  }
});

// GET /search — Unified product search route
router.get("/search", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.render("search-results", { 
        products: [], 
        query: "", 
        brands: [], 
        categories: [] 
      });
    }

    // Find all products matching query in title, company, category, or subCategory
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subCategory: { $regex: query, $options: "i" } }
      ]
    }).lean();

    // Extract unique brands and categories to populate sidebar filters
    const brands = await Product.distinct("company");
    const categories = await Product.distinct("category");

    res.render("search-results", { 
      products, 
      query, 
      brands: brands.filter(Boolean).sort(), 
      categories: categories.filter(Boolean).sort() 
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Server Error: Search query failed.");
  }
});

// ═══════════════════════════════════════════════════════════════
//  CHECKOUT & ORDER PLACEMENT
// ═══════════════════════════════════════════════════════════════

const Order = require("../models/order");
const User = require("../models/user");

// GET /checkout — Checkout details form page
router.get("/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login?returnTo=/checkout");
  }
  res.render("checkout", { user: req.user });
});

// POST /checkout — Placed order submission handler
router.post("/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Not Authorized");
  }

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
      cartData,
      totalAmount,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !cartData) {
      return res.status(400).send("Bad Request: Missing required order fields");
    }

    const cartItems = JSON.parse(cartData);
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).send("Bad Request: Cart is empty");
    }

    // Resolve product references and format cart items
    const items = [];
    for (const item of cartItems) {
      const product = await Product.findOne({ title: item.title });
      const numericPrice = parseInt(item.price.replace(/[^\d]/g, "")) || 0;
      items.push({
        productId: product ? product._id : null,
        title: item.title,
        price: numericPrice,
        quantity: item.quantity || 1,
        image: item.image,
      });
    }

    // Create the Mongoose Order
    const order = new Order({
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      items,
      totalAmount: parseFloat(totalAmount) || 0,
      notes: notes ? notes.trim() : "",
      status: "pending",
    });

    await order.save();

    // Optionally update user's profile with address and phone if not set yet
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        phone: customerPhone.trim(),
        address: shippingAddress.trim(),
      },
    });

    res.render("checkout-success", { order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).send("Server Error: Failed to place order");
  }
});

// GET /orders — User's order history page
router.get("/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login?returnTo=/orders");
  }

  try {
    const user = req.user;

    // Find all orders placed by this user's email address
    const orders = await Order.find({
      customerEmail: user.email.toLowerCase().trim()
    }).sort({ createdAt: -1 }).lean();

    res.render("orders", { orders, user });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).send("Server Error: Could not fetch order history.");
  }
});

module.exports = router;