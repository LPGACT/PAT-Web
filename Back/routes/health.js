// ─────────────────────────────────────────────
// routes/health.js
// Simple health check — useful for monitoring
// and confirming the server is running
// ─────────────────────────────────────────────
const express = require('express');
const router  = express.Router();

// GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    project: 'PAT Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
