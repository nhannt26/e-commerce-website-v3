const Review = require("../models/Review");
const Product = require("../models/Product");

async function seedReviews() {
  await Review.deleteMany();

  const products = await Product.find().limit(5);

  const reviews = [];

  products.forEach((product) => {
    reviews.push(
      {
        product: product._id,
        user: { name: "John Doe", email: "john@example.com" },
        rating: 5,
        title: "Excellent product",
        comment: "Highly recommended, great quality!",
        verified: true,
      },
      {
        product: product._id,
        user: { name: "Jane Smith", email: "jane@example.com" },
        rating: 4,
        title: "Very good",
        comment: "Works well, worth the price.",
      }
    );
  });

  await Review.create(reviews);

  console.log("✅ Reviews seeded");
}

module.exports = seedReviews;
