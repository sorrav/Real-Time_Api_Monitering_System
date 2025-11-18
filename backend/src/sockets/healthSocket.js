const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle client subscribing to specific monitor
    socket.on('subscribe:monitor', (monitorId) => {
      socket.join(`monitor:${monitorId}`);
      console.log(`📡 User ${socket.userId} subscribed to monitor ${monitorId}`);
    });

    // Handle client unsubscribing from monitor
    socket.on('unsubscribe:monitor', (monitorId) => {
      socket.leave(`monitor:${monitorId}`);
      console.log(`📴 User ${socket.userId} unsubscribed from monitor ${monitorId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId} (Socket: ${socket.id})`);
    });
  });

  // Export helper function to emit health updates
  io.emitHealthUpdate = (monitorId, userId, data) => {
    // Emit to specific monitor room
    io.to(`monitor:${monitorId}`).emit('health:update', data);
    
    // Also emit to user room for dashboard updates
    io.to(`user:${userId}`).emit('health:update', data);
  };

  console.log('✅ Socket.IO handlers initialized');
};