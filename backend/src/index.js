const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initSocketServer } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const conversationRoutes = require('./routes/conversation.routes');
const messageRoutes = require('./routes/message.routes');
const devRoutes = require('./routes/dev.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Trust proxy for Render deployments (enables correct IP and protocol handling)
if (process.env.RENDER) {
  app.set('trust proxy', 1);
}

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://chat-app-x08.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes (must use /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Health check or root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Chat backend is running!' });
});

// Development routes - only available in development mode
if (process.env.NODE_ENV === 'development') {
  app.use('/api/dev', devRoutes);
  logger.info('Development routes enabled');
}

// Catch-all 404 handler for undefined API routes (must come after all /api routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Catch-all 404 for non-API routes (optional, for clarity)
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Initialize Socket.io
initSocketServer(server);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});