// ─────────────────────────────────────────────
// middleware/cors.js
// Restricts which origins can call this API
// ─────────────────────────────────────────────

const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,         // your landing page domain
  'http://localhost:5500',             // Live Server (VS Code)
  'http://127.0.0.1:5500',
  'http://localhost:3000',
].filter(Boolean); // removes undefined/null entries

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed.`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
};

module.exports = { corsOptions };
