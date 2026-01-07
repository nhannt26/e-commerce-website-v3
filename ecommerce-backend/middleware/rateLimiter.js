const rateLimit = require("express-rate-limit");

exports.rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // 100 requests mỗi IP
  standardHeaders: true, // dùng chuẩn RateLimit-* headers
  legacyHeaders: false, // tắt X-RateLimit-* mặc định
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

// Payment creation rate limit
exports.paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 payment requests per 15 minutes
  message: {
    success: false,
    message: "Too many payment requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IPN rate limit (more lenient)
exports.ipnRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 IPN calls per minute
  message: {
    RspCode: "97",
    Message: "Too many requests",
  },
});
