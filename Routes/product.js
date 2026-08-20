const express = require("express");
const router = express.Router();
const Product = require("../models/product");

const camerasData = require("../data/camera.js");
const lensesData = require("../data/lens.js");
const tripodsData = require("../data/tripod.js");
const accessoriesData = require("../data/accessories.js");

const allStaticProducts = [...camerasData, ...lensesData, ...tripodsData, ...accessoriesData];

// GET /api/products/search (and /api/search) — Live search JSON API for autocomplete dropdown
const searchApiHandler = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json([]);
    }

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let products = [];

    try {
      products = await Product.find({
        $or: [
          { title: { $regex: safeQuery, $options: "i" } },
          { company: { $regex: safeQuery, $options: "i" } },
          { category: { $regex: safeQuery, $options: "i" } },
          { subCategory: { $regex: safeQuery, $options: "i" } },
          { description: { $regex: safeQuery, $options: "i" } }
        ]
      })
        .select("title price image slug _id company category subCategory")
        .limit(20)
        .lean();
    } catch (dbErr) {
      console.warn("MongoDB search error, using static fallback dataset:", dbErr.message);
    }

    // Fallback to static product dataset if database returns 0 results or throws error
    if (!products || products.length === 0) {
      const qLower = query.toLowerCase();
      products = allStaticProducts.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const company = (item.company || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const subCategory = (item.subCategory || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        return (
          title.includes(qLower) ||
          company.includes(qLower) ||
          category.includes(qLower) ||
          subCategory.includes(qLower) ||
          description.includes(qLower)
        );
      }).slice(0, 20);
    }

    const formattedResults = products.map((item) => ({
      _id: item._id || item.slug,
      name: item.title || item.name,
      brand: item.company || item.brand || "Generic",
      category: item.subCategory || item.category || "Equipment",
      price: item.price,
      imageUrl: item.image || item.imageUrl,
      slug: item.slug
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("API Search error:", err);
    res.json([]);
  }
};

router.get("/api/products/search", searchApiHandler);
router.get("/api/search", searchApiHandler);

// GET /mobile-search — Dedicated Mobile Search Page
router.get("/mobile-search", async (req, res) => {
  try {
    let initialProducts = [];
    try {
      initialProducts = await Product.find({})
        .select("title price image slug _id company category subCategory")
        .limit(12)
        .lean();
    } catch (err) {
      initialProducts = allStaticProducts.slice(0, 12);
    }
    
    const formattedInitial = initialProducts.map((item) => ({
      _id: item._id || item.slug,
      name: item.title || item.name,
      brand: item.company || item.brand || "Generic",
      category: item.subCategory || item.category || "Equipment",
      price: item.price,
      imageUrl: item.image || item.imageUrl,
      slug: item.slug
    }));

    res.render("mobile-search", { initialProducts: formattedInitial });
  } catch (err) {
    console.error("Mobile search route error:", err);
    res.render("mobile-search", { initialProducts: [] });
  }
});

// ─── GET / — Home page ─────────────────────────────────────────
router.get("/", (req, res) => {
  res.render("home");
});

// ─── GET /accessories — Accessories listing ────────────────────
router.get("/accessories", (req, res) => {
  res.render("accessories");
});

// ─── GET /products — List all cameras ─────────────────────────
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ category: "camera" });
    res.render("products/products", { products });
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

    res.render("products/product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch product.");
  }
});

// ─── GET /lenses — List all lenses ────────────────────────────
router.get("/lenses", async (req, res) => {
  try {
    const products = await Product.find({ category: "lens" });
    res.render("products/lenses", { products });
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

    res.render("products/product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch lens details.");
  }
});

// ─── GET /tripods — List all tripods ──────────────────────────
router.get("/tripods", async (req, res) => {
  try {
    const products = await Product.find({ category: "tripod" });
    res.render("products/tripods", { products });
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

    res.render("products/product", { product });
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
    css: "/css/camera.css",
    js: "/js/camera.js",
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
    css: "/css/lens.css",
    js: "/js/lens.js",
    cardClass: "camera-cards",
    priceRanges: [
      { value: "Under 10000", label: "Under ₹10,000" },
      { value: "10000-30000", label: "₹10,000 - ₹30,000" },
      { value: "30000-50000", label: "₹30,000 - ₹50,000" },
      { value: "50000-90000", label: "₹50,000 - ₹90,000" },
      { value: "Over 90000", label: "Over ₹90,000" }
    ]
  },
  tripod: {
    title: "Tripods",
    css: "/css/tripod.css",
    js: "/js/tripod.js",
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
    css: "/css/battery.css",
    js: "/js/battery.js",
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
    css: "/css/storage.css",
    js: "/js/storage.js",
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
    css: "/css/microphones.css",
    js: "/js/microphones.js",
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
    css: "/css/lightings.css",
    js: "/js/lightings.js",
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
    css: "/css/gimbal.css",
    js: "/js/gimbal.js",
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
    css: "/css/bagpack.css",
    js: "/js/bagpack.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 5000", label: "Under ₹5,000" },
      { value: "5000-10000", label: "₹5,000 - ₹10,000" },
      { value: "10000-20000", label: "₹10,000 - ₹20,000" },
      { value: "20000-50000", label: "₹20,000 - ₹50,000" },
      { value: "Over 50000", label: "Over ₹50,000" }
    ]
  },
  film: {
    title: "Films & Albums",
    css: "/css/camera.css",
    js: "/js/accessories.js",
    cardClass: "tripod-cards",
    priceRanges: [
      { value: "Under 500", label: "Under ₹500" },
      { value: "500-1000", label: "₹500 - ₹1,000" },
      { value: "1000-3000", label: "₹1,000 - ₹3,000" },
      { value: "Over 3000", label: "Over ₹3,000" }
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
    if (categoryInput === "films" || categoryInput === "album" || categoryInput === "albums") categoryInput = "film";

    const config = categoryConfigs[categoryInput];
    if (!config) {
      return res.status(404).send("Category not found.");
    }

    const products = await Product.find({ category: categoryInput });
    
    // Dynamically query unique brands and subcategories from db
    const brands = await Product.distinct("company", { category: categoryInput });
    const subCategories = await Product.distinct("subCategory", { category: categoryInput });

    res.render("products/category-products", { 
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
    res.render("products/product", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: Could not fetch product details.");
  }
});

// GET /search — Redirect to /products
router.get("/search", (req, res) => {
  res.redirect("/products");
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
      cartItems: rawCartItems,
      totalAmount,
    } = req.body;

    const cartString = cartData || rawCartItems;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !cartString) {
      return res.status(400).send("Bad Request: Missing required order fields");
    }

    const cartItems = typeof cartString === "string" ? JSON.parse(cartString) : cartString;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).send("Bad Request: Cart is empty");
    }

    // Resolve product references and format cart items
    const items = [];
    for (const item of cartItems) {
      const product = await Product.findOne({ title: item.title });
      const numericPrice = typeof item.price === "string" ? (parseInt(item.price.replace(/[^\d]/g, "")) || 0) : item.price;
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

    // Update user's profile in MongoDB with name, phone, location & address
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        location: shippingAddress.trim(),
        address: shippingAddress.trim(),
      },
    });

    res.render("checkout-success", { order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).send("Server Error: Failed to place order");
  }
});

// GET /checkout-success — Order placement confirmation page
router.get("/checkout-success", async (req, res) => {
  try {
    const { orderId } = req.query;
    let order = null;
    if (orderId) {
      order = await Order.findById(orderId).lean();
    }
    res.render("checkout-success", { order });
  } catch (err) {
    res.render("checkout-success", { order: null });
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