const mongoose = require("mongoose");
const Category = require("../models/Category");

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
  },
  {
    name: "Phones",
    slug: "phones",
  },
  {
    name: "Laptops",
    slug: "laptops",
  },
];

async function seedCategories() {
  await Category.deleteMany();

  const electronics = await Category.create({
    name: "Electronics",
    slug: "electronics",
  });

  await Category.create([
    {
      name: "Phones",
      slug: "phones",
      parent: electronics._id,
    },
    {
      name: "Laptops",
      slug: "laptops",
      parent: electronics._id,
    },
  ]);

  console.log("✅ Categories seeded");
}

module.exports = seedCategories;
