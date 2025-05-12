const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const corsConfig = require('./config/cors');

// Load environment variables
dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(corsConfig);

// Serve favicon
app.use('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Restaurant Reservation API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.url
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication Error',
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app; 