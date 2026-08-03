const mongoose = require("mongoose");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
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
adminSchema.methods.comparePassword = async function (candidatePassword) {
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

module.exports = mongoose.model("Admin", adminSchema);
