const pool = require('../config/index').db;
const { logger } = require('../utils/logger');

const restaurantController = {
    // Get all restaurants with optional filters
    getAllRestaurants: async (req, res) => {
        try {
            const { search, location } = req.query;
            let query = `
                SELECT 
                    id,
                    name,
                    location,
                    description,
                    cuisine_type,
                    opening_hours,
                    closing_hours,
                    max_capacity,
                    created_at,
                    updated_at
                FROM restaurants 
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                query += ' AND (name LIKE ? OR cuisine_type LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            if (location) {
                query += ' AND location LIKE ?';
                params.push(`%${location}%`);
            }

            query += ' ORDER BY name ASC';

            logger.info('Executing restaurant query:', { query, params });
            const [restaurants] = await pool.query(query, params);
            logger.info(`Found ${restaurants.length} restaurants`);
            
            res.json(restaurants);
        } catch (error) {
            logger.error('Error fetching restaurants:', error);
            res.status(500).json({ message: 'Error fetching restaurants' });
        }
    },

    // Get a specific restaurant
    getRestaurantById: async (req, res) => {
        try {
            const { id } = req.params;
            const [restaurants] = await pool.query(
                'SELECT * FROM restaurants WHERE id = ?',
                [id]
            );

            if (restaurants.length === 0) {
                logger.warn(`Restaurant not found with ID: ${id}`);
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            logger.info(`Found restaurant with ID: ${id}`);
            res.json(restaurants[0]);
        } catch (error) {
            logger.error('Error fetching restaurant:', error);
            res.status(500).json({ message: 'Error fetching restaurant' });
        }
    },

    // Create a new restaurant (admin only)
    createRestaurant: async (req, res) => {
        try {
            const { 
                name, 
                location, 
                description, 
                cuisine_type,
                opening_hours,
                closing_hours,
                max_capacity 
            } = req.body;

            if (!name || !location) {
                return res.status(400).json({ message: 'Name and location are required' });
            }

            const [result] = await pool.query(
                `INSERT INTO restaurants (
                    name, 
                    location, 
                    description, 
                    cuisine_type,
                    opening_hours,
                    closing_hours,
                    max_capacity
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, 
                    location, 
                    description, 
                    cuisine_type,
                    opening_hours,
                    closing_hours,
                    max_capacity || 0
                ]
            );

            logger.info(`Created new restaurant with ID: ${result.insertId}`);
            
            const [newRestaurant] = await pool.query(
                `SELECT * FROM restaurants WHERE id = ?`,
                [result.insertId]
            );

            res.status(201).json(newRestaurant[0]);
        } catch (error) {
            logger.error('Error creating restaurant:', error);
            res.status(500).json({ message: 'Error creating restaurant' });
        }
    },

    // Update a restaurant (admin only)
    updateRestaurant: async (req, res) => {
        try {
            const { 
                name, 
                location, 
                description, 
                cuisine_type,
                opening_hours,
                closing_hours,
                max_capacity 
            } = req.body;
            const restaurantId = req.params.id;

            const [restaurant] = await pool.query(
                'SELECT * FROM restaurants WHERE id = ?',
                [restaurantId]
            );

            if (restaurant.length === 0) {
                logger.warn(`Restaurant not found with ID: ${restaurantId}`);
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            await pool.query(
                `UPDATE restaurants 
                SET name = ?, 
                    location = ?, 
                    description = ?, 
                    cuisine_type = ?,
                    opening_hours = ?,
                    closing_hours = ?,
                    max_capacity = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    name, 
                    location, 
                    description, 
                    cuisine_type,
                    opening_hours,
                    closing_hours,
                    max_capacity,
                    restaurantId
                ]
            );

            const [updatedRestaurant] = await pool.query(
                'SELECT * FROM restaurants WHERE id = ?',
                [restaurantId]
            );

            logger.info(`Updated restaurant with ID: ${restaurantId}`);
            res.json(updatedRestaurant[0]);
        } catch (error) {
            logger.error('Error updating restaurant:', error);
            res.status(500).json({ message: 'Error updating restaurant' });
        }
    },

    // Delete a restaurant (admin only)
    deleteRestaurant: async (req, res) => {
        try {
            const restaurantId = req.params.id;

            const [result] = await pool.query(
                'DELETE FROM restaurants WHERE id = ?',
                [restaurantId]
            );

            if (result.affectedRows === 0) {
                logger.warn(`Restaurant not found with ID: ${restaurantId}`);
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            logger.info(`Deleted restaurant with ID: ${restaurantId}`);
            res.status(204).send();
        } catch (error) {
            logger.error('Error deleting restaurant:', error);
            res.status(500).json({ message: 'Error deleting restaurant' });
        }
    },

    // Check restaurant availability
    checkAvailability: async (req, res) => {
        try {
            const { id } = req.params;
            const { date, time, party_size } = req.query;

            // Get restaurant details
            const [restaurants] = await pool.query(
                'SELECT * FROM restaurants WHERE id = ?',
                [id]
            );

            if (restaurants.length === 0) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            const restaurant = restaurants[0];

            // Check if restaurant is open at requested time
            const requestedTime = new Date(`2000-01-01T${time}`);
            const openingTime = new Date(`2000-01-01T${restaurant.opening_hours}`);
            const closingTime = new Date(`2000-01-01T${restaurant.closing_hours}`);

            if (requestedTime < openingTime || requestedTime > closingTime) {
                return res.json({
                    available: false,
                    message: 'Restaurant is closed at this time',
                });
            }

            // Check if party size exceeds max capacity
            if (parseInt(party_size) > restaurant.max_capacity) {
                return res.json({
                    available: false,
                    message: 'Party size exceeds restaurant capacity',
                });
            }

            // Get existing reservations for the time slot
            const [reservations] = await pool.query(
                `SELECT SUM(people_count) as total_people
                 FROM reservations 
                 WHERE restaurant_id = ? 
                 AND date = ? 
                 AND time = ?
                 AND status != 'cancelled'`,
                [id, date, time]
            );

            const currentBookings = reservations[0].total_people || 0;
            const remainingCapacity = restaurant.max_capacity - currentBookings;

            if (parseInt(party_size) > remainingCapacity) {
                return res.json({
                    available: false,
                    message: 'Not enough capacity for this party size at this time',
                });
            }

            res.json({
                available: true,
                message: 'Restaurant is available for this reservation',
            });
        } catch (error) {
            logger.error('Error checking availability:', error);
            res.status(500).json({ message: 'Error checking availability' });
        }
    },
};

module.exports = restaurantController; 