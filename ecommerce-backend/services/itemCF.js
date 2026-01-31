const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const computeSimilarity = require("./computeItemSimilarity");

module.exports = async function itemCF(userId, limit = 8) {
  const user = await User.findById(userId).lean();
  const orders = await Order.find({ user: userId }).lean();
  const similarity = await computeSimilarity();

  const interacted = new Set();

  orders.forEach((o) => o.items.forEach((i) => interacted.add(i.product.toString())));

  user.wishlist.forEach((p) => interacted.add(p.toString()));

  const scores = {};

  interacted.forEach((itemId) => {
    const sims = similarity[itemId] || {};
    console.log(`\n🔎 From interacted item: ${itemId}`);
    console.log("Similar items:", sims);
    for (const [otherId, score] of Object.entries(sims)) {
      if (!interacted.has(otherId) && score > 0.05) {
        scores[otherId] = (scores[otherId] || 0) + score;
        console.log(`➕ contributes to ${otherId} | +${score.toFixed(3)} | total = ${scores[otherId].toFixed(3)}`);
      }
    }
  });

  // 🔍 DEBUG LOG — ĐẶT Ở ĐÂY
  console.log("Similarity keys:", Object.keys(similarity).length);
  console.log("Scores:", scores);

  const ids = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map((i) => i[0]);

  console.log("Interacted items:", interacted);

  return Product.find({ _id: { $in: ids }, isActive: true });
};
