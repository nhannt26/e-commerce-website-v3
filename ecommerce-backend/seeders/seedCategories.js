const Category = require("../models/Category");

async function seedCategories() {
  await Category.deleteMany();

  // Parent categories
  const electronics = await Category.create({
    name: "Electronics",
    slug: "electronics",
  });

  const fashion = await Category.create({
    name: "Fashion",
    slug: "fashion",
  });

  const home = await Category.create({
    name: "Home & Living",
    slug: "home-living",
  });

  // Child categories
  await Category.create([
    { name: "Phones", slug: "phones", parent: electronics._id },
    { name: "Laptops", slug: "laptops", parent: electronics._id },
    { name: "Tablets", slug: "tablets", parent: electronics._id },
    { name: "Accessories", slug: "accessories", parent: electronics._id },

    { name: "Men", slug: "men", parent: fashion._id },
    { name: "Women", slug: "women", parent: fashion._id },

    { name: "Kitchen", slug: "kitchen", parent: home._id },
    { name: "Bedroom", slug: "bedroom", parent: home._id },
  ]);

  console.log("✅ Categories seeded");
}

module.exports = seedCategories;
