const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

router.post('/', reservationController.createReservation);
router.get('/user', reservationController.getUserReservations);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.cancelReservation);

module.exports = router; 