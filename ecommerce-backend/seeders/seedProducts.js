const Category = require("../models/Category");
const Product = require("../models/Product");

async function getCategory(slug) {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new Error(`Category not found: ${slug}`);
  }
  return category;
}

// 🔧 helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min, max, fixed = 1) => Number((Math.random() * (max - min) + min).toFixed(fixed));

const generateSKU = (name, index) => `SKU-${index + 1}-${Date.now()}`;

async function seedProducts() {
  await Product.deleteMany();

  const electronics = await getCategory("electronics");
  const phones = await getCategory("phones");
  const laptops = await getCategory("laptops");
  const accessories = await getCategory("accessories");
  const kitchen = await getCategory("kitchen");
  const tablets = await getCategory("tablets");
  const men = await getCategory("men");
  const women = await getCategory("women");
  const bedroom = await getCategory("bedroom");

  const products = [
    // 🎧 Electronics
    {
      name: "Wireless Bluetooth Headphones",
      description: "Over-ear headphones with ANC and long battery life.",
      basePrice: 120,
      category: electronics._id,
      brand: "SoundMax",
      image: "https://images.unsplash.com/photo-1518445695753-1be9c5b1f42e",
      features: ["Bluetooth 5.0", "Noise Cancellation", "20h Battery"],
      tags: ["electronics", "audio", "headphones"],
      featured: true,
    },
    {
      name: "4K Smart LED TV 50-inch",
      description: "Ultra HD Smart TV with streaming apps.",
      basePrice: 499,
      category: electronics._id,
      brand: "VisionTech",
      image: "https://images.unsplash.com/photo-1583225152348-3e5c9b2e8c9f",
      features: ["4K UHD", "HDR10", "Voice Control"],
      tags: ["electronics", "tv", "4k"],
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "Compact speaker with powerful bass.",
      basePrice: 80,
      category: electronics._id,
      brand: "BoomSound",
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
      features: ["Water Resistant", "12h Battery"],
      tags: ["speaker", "bluetooth", "audio"],
    },

    // 📱 Phones
    {
      name: "iPhone 15",
      description: "Apple flagship smartphone with A17 chip.",
      basePrice: 1200,
      category: phones._id,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484e9c98",
      features: ["A17 Chip", "OLED Display", "Face ID"],
      tags: ["iphone", "apple", "smartphone"],
      featured: true,
      specifications: {
        screen: "6.1 inch OLED",
        cpu: "Apple A17",
        ram: "8GB",
        storage: "256GB",
        battery: "3279 mAh",
        os: "iOS",
      },
    },
    {
      name: "Samsung Galaxy S24",
      description: "High-end Android phone with AMOLED display.",
      basePrice: 1000,
      category: phones._id,
      brand: "Samsung",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
      features: ["AMOLED", "120Hz", "Triple Camera"],
      tags: ["samsung", "android", "smartphone"],
    },
    {
      name: "Google Pixel 8",
      description: "Clean Android experience with AI camera.",
      basePrice: 900,
      category: phones._id,
      brand: "Google",
      image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
      features: ["AI Camera", "Pure Android"],
      tags: ["pixel", "google", "android"],
    },

    // 💻 Laptops
    {
      name: "MacBook Pro M3",
      description: "Powerful laptop for professional users.",
      basePrice: 2500,
      category: laptops._id,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      features: ["M3 Chip", "Liquid Retina XDR"],
      tags: ["macbook", "apple", "laptop"],
      specifications: {
        cpu: "Apple M3",
        ram: "16GB",
        storage: "512GB SSD",
        screen: "14.2 inch",
        gpu: "Integrated",
        os: "macOS",
        weight: "1.6kg",
      },
    },
    {
      name: "Dell XPS 15",
      description: "Premium Windows laptop with InfinityEdge display.",
      basePrice: 1800,
      category: laptops._id,
      brand: "Dell",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
      features: ["15-inch", "Intel i7", "4K Display"],
      tags: ["dell", "windows", "laptop"],
    },
    {
      name: "Asus ROG Gaming Laptop",
      description: "High-performance gaming laptop.",
      basePrice: 2000,
      category: laptops._id,
      brand: "Asus",
      image: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9",
      features: ["RTX GPU", "144Hz Display"],
      tags: ["gaming", "asus", "laptop"],
    },

    // 🎧 Accessories
    {
      name: "AirPods Pro 2",
      description: "Wireless earbuds with ANC.",
      basePrice: 250,
      category: accessories._id,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
      features: ["ANC", "Spatial Audio"],
      tags: ["airpods", "apple", "earbuds"],
      specifications: {
        type: "In-ear",
        connectivity: "Bluetooth 5.3",
        battery: "6h (ANC on)",
        charging: "MagSafe",
        waterResistance: "IPX4",
      },
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard for gamers.",
      basePrice: 150,
      category: accessories._id,
      brand: "KeyPro",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      features: ["RGB", "Blue Switch"],
      tags: ["keyboard", "gaming"],
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse.",
      basePrice: 70,
      category: accessories._id,
      brand: "Logitech",
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db",
      features: ["Ergonomic", "Wireless"],
      tags: ["mouse", "logitech"],
    },

    // 🍳 Kitchen
    {
      name: "Electric Rice Cooker",
      description: "Smart rice cooker with auto modes.",
      basePrice: 90,
      category: kitchen._id,
      brand: "Philips",
      image: "https://images.unsplash.com/photo-1606813909359-9c2c4d0a2e64",
      features: ["Auto Cook", "Keep Warm"],
      tags: ["kitchen", "appliance"],
      specifications: {
        power: "800W",
        capacity: "1.8L",
        voltage: "220V",
        material: "Stainless Steel",
      },
    },
    {
      name: "Air Fryer",
      description: "Healthy cooking with less oil.",
      basePrice: 130,
      category: kitchen._id,
      brand: "Tefal",
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
      features: ["Oil-less", "Digital Control"],
      tags: ["airfryer", "kitchen"],
      specifications: {
        power: "800W",
        capacity: "1.8L",
        voltage: "220V",
        material: "Stainless Steel",
      },
    },
    {
      name: "Blender Machine",
      description: "High-speed blender for smoothies.",
      basePrice: 110,
      category: kitchen._id,
      brand: "Panasonic",
      image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b",
      features: ["High Speed", "Glass Jar"],
      tags: ["blender", "kitchen"],
      specifications: {
        power: "800W",
        capacity: "1.8L",
        voltage: "220V",
        material: "Stainless Steel",
      },
    },

    // 📱 Tablets
    {
      name: "iPad Pro 12.9",
      description: "High-performance tablet with M2 chip.",
      basePrice: 1300,
      category: tablets._id,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
      features: ["M2 Chip", "Liquid Retina", "Face ID"],
      tags: ["ipad", "tablet", "apple"],
      featured: true,
    },
    {
      name: "Samsung Galaxy Tab S9",
      description: "Premium Android tablet with AMOLED display.",
      basePrice: 900,
      category: tablets._id,
      brand: "Samsung",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90",
      features: ["AMOLED", "120Hz", "S Pen"],
      tags: ["tablet", "samsung", "android"],
    },

    // 👔 Men Fashion
    {
      name: "Men Classic Denim Jacket",
      description: "Stylish denim jacket for men.",
      basePrice: 80,
      category: men._id,
      brand: "Levi's",
      image: "https://images.unsplash.com/photo-1521334884684-d80222895322",
      features: ["Denim", "Slim Fit"],
      tags: ["men", "fashion", "jacket"],
    },
    {
      name: "Men Casual Sneakers",
      description: "Comfortable sneakers for daily wear.",
      basePrice: 95,
      category: men._id,
      brand: "Nike",
      image: "https://images.unsplash.com/photo-1528701800489-20be9c3ea9b3",
      features: ["Breathable", "Lightweight"],
      tags: ["men", "shoes", "sneakers"],
      specifications: {
        material: "Denim",
        fit: "Slim Fit",
        size: "M / L / XL",
        origin: "Vietnam",
      },
    },

    // 👗 Women Fashion
    {
      name: "Women Summer Dress",
      description: "Lightweight floral summer dress.",
      basePrice: 70,
      category: women._id,
      brand: "Zara",
      image: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
      features: ["Floral", "Light Fabric"],
      tags: ["women", "dress", "fashion"],
    },
    {
      name: "Women Handbag",
      description: "Elegant handbag for daily use.",
      basePrice: 120,
      category: women._id,
      brand: "Charles & Keith",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      features: ["Leather", "Spacious"],
      tags: ["women", "bag", "fashion"],
    },

    // 🛏 Bedroom
    {
      name: "Queen Size Bed Frame",
      description: "Modern wooden bed frame.",
      basePrice: 450,
      category: bedroom._id,
      brand: "IKEA",
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      features: ["Wooden", "Queen Size"],
      tags: ["bedroom", "furniture", "bed"],
    },
    {
      name: "Memory Foam Mattress",
      description: "Comfortable mattress with memory foam.",
      basePrice: 600,
      category: bedroom._id,
      brand: "SleepWell",
      image: "https://images.unsplash.com/photo-1582582429416-9c0c1c41d86d",
      features: ["Memory Foam", "Orthopedic"],
      tags: ["mattress", "bedroom"],
    },
  ];

  const productsToInsert = products.map((p, index) => ({
    name: p.name,
    sku: generateSKU(p.name, index),
    description: p.description,
    price: randomInt(p.basePrice * 0.9, p.basePrice * 1.1),
    category: p.category,
    stock: randomInt(10, 150),
    image: p.image,
    rating: randomFloat(3.8, 4.9),
    numReviews: randomInt(20, 600),
    brand: p.brand,
    features: p.features,
    tags: p.tags,
    featured: p.featured || false,
    specifications: p.specifications || {},
  }));

  await Product.create(productsToInsert);
  console.log("✅ Seeded ~20 products successfully");
}

module.exports = seedProducts;
