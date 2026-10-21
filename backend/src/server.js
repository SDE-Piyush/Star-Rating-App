const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

const { seedData } = require('./scripts/seed');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database seed endpoint for easy cloud deployment setup
app.get('/api/seed', async (req, res) => {
  const secret = req.query.secret || req.headers['x-seed-secret'];
  const expectedSecret = process.env.SEED_SECRET || 'Piyush@121';
  if (secret !== expectedSecret) {
    return res.status(403).json({ 
      error: 'Unauthorized', 
      message: 'Please provide the correct secret key parameter: /api/seed?secret=YOUR_SECRET' 
    });
  }

  try {
    await seedData(false);
    res.status(200).json({ 
      status: 'success', 
      message: 'Database seeded successfully with demo accounts (Admin, Store Owners, Normal Users), sample stores, and ratings!' 
    });
  } catch (err) {
    console.error('Seed endpoint error:', err);
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Initialize DB and start listening
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running smoothly on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to database error:', err.message);
    console.log('Please ensure MySQL is running and database credentials in .env are correct.');
  }
};

if (require.main === module || !process.env.VERCEL) {
  startServer();
}

module.exports = app;

