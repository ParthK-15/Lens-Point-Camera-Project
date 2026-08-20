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

// ─── Database ──────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumatiColourLab";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" Database Connected — sumatiColourLab");
  })
  .catch((err) => {
    console.error(" DB Connection Error:", err);
  });

// ─── Routes ────────────────────────────────────────────────────
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/", productRoutes);

// ─── Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
