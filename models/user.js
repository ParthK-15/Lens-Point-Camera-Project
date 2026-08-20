const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: false,
    },
    salt: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    appleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    cart: [
      {
        title: { type: String, required: true },
        price: { type: String, required: true },
        image: { type: String, default: "" },
        quantity: { type: Number, default: 1 },
        desc: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto.pbkdf2Sync(
    this.password,
    this.salt,
    100000,
    64,
    "sha512"
  ).toString("hex");
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !this.salt) return false;
  const hash = crypto.pbkdf2Sync(
    candidatePassword,
    this.salt,
    100000,
    64,
    "sha512"
  ).toString("hex");
  return this.password === hash;
};

module.exports = mongoose.model("User", userSchema);
