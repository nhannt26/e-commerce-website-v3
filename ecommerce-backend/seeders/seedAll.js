require("dotenv").config();
const mongoose = require("mongoose");

console.log("MONGODB_URI =", process.env.MONGODB_URI); // 👈 debug tạm

async function seedAll() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 MongoDB connected");

    const seedCategories = require("./seedCategories");
    const seedProducts = require("./seedProducts");
    const seedReviews = require("./seedReviews");

    await seedCategories();
    await seedProducts();
    await seedReviews();

    console.log("🎉 ALL DATA SEEDED SUCCESSFULLY");
    process.exit();
  } catch (error) {
    console.error("❌ Seeder error:", error.message);
    process.exit(1);
  }
}

seedAll();
