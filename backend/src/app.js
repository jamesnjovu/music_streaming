const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Import routes
const authRoutes = require('./api/auth/routes');
const trackRoutes = require('./api/tracks/routes');
const albumRoutes = require('./api/albums/routes');
const artistRoutes = require('./api/artists/routes');
const playlistRoutes = require('./api/playlists/routes');
const userRoutes = require('./api/users/routes');
const adminRoutes = require('./api/admin/routes');
const streamingRoutes = require('./api/streaming/routes');
const sessionsRoutes = require('./api/sessions/routes');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler');
const { authenticateJWT } = require('./middlewares/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Music Streaming API',
      version: '1.0.0',
      description: 'API documentation for the Music Streaming Platform',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/**/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists', artistRoutes);

// Protected routes
app.use('/api/playlists', authenticateJWT, playlistRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/streaming', streamingRoutes); // Streaming has its own auth logic
app.use('/api/sessions', authenticateJWT, sessionsRoutes);

// Admin routes (protected with admin role check)
app.use('/api/admin', authenticateJWT, adminRoutes);

// Serve static files (for development)
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;