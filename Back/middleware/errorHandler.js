// ─────────────────────────────────────────────
// middleware/errorHandler.js
// Centralized error handler — catches all errors
// thrown anywhere in the app
// ─────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Log error details on the server (never expose these to the client)
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      message: 'Access not allowed from this origin.',
    });
  }

  // Default 500
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong. Please try again later.',
  });
};

module.exports = { errorHandler };
