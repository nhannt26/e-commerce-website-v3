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
  const sports = await getCategory("sports");
  const bedroom = await getCategory("bedroom");

  const products = [
    // 🎧 Electronics
    {
      name: "Wireless Bluetooth Headphones",
      description: "Over-ear headphones with ANC and long battery life.",
      basePrice: 120,
      category: electronics._id,
      brand: "SoundMax",
      image: "https://m.media-amazon.com/images/I/616tDnOfX4L._AC_SL1500_.jpg",
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
      image: "https://kinghome.vn/data/images/smart-tivi-samsung-4k-50-inch-ua50du7700_1.jpg",
      features: ["4K UHD", "HDR10", "Voice Control"],
      tags: ["electronics", "tv", "4k"],
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "Compact speaker with powerful bass.",
      basePrice: 80,
      category: electronics._id,
      brand: "BoomSound",
      image: "https://m.media-amazon.com/images/I/71hvGkBMFNL._AC_UF894,1000_QL80_.jpg",
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
      image: "https://shorturl.at/gGyQX",
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
      image: "https://images.samsung.com/vn/smartphones/galaxy-s24/images/galaxy-s24-share-image.jpg",
      features: ["AMOLED", "120Hz", "Triple Camera"],
      tags: ["samsung", "android", "smartphone"],
    },
    {
      name: "Google Pixel 8",
      description: "Clean Android experience with AI camera.",
      basePrice: 900,
      category: phones._id,
      brand: "Google",
      image: "https://m.media-amazon.com/images/I/41suocIFDCL._AC_UF1000,1000_QL80_.jpg",
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
      image: "https://cdn.tgdd.vn/Files/2021/05/11/1350667/Gallery/4.jpg",
      features: ["15-inch", "Intel i7", "4K Display"],
      tags: ["dell", "windows", "laptop"],
    },
    {
      name: "Asus ROG Gaming Laptop",
      description: "High-performance gaming laptop.",
      basePrice: 2000,
      category: laptops._id,
      brand: "Asus",
      image: "https://cdn.tgdd.vn/hoi-dap/1217577/tim-hieu-ve-dong-laptop-choi-game-asus-rog-3.jpg",
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
      image: "https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111851_sp880-airpods-Pro-2nd-gen.png",
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
      image: "https://m.media-amazon.com/images/I/71ZRus2YNcL._AC_UF894,1000_QL80_.jpg",
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
      image: "https://shorturl.at/yahUl",
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
      image: "https://m.media-amazon.com/images/I/81UnVRZkvbL.jpg",
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
      image:
        "https://cdn.tgdd.vn/Products/Images/522/221775/ipad-pro-12-9-inch-wifi-128gb-2020-bac-600x600-1-600x600.jpg",
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
      image: "https://cdn.tgdd.vn/Products/Images/522/311061/samsung-galaxy-tab-s9-kem-1-750x500.jpg",
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
      image: "https://shorturl.at/CFoRN",
      features: ["Denim", "Slim Fit"],
      tags: ["men", "fashion", "jacket"],
    },
    {
      name: "Men Casual Sneakers",
      description: "Comfortable sneakers for daily wear.",
      basePrice: 95,
      category: men._id,
      brand: "Nike",
      image: "https://shorturl.at/2moLQ",
      features: ["Breathable", "Lightweight"],
      tags: ["men", "shoes", "sneakers"],
      specifications: {
        material: "Denim",
        fit: "Slim Fit",
        size: "M / L / XL",
        origin: "Vietnam",
      },
    },

    // 🏃 Sports & Fitness
    {
      name: "Running Shoes",
      description: "Lightweight running shoes for daily training.",
      basePrice: 110,
      category: sports._id,
      brand: "Nike",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      features: ["Breathable", "Cushioned Sole"],
      tags: ["sports", "running", "shoes"],
    },
    {
      name: "Adjustable Dumbbells Set",
      description: "Home workout adjustable dumbbell set.",
      basePrice: 180,
      category: sports._id,
      brand: "Bowflex",
      image: "https://shorturl.at/PiLvi",
      features: ["Adjustable Weight", "Home Gym"],
      tags: ["sports", "fitness", "gym"],
    },

    // 🛏 Bedroom
    {
      name: "Queen Size Bed Frame",
      description: "Modern wooden bed frame.",
      basePrice: 450,
      category: bedroom._id,
      brand: "IKEA",
      image: "https://m.media-amazon.com/images/I/91x-uou+CYL._AC_UF894,1000_QL80_.jpg",
      features: ["Wooden", "Queen Size"],
      tags: ["bedroom", "furniture", "bed"],
    },
    {
      name: "Memory Foam Mattress",
      description: "Comfortable mattress with memory foam.",
      basePrice: 600,
      category: bedroom._id,
      brand: "SleepWell",
      image: "https://m.media-amazon.com/images/I/81fuKFHM1QL._AC_UF894,1000_QL80_.jpg",
      features: ["Memory Foam", "Orthopedic"],
      tags: ["mattress", "bedroom"],
    },
  ];

  const productsToInsert = products.map((p, index) => {
    const images = p.image ? [p.image] : [`https://source.unsplash.com/600x600/?${p.tags[0]}`];

    return {
      name: p.name,
      sku: generateSKU(p.name, index),
      description: p.description,
      price: randomInt(p.basePrice * 0.9, p.basePrice * 1.1),
      category: p.category,
      stock: randomInt(10, 150),

      images, // ✅ đúng field

      rating: randomFloat(3.8, 4.9),
      numReviews: randomInt(20, 600),
      brand: p.brand,
      features: p.features,
      tags: p.tags,
      featured: p.featured || false,
      specifications: p.specifications || {},
    };
  });

  await Product.create(productsToInsert);
  console.log("✅ Seeded ~20 products successfully");
}

module.exports = seedProducts;
