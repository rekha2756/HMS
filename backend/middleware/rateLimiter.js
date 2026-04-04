// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const tenantLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 60000, // ✅ comma added
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,  // ✅ convert to number
  keyGenerator: (req) => req.tenantId,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests for this tenant' });
  },
});

module.exports = tenantLimiter;