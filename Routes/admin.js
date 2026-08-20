const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/admin");
const Product = require("../models/product");
const Order = require("../models/order");

// ─── Multer config for image uploads ───────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Vercel's filesystem is read-only except /tmp
    const uploadDir = process.env.VERCEL
      ? "/tmp"
      : path.join(__dirname, "..", "public", "assets", "images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Auth Middleware ────────────────────────────────────────────
function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  res.redirect("/admin/login");
}

// ─── Helper: generate slug from title ──────────────────────────
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Helper: parse form arrays ─────────────────────────────────
function parseProductForm(body) {
  const data = {
    title: body.title,
    slug: body.slug || generateSlug(body.title),
    company: body.company,
    category: body.category,
    subCategory: body.subCategory || "",
    price: parseFloat(body.price),
    image: body.image || "",
    description: body.description || "",
    youtubeVideo: body.youtubeVideo || "",
    sliderImages: [],
    features: [],
    specifications: [],
    detailSections: [],
    designSections: [],
    connectivity: [],
  };

  // Slider images
  if (body.sliderImages) {
    const imgs = Array.isArray(body.sliderImages)
      ? body.sliderImages
      : [body.sliderImages];
    data.sliderImages = imgs.filter((s) => s.trim());
  }

  // Features
  if (body.features) {
    const feats = Array.isArray(body.features)
      ? body.features
      : [body.features];
    data.features = feats.filter((s) => s.trim());
  }

  // Specifications
  if (body.specKey && body.specValue) {
    const keys = Array.isArray(body.specKey) ? body.specKey : [body.specKey];
    const vals = Array.isArray(body.specValue)
      ? body.specValue
      : [body.specValue];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] && keys[i].trim()) {
        data.specifications.push({
          key: keys[i].trim(),
          value: (vals[i] || "").trim(),
        });
      }
    }
  }

  // Detail Sections
  if (body.detailTitle) {
    const titles = Array.isArray(body.detailTitle)
      ? body.detailTitle
      : [body.detailTitle];
    const descs = Array.isArray(body.detailDesc)
      ? body.detailDesc
      : [body.detailDesc || ""];
    const imgs = Array.isArray(body.detailImage)
      ? body.detailImage
      : [body.detailImage || ""];
    for (let i = 0; i < titles.length; i++) {
      if (titles[i] && titles[i].trim()) {
        data.detailSections.push({
          title: titles[i].trim(),
          description: (descs[i] || "").trim(),
          image: (imgs[i] || "").trim(),
        });
      }
    }
  }

  // Design Sections
  if (body.designTitle) {
    const titles = Array.isArray(body.designTitle)
      ? body.designTitle
      : [body.designTitle];
    const descs = Array.isArray(body.designDesc)
      ? body.designDesc
      : [body.designDesc || ""];
    const imgs = Array.isArray(body.designImage)
      ? body.designImage
      : [body.designImage || ""];
    for (let i = 0; i < titles.length; i++) {
      if (titles[i] && titles[i].trim()) {
        data.designSections.push({
          title: titles[i].trim(),
          description: (descs[i] || "").trim(),
          image: (imgs[i] || "").trim(),
        });
      }
    }
  }

  // Images textarea or array
  if (body.images) {
    const rawImgs = typeof body.images === "string" ? body.images.split("\n") : body.images;
    data.images = rawImgs.map((s) => s.trim()).filter((s) => s.length > 0);
    data.sliderImages = data.images;
  }

  // YouTube video URL
  data.youtubeUrl = body.youtubeUrl || body.youtubeVideo || "";
  data.youtubeVideo = data.youtubeUrl;

  // Highlights / Features
  if (body.highlights) {
    const hl = typeof body.highlights === "string" ? body.highlights.split("\n") : body.highlights;
    data.highlights = hl.map((s) => s.trim()).filter((s) => s.length > 0);
    data.features = data.highlights;
  }

  // JSON inputs for specDetails, designBlocks, connectivity
  if (body.specDetails) {
    try {
      const parsed = typeof body.specDetails === "string" ? JSON.parse(body.specDetails) : body.specDetails;
      data.specDetails = parsed.map(item => ({
        image: item.image || "",
        heading: item.heading || item.title || "",
        text: item.text || item.description || "",
        title: item.heading || item.title || "",
        description: item.text || item.description || ""
      }));
      data.detailSections = data.specDetails;
    } catch(e) {}
  }

  if (body.designBlocks) {
    try {
      const parsed = typeof body.designBlocks === "string" ? JSON.parse(body.designBlocks) : body.designBlocks;
      data.designBlocks = parsed.map(item => ({
        image: item.image || "",
        heading: item.heading || item.title || "",
        text: item.text || item.description || "",
        title: item.heading || item.title || "",
        description: item.text || item.description || ""
      }));
      data.designSections = data.designBlocks;
    } catch(e) {}
  }

  if (body.connectivity) {
    try {
      const parsed = typeof body.connectivity === "string" ? JSON.parse(body.connectivity) : body.connectivity;
      data.connectivity = parsed.map(item => ({
        name: item.name || item.title || "",
        title: item.name || item.title || "",
        description: item.description || ""
      }));
    } catch(e) {}
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /admin/login
router.get("/login", (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin/login", { error: null });
});

// POST /admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.render("admin/login", { error: "Invalid email or password." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.render("admin/login", { error: "Invalid email or password." });
    }

    req.session.adminId = admin._id;
    req.session.adminName = admin.name;
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.render("admin/login", { error: "Something went wrong. Try again." });
  }
});

// GET /admin/logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════

router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const statusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.render("admin/dashboard", {
      adminName: req.session.adminName,
      totalProducts,
      totalOrders,
      totalRevenue,
      categoryStats,
      statusStats,
      recentOrders,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Server Error");
  }
});

// ═══════════════════════════════════════════════════════════════
//  PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// GET /admin/products — List all
router.get("/products", isAdmin, async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "all") {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.render("admin/products", {
      adminName: req.session.adminName,
      products,
      search: search || "",
      category: category || "all",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET /admin/products/suggestions — Autocomplete suggestions
router.get("/products/suggestions", isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.json([]);
    }
    const products = await Product.find(
      { title: { $regex: query.trim(), $options: "i" } },
      "title slug image category price"
    )
      .limit(10)
      .lean();
    res.json(products);
  } catch (err) {
    console.error("Suggestions error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GET /admin/products/new — New product form
router.get("/products/new", isAdmin, (req, res) => {
  res.render("admin/product-form", {
    adminName: req.session.adminName,
    product: null,
    isEdit: false,
    error: null,
  });
});

// POST /admin/products — Create product
router.post(
  "/products",
  isAdmin,
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const data = parseProductForm(req.body);

      // If image was uploaded via file
      if (req.file) {
        data.image = "/assets/images/" + req.file.filename;
      }

      // Check slug uniqueness
      const existing = await Product.findOne({ slug: data.slug });
      if (existing) {
        return res.render("admin/product-form", {
          adminName: req.session.adminName,
          product: data,
          isEdit: false,
          error:
            "A product with this slug already exists. Please use a different title or slug.",
        });
      }

      await Product.create(data);
      res.redirect("/admin/products");
    } catch (err) {
      console.error("Create product error:", err);
      res.render("admin/product-form", {
        adminName: req.session.adminName,
        product: req.body,
        isEdit: false,
        error: "Error creating product: " + err.message,
      });
    }
  }
);

// GET /admin/products/:id/edit — Edit form
router.get("/products/:id/edit", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Product not found");

    res.render("admin/product-form", {
      adminName: req.session.adminName,
      product,
      isEdit: true,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /admin/products/:id/edit — Update product
router.post(
  "/products/:id/edit",
  isAdmin,
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const data = parseProductForm(req.body);

      if (req.file) {
        data.image = "/assets/images/" + req.file.filename;
      }

      await Product.findByIdAndUpdate(req.params.id, data, {
        runValidators: true,
      });
      res.redirect("/admin/products");
    } catch (err) {
      console.error("Update product error:", err);
      const product = await Product.findById(req.params.id).lean();
      res.render("admin/product-form", {
        adminName: req.session.adminName,
        product: product || req.body,
        isEdit: true,
        error: "Error updating product: " + err.message,
      });
    }
  }
);

// POST /admin/products/:id/delete — Delete product
router.post("/products/:id/delete", isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Delete product error:", err);
    res.redirect("/admin/products");
  }
});

// ═══════════════════════════════════════════════════════════════
//  ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// GET /admin/orders — List all
router.get("/orders", isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.render("admin-orders", {
      adminName: req.session.adminName,
      orders,
      statusFilter: status || "all",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET /admin/orders/:id — Order detail
router.get("/orders/:id", isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).send("Order not found");

    res.render("admin-order-detail", {
      adminName: req.session.adminName,
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /admin/orders/:id/status — Update order status
router.post("/orders/:id/status", isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/admin/orders/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.redirect("/admin/orders");
  }
});

module.exports = router;
