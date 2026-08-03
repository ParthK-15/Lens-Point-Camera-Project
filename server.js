require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const productRoutes = require("./Routes/product.js");
const adminRoutes = require("./Routes/admin.js");
const authRoutes = require("./Routes/auth.js");

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session ──────────────────────────────────────────────────
app.use(
  session({
    secret: "sumati-colour-lab-admin-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
    },
  })
);

// ─── Passport Configuration ─────────────────────────────────────
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }
        if (!user.password) {
          return done(null, false, {
            message: "Account created via social sign-in. Please log in with Google or Apple.",
          });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value.toLowerCase().trim()
              : "";
          const googleId = profile.id;
          const name = profile.displayName || "Google User";

          let user = await User.findOne({ googleId });
          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              await user.save();
            }
          }
          if (!user) {
            user = await User.create({
              name,
              email: email || `${googleId}@google.com`,
              googleId,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);

});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Global user session variables for EJS templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ─── View Engine ───────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

// ─── Static Files ──────────────────────────────────────────────
app.use(express.static(__dirname));

// ─── Database ──────────────────────────────────────────────────
mongoose
  .connect("mongodb://127.0.0.1:27017/sumatiColourLab")
  .then(() => {
    console.log("✅ Database Connected — sumatiColourLab");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// ─── Routes ────────────────────────────────────────────────────
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/", productRoutes);

// ─── Server ────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
