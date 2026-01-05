const rateLimitHeaders = (req, res, next) => {
  if (req.rateLimit) {
    res.set({
      'X-RateLimit-Limit': req.rateLimit.limit,
      'X-RateLimit-Remaining': Math.max(
        req.rateLimit.limit - req.rateLimit.used,
        0
      )
    });
  }
  next();
};

module.exports = rateLimitHeaders;