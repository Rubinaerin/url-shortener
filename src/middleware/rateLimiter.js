const rateLimit = require("express-rate-limit");

// Allow max 10 requests per minute per IP address
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10,
  message: {
    error: "Too many requests. Please try again in a minute.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

module.exports = limiter;