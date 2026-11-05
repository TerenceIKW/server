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

// Mount each router under /api/... and bare /... (Vercel sometimes strips /api)
function mountApi(basePath, router) {
  app.use(`/api${basePath}`, router);
  app.use(basePath, router);
}

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors({
  origin(origin, callback) {
    const allowed = getAllowedOrigins();

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
// STATIC + ROOT
// ============================================================
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Baobab API',
    health: '/api/health',
    endpoints: [
      'POST /api/contact',
      'POST /api/donation',
      'POST /api/volunteer',
      'GET /api/admin/*'
    ]
  });
});

// ============================================================
// API ROUTES
// ============================================================
mountApi('/contact', require('./routes/contact'));
mountApi('/donation', require('./routes/donation'));
mountApi('/volunteer', require('./routes/volunteer'));
mountApi('/admin', require('./routes/admin'));

function healthHandler(req, res) {
  res.json({
    success: true,
    message: 'Baobab backend is running',
    timestamp: new Date().toISOString()
  });
}

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    method: req.method,
    path: req.path
  });
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
// START (local only — Vercel uses api/index.js)
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
