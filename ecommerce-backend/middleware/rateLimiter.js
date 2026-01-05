const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // 100 requests mỗi IP
  standardHeaders: true, // dùng chuẩn RateLimit-* headers
  legacyHeaders: false,  // tắt X-RateLimit-* mặc định
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

module.exports = rateLimiter;