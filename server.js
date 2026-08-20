require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const productRoutes = require("./routes/product.js");
const adminRoutes = require("./routes/admin.js");
const authRoutes = require("./routes/auth.js");
const paymentRoutes = require("./routes/payment.js");

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session ──────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sumati-colour-lab-admin-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
    },
  })
);

// ─── Passport Configuration ─────────────────────────────────────
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

// Global user session variables for views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ─── View Engine (if using EJS or static views) ────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public", "pages"), { index: false }));

// ─── Database Connection (Serverless Friendly) ──────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumatiColourLab";
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ Database Connected — sumatiColourLab");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
};

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error("Connection middleware error:", e);
  }
  next();
});

// ─── Routes ────────────────────────────────────────────────────
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/", productRoutes);

// ─── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Global Server Error:", err.stack || err);
  res.status(500).send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h2>500 - Internal Server Error</h2>
      <p>${err.message || "An unexpected error occurred."}</p>
      <a href="/">Return to Home</a>
    </div>
  `);
});

// ─── Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
if (require.main === module || (process.env.NODE_ENV !== "production" && !process.env.VERCEL)) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
