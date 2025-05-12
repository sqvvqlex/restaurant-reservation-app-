const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/availability', restaurantController.checkAvailability);

// Create a reservation
router.post('/:id/reservations', auth, async (req, res) => {
  try {
    const { date, time, people_count } = req.body;
    const restaurant_id = req.params.id;
    const user_id = req.user.userId;

    // Check if restaurant exists
    const [restaurants] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [restaurant_id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create reservation
    const [result] = await pool.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, people_count) VALUES (?, ?, ?, ?, ?)',
      [user_id, restaurant_id, date, time, people_count]
    );

    res.status(201).json({
      message: 'Reservation created successfully',
      data: {
        id: result.insertId,
        user_id,
        restaurant_id,
        date,
        time,
        people_count,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

module.exports = router; 