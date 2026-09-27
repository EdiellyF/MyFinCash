import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { setIO } from './services/notificationService.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.frontendOrigins,
    credentials: true,
  },
});

// Set IO instance for notification service
setIO(io);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  
  logger.info(`WebSocket client connected`, { socketId: socket.id, userId });

  // Join user-specific room for notifications
  socket.join(`user:${userId}`);

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected`, { socketId: socket.id, userId });
  });
});

const port = process.env.PORT || env.port || 5000;

httpServer.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${port}`);
  logger.info(`WebSocket enabled`);
});
