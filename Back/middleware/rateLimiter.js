// ─────────────────────────────────────────────
// middleware/rateLimiter.js
// Protects against spam and brute-force attacks
// ─────────────────────────────────────────────
const rateLimit = require('express-rate-limit');

// ── Global limiter: applies to all routes
// Max 100 requests per IP per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

// ── Strict limiter: applies only to the form submission endpoint
// Max 5 submissions per IP per hour — prevents form spam
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again in 1 hour.',
  },
});

module.exports = { globalLimiter, formLimiter };
