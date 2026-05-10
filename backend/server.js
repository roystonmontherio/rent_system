require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const stayRoutes = require('./src/routes/stay.routes');
const chatRoutes = require('./src/routes/chat.routes');
const usersRoutes = require('./src/routes/users.routes');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Rent System API is running' });
});
const { pool } = require('./src/config/db');
app.get('/api/diagnostics', async (req, res) => {
  // Check envs
  const envs = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ? '✅ Set' : '❌ Missing',
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY ? '✅ Set' : '❌ Missing',
    FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || '❌ Missing',
    PORT: process.env.PORT || '❌ Missing',
  };

  // Check DB connection
  let dbStatus;
  try {
    await pool.query('SELECT 1');
    dbStatus = '✅ Connected';
  } catch (err) {
    dbStatus = `❌ Failed: ${err.message}`;
  }

  res.json({
    envs,
    database: dbStatus,
  });
});

app.get("/health", (req, res) => res.send("OK"));
// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Return consistent error structure
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
console.log('Envs ' , process.env.DATABASE_URL)
const http = require('http');
const { initSocket } = require('./src/config/socket');

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 WebSockets enabled`);
});
