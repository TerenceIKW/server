require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const DEFAULT_ORIGINS = [
  'https://baobabnetworking.org',
  'https://www.baobabnetworking.org',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function getAllowedOrigins() {
  const fromEnv = (process.env.CORS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
}

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors({
  origin(origin, callback) {
    const allowed = getAllowedOrigins();

    // Non-browser / same-origin tools (curl, server-to-server) send no Origin
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure Mongo is ready on every cold start (Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable' });
  }
});

// ============================================================
// SERVE STATIC FILES (admin dashboard only — WHM hosts the public site)
// ============================================================
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/contact', require('./routes/contact'));
app.use('/api/donation', require('./routes/donation'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Baobab backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 — only for API routes that don't match
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err && String(err.message || '').startsWith('CORS blocked')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ============================================================
// START (local only — Vercel uses the exported app)
// ============================================================
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Baobab backend running on http://localhost:${PORT}`);
      console.log(`Admin: http://localhost:${PORT}/admin.html`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module) {
  start();
}
