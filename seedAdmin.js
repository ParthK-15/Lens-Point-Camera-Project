const mongoose = require("mongoose");
const Admin = require("./models/admin");
const Order = require("./models/order");
const Product = require("./models/product");

async function seedAdmin() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sumatiColourLab");
  console.log("✅ Connected to database");

  // ─── Create Admin Account ────────────────────────────────────
  const existingAdmin = await Admin.findOne({
    email: "admin@sumaticolourlab.com",
  });

  if (existingAdmin) {
    console.log("⚠️  Admin account already exists, skipping creation.");
  } else {
    await Admin.create({
      name: "Admin",
      email: "admin@sumaticolourlab.com",
      password: "admin123", // Will be hashed by the pre-save hook
    });
    console.log("✅ Admin account created");
    console.log("   📧 Email: admin@sumaticolourlab.com");
    console.log("   🔑 Password: admin123");
  }

  // ─── Create Sample Orders ───────────────────────────────────
  const orderCount = await Order.countDocuments();
  if (orderCount > 0) {
    console.log(
      `⚠️  ${orderCount} orders already exist, skipping sample orders.`
    );
  } else {
    // Get some products to reference in orders
    const products = await Product.find().limit(5).lean();

    if (products.length === 0) {
      console.log(
        "⚠️  No products found. Run seedProduct.js first, then re-run this script."
      );
    } else {
      const sampleOrders = [
        {
          customerName: "Rahul Sharma",
          customerEmail: "rahul.sharma@gmail.com",
          customerPhone: "+91 9876543210",
          shippingAddress: "42 MG Road, Nanded, Maharashtra 431602",
          items: [
            {
              productId: products[0]._id,
              title: products[0].title,
              price: products[0].price,
              quantity: 1,
              image: products[0].image,
            },
          ],
          totalAmount: products[0].price,
          status: "delivered",
        },
        {
          customerName: "Priya Patil",
          customerEmail: "priya.patil@yahoo.com",
          customerPhone: "+91 8765432109",
          shippingAddress: "15 Station Road, Aurangabad, Maharashtra 431001",
          items: [
            {
              productId: products[1] ? products[1]._id : products[0]._id,
              title: products[1] ? products[1].title : products[0].title,
              price: products[1] ? products[1].price : products[0].price,
              quantity: 1,
              image: products[1] ? products[1].image : products[0].image,
            },
            ...(products[2]
              ? [
                  {
                    productId: products[2]._id,
                    title: products[2].title,
                    price: products[2].price,
                    quantity: 1,
                    image: products[2].image,
                  },
                ]
              : []),
          ],
          totalAmount:
            (products[1] ? products[1].price : products[0].price) +
            (products[2] ? products[2].price : 0),
          status: "shipped",
        },
        {
          customerName: "Amit Kulkarni",
          customerEmail: "amit.k@outlook.com",
          customerPhone: "+91 7654321098",
          shippingAddress: "78 Camp Area, Pune, Maharashtra 411001",
          items: [
            {
              productId: products[0]._id,
              title: products[0].title,
              price: products[0].price,
              quantity: 2,
              image: products[0].image,
            },
          ],
          totalAmount: products[0].price * 2,
          status: "pending",
        },
        {
          customerName: "Sneha Deshmukh",
          customerEmail: "sneha.d@gmail.com",
          customerPhone: "+91 6543210987",
          shippingAddress: "23 Sadar Bazaar, Nagpur, Maharashtra 440001",
          items: products.slice(0, 3).map((p) => ({
            productId: p._id,
            title: p.title,
            price: p.price,
            quantity: 1,
            image: p.image,
          })),
          totalAmount: products
            .slice(0, 3)
            .reduce((sum, p) => sum + p.price, 0),
          status: "confirmed",
        },
        {
          customerName: "Vikram Joshi",
          customerEmail: "vikram.j@gmail.com",
          customerPhone: "+91 5432109876",
          shippingAddress: "56 Civil Lines, Latur, Maharashtra 413512",
          items: [
            {
              productId: products[0]._id,
              title: products[0].title,
              price: products[0].price,
              quantity: 1,
              image: products[0].image,
            },
          ],
          totalAmount: products[0].price,
          status: "cancelled",
          notes: "Customer requested cancellation — changed mind.",
        },
      ];

      await Order.insertMany(sampleOrders);
      console.log(`✅ Inserted ${sampleOrders.length} sample orders`);
    }
  }

  await mongoose.connection.close();
  console.log("\n🎉 Seed complete! You can now log in at /admin/login");
}

seedAdmin().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
