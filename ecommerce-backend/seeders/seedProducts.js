const Category = require("../models/Category");
const Product = require("../models/Product");

async function seedProducts() {
  await Product.deleteMany();

  const phones = await Category.findOne({ slug: "phones" });
  const laptops = await Category.findOne({ slug: "laptops" });

  await Product.create([
    {
      name: "iPhone 15",
      sku: "IP15-001",
      description: "Latest Apple iPhone with powerful performance and camera.",
      price: 1200,
      compareAtPrice: 1400,
      category: phones._id,
      brand: "Apple",
      stock: 50,
      images: ["https://via.placeholder.com/600x400?text=iPhone+15"],
      tags: ["iphone", "apple", "phone"],
      featured: true,
    },
    {
      name: "Samsung Galaxy S24",
      sku: "SGS24-001",
      description: "Samsung flagship phone with stunning display.",
      price: 1000,
      category: phones._id,
      brand: "Samsung",
      stock: 30,
      images: ["https://via.placeholder.com/600x400?text=Galaxy+S24"],
      tags: ["samsung", "android"],
    },
    {
      name: "MacBook Pro M3",
      sku: "MBP-M3-001",
      description: "Apple MacBook Pro with M3 chip for professionals.",
      price: 2500,
      category: laptops._id,
      brand: "Apple",
      stock: 10,
      images: ["https://via.placeholder.com/600x400?text=MacBook+Pro"],
      tags: ["macbook", "laptop"],
    },
  ]);

  console.log("✅ Products seeded");
}

module.exports = seedProducts;
