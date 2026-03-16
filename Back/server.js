// ─────────────────────────────────────────────
// server.js — PAT Backend Entry Point
// ─────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const { corsOptions }      = require('./middleware/cors');
const { globalLimiter }    = require('./middleware/rateLimiter');
const { errorHandler }     = require('./middleware/errorHandler');
const investorRoutes        = require('./routes/investor');
const healthRoutes          = require('./routes/health');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers
app.use(helmet());

// ── CORS
app.use(cors(corsOptions));

// ── Parse JSON bodies (max 10kb — protects against large payload attacks)
app.use(express.json({ limit: '10kb' }));

// ── Global rate limiter (applied to all routes)
app.use(globalLimiter);

// ── Routes
app.use('/api', healthRoutes);
app.use('/api', investorRoutes);

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler (must be last)
app.use(errorHandler);

// ── Start server
app.listen(PORT, () => {
  console.log(`✅ PAT Backend running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
