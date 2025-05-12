// routes/index.js
const express = require('express');
const router = express.Router();

const restaurantRoutes = require('./restaurantRoutes');
const authRoutes = require('./authRoutes');
const reservationRoutes = require('./reservationRoutes');

// API routes
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
