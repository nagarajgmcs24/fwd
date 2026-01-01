import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import issuesRoutes from './routes/issues.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fix-my-ward';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io Events for Real-time Updates
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join ward room for notifications
  socket.on('join-ward', (ward: string) => {
    socket.join(`ward-${ward}`);
    console.log(`User ${socket.id} joined ward: ${ward}`);
  });

  // Leave ward room
  socket.on('leave-ward', (ward: string) => {
    socket.leave(`ward-${ward}`);
    console.log(`User ${socket.id} left ward: ${ward}`);
  });

  // Notify specific ward of status update
  socket.on('issue-status-update', (data: {
    issueId: string;
    status: string;
    ward: string;
    message: string;
  }) => {
    io.to(`ward-${data.ward}`).emit('issue-updated', {
      issueId: data.issueId,
      status: data.status,
      message: data.message,
      timestamp: new Date()
    });
  });

  // Notify of new issue
  socket.on('issue-created', (data: {
    issueId: string;
    ward: string;
    category: string;
    title: string;
  }) => {
    io.to(`ward-${data.ward}`).emit('new-issue', {
      issueId: data.issueId,
      category: data.category,
      title: data.title,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   Fix My Ward - Backend Server       ║
║   Listening on port ${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}    ║
╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
