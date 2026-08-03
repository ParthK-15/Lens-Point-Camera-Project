const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════

// GET /auth/login
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("auth-login", {
    error: null,
    success: req.query.registered === "true" ? "Account created! Please sign in." : null,
  });
});

// POST /auth/login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("auth-login", {
      error: "Please fill in all fields.",
      success: null,
    });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("auth-login", {
        error: info ? info.message : "Invalid email or password.",
        success: null,
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      const returnTo = req.query.returnTo || "/";
      res.redirect(returnTo);
    });
  })(req, res, next);
});

// ═══════════════════════════════════════════════════════════════
//  SIGN UP
// ═══════════════════════════════════════════════════════════════

// GET /auth/signup
router.get("/signup", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("auth-signup", { error: null });
});

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.render("auth-signup", {
        error: "Please fill in all fields.",
      });
    }

    if (password.length < 6) {
      return res.render("auth-signup", {
        error: "Password must be at least 6 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.render("auth-signup", {
        error: "Passwords do not match.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.render("auth-signup", {
        error: "An account with this email already exists.",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Auto-login after signup
    req.logIn(user, (err) => {
      if (err) {
        return res.redirect("/auth/login?registered=true");
      }
      res.redirect("/");
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.render("auth-signup", { error: firstError });
    }

    res.render("auth-signup", {
      error: "Something went wrong. Please try again.",
    });
  }
});

// ═══════════════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════════════

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// ═══════════════════════════════════════════════════════════════
//  AUTH STATE API (for client-side detection)
// ═══════════════════════════════════════════════════════════════

// GET /auth/me — Returns current user session data as JSON
router.get("/me", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    address: req.user.address || "",
    cart: req.user.cart || [],
  });
});

// POST /auth/update-profile — Update user profile (phone, address)
router.post("/update-profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const { phone, address } = req.body;
    req.user.phone = phone || "";
    req.user.address = address || "";
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /auth/cart/sync — Overwrite database user cart with client cart
router.post("/cart/sync", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const { cart } = req.body;
    req.user.cart = cart || [];
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Cart sync error:", err);
    res.status(500).json({ error: "Failed to sync cart" });
  }
});

// ═══════════════════════════════════════════════════════════════
//  GOOGLE SIGN-IN OAUTH
// ═══════════════════════════════════════════════════════════════

// GET /auth/google — Trigger Google authentication redirect
router.get("/google", (req, res, next) => {
  const returnTo = req.query.returnTo || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: returnTo,
  })(req, res, next);
});

// GET /auth/google/callback — Handle return from Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login?error=Google+Sign-In+Failed",
  }),
  (req, res) => {
    const returnTo = req.query.state || "/";
    res.redirect(returnTo);
  }
);


// ═══════════════════════════════════════════════════════════════
//  SIMULATED APPLE SIGN-IN OAUTH
// ═══════════════════════════════════════════════════════════════

// GET /auth/apple — Render mock Apple chooser
router.get("/apple", (req, res) => {
  const returnTo = req.query.returnTo || "/";
  res.render("auth-apple-mock", { returnTo });
});

// POST /auth/apple/callback — Handle mock Apple return profile
router.post("/apple/callback", async (req, res, next) => {
  try {
    const { email, name, appleId, returnTo } = req.body;
    if (!email || !name || !appleId) {
      return res.status(400).send("Bad Request: Missing OAuth params");
    }

    let user = await User.findOne({ appleId });
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        user.appleId = appleId;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: email.toLowerCase().trim(),
          appleId,
        });
      }
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(returnTo || "/");
    });
  } catch (err) {
    console.error("Apple login callback error:", err);
    next(err);
  }
});

module.exports = router;
