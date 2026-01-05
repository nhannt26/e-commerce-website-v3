const cache = require('../utils/cache');

const clearProductCache = (req, res, next) => {
  cache.products = {
    data: null,
    expiry: 0
  };
  next();
};

module.exports = clearProductCache;
