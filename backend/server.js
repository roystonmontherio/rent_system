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
