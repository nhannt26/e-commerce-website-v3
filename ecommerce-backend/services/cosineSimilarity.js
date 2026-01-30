module.exports = function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;

  for (const k in a) {
    if (b[k]) dot += a[k] * b[k];
    normA += a[k] ** 2;
  }
  for (const k in b) normB += b[k] ** 2;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};