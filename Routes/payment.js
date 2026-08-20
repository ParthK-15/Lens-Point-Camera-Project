const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

// Initialize Razorpay SDK using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// ─── POST /api/payment/create-order ────────────────────────────
// Creates a Razorpay Order ID for frontend checkout
router.post("/create-order", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }

  try {
    const { amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    // Razorpay expects amount in Paise (1 INR = 100 Paise)
    const options = {
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_API_KEY,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ success: false, message: "Failed to initiate payment with Razorpay" });
  }
});

// ─── POST /api/payment/verify ──────────────────────────────────
// Verifies Razorpay payment signature & saves order to MongoDB
router.post("/verify", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      cartData,
      totalAmount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay payment parameters" });
    }

    // Generate expected HMAC SHA256 signature
    const secret = process.env.RAZORPAY_API_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Signature mismatch:", { generatedSignature, razorpay_signature });
      return res.status(400).json({ success: false, message: "Payment verification failed! Invalid signature." });
    }

    // Process Cart Items
    const cartItems = typeof cartData === "string" ? JSON.parse(cartData) : (cartData || []);
    const items = [];

    for (const item of cartItems) {
      const product = await Product.findOne({ title: item.title });
      const rawPrice = item.price;
      const numericPrice = typeof rawPrice === "string"
        ? (parseInt(rawPrice.replace(/[^\d]/g, "")) || 0)
        : (parseFloat(rawPrice) || 0);

      items.push({
        productId: product ? product._id : null,
        title: item.title,
        price: numericPrice,
        quantity: parseInt(item.quantity) || 1,
        image: item.image || (product ? product.image : ""),
      });
    }

    // Save Order in Mongoose
    const order = new Order({
      customerName: customerName.trim(),
      customerEmail: (customerEmail || req.user.email || "").toLowerCase().trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      items,
      totalAmount: parseFloat(totalAmount) || 0,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      status: "confirmed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    await order.save();

    // Update User details & clear user's stored DB cart
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: shippingAddress.trim(),
        location: shippingAddress.trim(),
        cart: [],
      },
    });

    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ success: false, message: "Server error during payment verification" });
  }
});

module.exports = router;
