require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Import routes
const authRoutes = require('./routes/authRoutes');
const monitorRoutes = require('./routes/monitorRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Health Monitor API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
require('./sockets/healthSocket')(io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
});