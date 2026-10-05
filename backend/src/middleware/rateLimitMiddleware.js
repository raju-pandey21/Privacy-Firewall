const rateLimit = require("express-rate-limit");

// Privacy scanner rate limiter
const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Production limit
  max: 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many scan requests. Please try again later.",
  },
});

module.exports = {
  scanRateLimiter,
};