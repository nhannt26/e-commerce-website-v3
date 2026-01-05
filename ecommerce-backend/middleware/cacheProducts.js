const cache = require('../utils/cache');

const CACHE_TTL = 60 * 1000; // 60 seconds

const cacheProducts = (req, res, next) => {
  const now = Date.now();

  // Nếu cache còn hạn
  if (cache.products.data && cache.products.expiry > now) {
    res.set('X-Cache', 'HIT');
    return res.json(cache.products.data);
  }

  // Override res.json để lưu cache
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    cache.products = {
      data: body,
      expiry: now + CACHE_TTL
    };

    res.set('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
};

module.exports = cacheProducts;
