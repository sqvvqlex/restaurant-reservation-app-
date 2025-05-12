const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user's reservations
router.get('/user', reservationController.getUserReservations);

// Create a new reservation
router.post('/', reservationController.createReservation);

// Update a reservation
router.put('/:id', reservationController.updateReservation);

// Cancel a reservation
router.delete('/:id', reservationController.cancelReservation);

module.exports = router; 