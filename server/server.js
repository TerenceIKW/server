require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// SERVE STATIC FILES
// 1. /admin.html and other backend public files
// 2. Your full Baobab website (index, contact, donate, etc.)
// ============================================================
const WEBSITE_PATH = 'C:\\Users\\Ofentse Milanzi\\Documents\\New Baobab\\New Baobab';

// Backend public (admin dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Main Baobab website
app.use(express.static(WEBSITE_PATH));

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
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ============================================================
// START
// ============================================================
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Baobab backend running on http://localhost:${PORT}`);
      console.log(`🌐 Website: http://localhost:${PORT}/`);
      console.log(`📊 Admin:   http://localhost:${PORT}/admin.html`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();