const Review = require("../models/Review");
const Product = require("../models/Product");

async function seedReviews() {
  await Review.deleteMany();

  const product = await Product.findOne({ name: "iPhone 15" });

  await Review.create([
    {
      product: product._id,
      user: { name: "John Doe", email: "john@example.com" },
      rating: 5,
      title: "Amazing phone",
      comment: "This phone is super fast and the camera is amazing!",
      verified: true,
    },
    {
      product: product._id,
      user: { name: "Jane Smith", email: "jane@example.com" },
      rating: 4,
      title: "Very good",
      comment: "Great phone but a bit expensive.",
    },
  ]);

  console.log("✅ Reviews seeded");
}

module.exports = seedReviews;
