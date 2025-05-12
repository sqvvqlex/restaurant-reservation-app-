const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all reservations for the authenticated user
router.get('/user', reservationController.getUserReservations);

// Get a specific reservation
router.get('/:id', reservationController.getReservationById);

// Create a new reservation
router.post('/', reservationController.createReservation);

// Update a reservation
router.put('/:id', reservationController.updateReservation);

// Cancel a reservation
router.delete('/:id', reservationController.cancelReservation);

module.exports = router; 