const buildItemUserMatrix = require("./buildItemUserMatrix");
const cosineSimilarity = require("./cosineSimilarity");

module.exports = async function computeItemSimilarity() {
  const matrix = await buildItemUserMatrix();
  const items = Object.keys(matrix);
  const similarity = {};

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const score = cosineSimilarity(matrix[a], matrix[b]);

      if (score > 0) {
        similarity[a] ??= {};
        similarity[b] ??= {};
        similarity[a][b] = score;
        similarity[b][a] = score;
      }
    }
  }
  // console.log("Item similarity:", similarity);
  
  return similarity;
};
