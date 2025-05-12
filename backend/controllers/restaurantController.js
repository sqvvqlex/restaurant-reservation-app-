const db = require('../src/config/index').db;

const getAllRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.query('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const [restaurants] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurants[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Error fetching restaurant' });
  }
};

const createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Check if restaurant exists
    const [restaurants] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create review
    await db.query(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, id, rating, comment]
    );

    // Update restaurant rating
    const [reviews] = await db.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE restaurant_id = ?',
      [id]
    );

    await db.query(
      'UPDATE restaurants SET rating = ? WHERE id = ?',
      [reviews[0].avg_rating, id]
    );

    res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createReview,
}; 