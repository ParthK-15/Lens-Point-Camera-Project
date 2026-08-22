require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const productRoutes = require("./routes/product.js");
const adminRoutes = require("./routes/admin.js");
const authRoutes = require("./routes/auth.js");
const paymentRoutes = require("./routes/payment.js");

const app = express();

// Trust reverse proxy for HTTPS detection on Vercel
app.set("trust proxy", 1);

// ─── Database Connection (Serverless Friendly) ──────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumatiColourLab";
let dbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!dbPromise) {
    dbPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    }).catch((err) => {
      dbPromise = null;
      console.error("❌ DB Connection Error:", err.message);
    });
  }
  await dbPromise;
};

// Ensure DB is connected BEFORE session & passport touch MongoDB
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error("Connection middleware error:", e);
  }
  next();
});

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session (MongoDB Persistent Store for Serverless) ─────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sumati-colour-lab-admin-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
      touchAfter: 24 * 3600, // lazy session update once every 24h
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
      httpOnly: true,
      sameSite: "lax",
      secure: "auto",
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
