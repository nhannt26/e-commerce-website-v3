const cache = require("../utils/cache");

const CACHE_TTL = 60 * 1000; // 60s

const cacheProducts = (req, res, next) => {
  const now = Date.now();

  // ✅ KEY PHẢI PHỤ THUỘC URL + QUERY
  const key = `products:${JSON.stringify(req.query)}`;

  // HIT
  if (cache.products[key] && cache.products[key].expiry > now) {
    res.set("X-Cache", "HIT");
    return res.json(cache.products[key].data);
  }

  // MISS → override res.json
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    cache.products[key] = {
      data: body,
      expiry: now + CACHE_TTL,
    };

    res.set("X-Cache", "MISS");
    return originalJson(body);
  };

  next();
};

module.exports = cacheProducts;
