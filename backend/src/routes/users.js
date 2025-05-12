const express = require('express');
const router = express.Router();
const pool = require('../config/index').db;
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get user's reservations
router.get('/reservations', auth, async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT r.*, res.name as restaurant_name, res.location 
       FROM reservations r 
       JOIN restaurants res ON r.restaurant_id = res.id 
       WHERE r.user_id = ? 
       ORDER BY r.date DESC, r.time DESC`,
      [req.user.userId]
    );

    res.json({ data: reservations });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Update a reservation
router.put('/reservations/:id', auth, async (req, res) => {
  try {
    const { date, time, people_count } = req.body;
    const reservation_id = req.params.id;

    // Check if reservation exists and belongs to user
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [reservation_id, req.user.userId]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update reservation
    await pool.query(
      'UPDATE reservations SET date = ?, time = ?, people_count = ? WHERE id = ?',
      [date, time, people_count, reservation_id]
    );

    res.json({
      message: 'Reservation updated successfully',
      data: {
        id: reservation_id,
        date,
        time,
        people_count
      }
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Cancel a reservation
router.delete('/reservations/:id', auth, async (req, res) => {
  try {
    const reservation_id = req.params.id;

    // Check if reservation exists and belongs to user
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [reservation_id, req.user.userId]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Delete reservation
    await pool.query('DELETE FROM reservations WHERE id = ?', [reservation_id]);

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
});

// All routes require authentication
router.use(auth);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

module.exports = router; 