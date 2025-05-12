const pool = require('../config/index').db;
const { logger } = require('../utils/logger');

const reservationController = {
    // Get all reservations for a user
    getUserReservations: async (req, res) => {
        try {
            const userId = req.user.id;
            logger.info(`Fetching reservations for user ${userId}`);
            
            const query = `SELECT 
                r.*,
                rest.id as restaurant_id,
                rest.name as restaurant_name,
                rest.location as restaurant_location,
                rest.description as restaurant_description,
                rest.cuisine_type as restaurant_cuisine_type,
                rest.opening_hours as restaurant_opening_hours,
                rest.closing_hours as restaurant_closing_hours,
                rest.max_capacity as restaurant_max_capacity
            FROM reservations r
            JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.user_id = ?
            ORDER BY r.reservation_date ASC, r.reservation_time ASC`;
            
            logger.info('Executing query:', { query, userId });
            
            const [reservations] = await pool.query(query, [userId]);
            
            logger.info(`Found ${reservations.length} reservations for user ${userId}`);
            logger.info('Raw reservations:', reservations);

            // Transform the flat results into nested objects
            const formattedReservations = reservations.map(reservation => ({
                id: reservation.id,
                user_id: reservation.user_id,
                restaurant_id: reservation.restaurant_id,
                reservation_date: reservation.reservation_date,
                reservation_time: reservation.reservation_time,
                party_size: reservation.party_size,
                status: reservation.status,
                special_requests: reservation.special_requests,
                created_at: reservation.created_at,
                updated_at: reservation.updated_at,
                restaurant: {
                    id: reservation.restaurant_id,
                    name: reservation.restaurant_name,
                    location: reservation.restaurant_location,
                    description: reservation.restaurant_description,
                    cuisine_type: reservation.restaurant_cuisine_type,
                    opening_hours: reservation.restaurant_opening_hours,
                    closing_hours: reservation.restaurant_closing_hours,
                    max_capacity: reservation.restaurant_max_capacity
                }
            }));

            logger.info('Formatted reservations:', formattedReservations);
            res.json(formattedReservations);
        } catch (error) {
            logger.error('Error fetching user reservations:', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id
            });
            res.status(500).json({ 
                message: 'Error fetching reservations',
                details: error.message 
            });
        }
    },

    // Get a specific reservation
    getReservationById: async (req, res) => {
        try {
            const [reservations] = await pool.query(
                `SELECT r.*, rest.name as restaurant_name, rest.location 
                FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE r.id = ? AND r.user_id = ?`,
                [req.params.id, req.user.id]
            );

            if (reservations.length === 0) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            res.json({ data: reservations[0] });
        } catch (error) {
            console.error('Error fetching reservation:', error);
            res.status(500).json({ message: 'Error fetching reservation' });
        }
    },

    // Create a new reservation
    createReservation: async (req, res) => {
        try {
            const userId = req.user.id;
            const { restaurant_id, date, time, party_size, special_requests } = req.body;

            // Check if restaurant exists
            const [restaurants] = await pool.query(
                'SELECT * FROM restaurants WHERE id = ?',
                [restaurant_id]
            );

            if (restaurants.length === 0) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            const restaurant = restaurants[0];

            // Check if restaurant is open
            const requestedTime = new Date(`2000-01-01T${time}`);
            const openingTime = new Date(`2000-01-01T${restaurant.opening_hours}`);
            const closingTime = new Date(`2000-01-01T${restaurant.closing_hours}`);

            if (requestedTime < openingTime || requestedTime > closingTime) {
                return res.status(400).json({
                    message: 'Restaurant is closed at this time',
                });
            }

            // Check party size
            if (party_size > restaurant.max_capacity) {
                return res.status(400).json({
                    message: 'Party size exceeds restaurant capacity',
                });
            }

            // Check existing reservations
            const [existingReservations] = await pool.query(
                `SELECT SUM(party_size) as total_people
                 FROM reservations 
                 WHERE restaurant_id = ? 
                 AND reservation_date = ? 
                 AND reservation_time = ?
                 AND status != 'cancelled'`,
                [restaurant_id, date, time]
            );

            const currentBookings = existingReservations[0].total_people || 0;
            const remainingCapacity = restaurant.max_capacity - currentBookings;

            if (party_size > remainingCapacity) {
                return res.status(400).json({
                    message: 'Not enough capacity for this party size at this time',
                });
            }

            // Create reservation
            const [result] = await pool.query(
                `INSERT INTO reservations (
                    user_id, restaurant_id, reservation_date, reservation_time, 
                    party_size, special_requests, status
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, restaurant_id, date, time, party_size, special_requests]
            );

            // Get the created reservation
            const [newReservation] = await pool.query(
                `SELECT 
                    r.*,
                    rest.name as restaurant_name,
                    rest.location as restaurant_location,
                    rest.cuisine_type as restaurant_cuisine_type
                FROM reservations r
                JOIN restaurants rest ON r.restaurant_id = rest.id
                WHERE r.id = ?`,
                [result.insertId]
            );

            // Format the response
            const formattedReservation = {
                id: newReservation[0].id,
                user_id: newReservation[0].user_id,
                restaurant_id: newReservation[0].restaurant_id,
                reservation_date: newReservation[0].reservation_date,
                reservation_time: newReservation[0].reservation_time,
                party_size: newReservation[0].party_size,
                status: newReservation[0].status,
                special_requests: newReservation[0].special_requests,
                created_at: newReservation[0].created_at,
                updated_at: newReservation[0].updated_at,
                restaurant: {
                    id: newReservation[0].restaurant_id,
                    name: newReservation[0].restaurant_name,
                    location: newReservation[0].restaurant_location,
                    cuisine_type: newReservation[0].restaurant_cuisine_type
                }
            };

            res.status(201).json(formattedReservation);
        } catch (error) {
            logger.error('Error creating reservation:', error);
            res.status(500).json({ message: 'Error creating reservation' });
        }
    },

    // Update a reservation
    updateReservation: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { date, time, party_size, special_requests } = req.body;

            console.log('UPDATE RESERVATION REQUEST:', { id, userId, date, time, party_size, special_requests });

            // Check if reservation exists and belongs to user
            const [reservations] = await pool.query(
                'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (reservations.length === 0) {
                console.log('Reservation not found for update.');
                return res.status(404).json({ message: 'Reservation not found' });
            }

            const reservation = reservations[0];

            // Only allow updates to pending reservations
            if (reservation.status !== 'pending') {
                console.log('Reservation not pending, cannot update.');
                return res.status(400).json({
                    message: 'Can only update pending reservations',
                });
            }

            // If time or party size is changing, check availability
            if (time !== reservation.reservation_time || party_size !== reservation.party_size) {
                const [restaurants] = await pool.query(
                    'SELECT * FROM restaurants WHERE id = ?',
                    [reservation.restaurant_id]
                );
                const restaurant = restaurants[0];

                // Check if restaurant is open
                if (time) {
                    const requestedTime = new Date(`2000-01-01T${time}`);
                    const openingTime = new Date(`2000-01-01T${restaurant.opening_hours}`);
                    const closingTime = new Date(`2000-01-01T${restaurant.closing_hours}`);

                    if (requestedTime < openingTime || requestedTime > closingTime) {
                        console.log('Requested time outside restaurant hours.');
                        return res.status(400).json({
                            message: 'Restaurant is closed at this time',
                        });
                    }
                }

                // Check party size
                if (party_size && party_size > restaurant.max_capacity) {
                    console.log('Party size exceeds max capacity.');
                    return res.status(400).json({
                        message: 'Party size exceeds restaurant capacity',
                    });
                }

                // Check existing reservations
                const [existingReservations] = await pool.query(
                    `SELECT SUM(party_size) as total_people
                     FROM reservations 
                     WHERE restaurant_id = ? 
                     AND reservation_date = ? 
                     AND reservation_time = ?
                     AND status != 'cancelled'
                     AND id != ?`,
                    [reservation.restaurant_id, date || reservation.reservation_date, time || reservation.reservation_time, id]
                );

                const currentBookings = existingReservations[0].total_people || 0;
                const remainingCapacity = restaurant.max_capacity - currentBookings;

                if ((party_size || reservation.party_size) > remainingCapacity) {
                    console.log('Not enough capacity for this party size.');
                    return res.status(400).json({
                        message: 'Not enough capacity for this party size at this time',
                });
            }
            }

            // Update reservation
            const [updateResult] = await pool.query(
                `UPDATE reservations 
                 SET 
                   reservation_date = COALESCE(?, reservation_date),
                   reservation_time = COALESCE(?, reservation_time),
                   party_size = COALESCE(?, party_size),
                   special_requests = COALESCE(?, special_requests)
                 WHERE id = ?`,
                [date, time, party_size, special_requests, id]
            );
            console.log('UPDATE RESULT:', updateResult);

            // Get updated reservation
            const [updatedReservation] = await pool.query(
                `SELECT 
                    r.*,
                    rest.name as restaurant_name,
                    rest.location as restaurant_location,
                    rest.cuisine_type as restaurant_cuisine_type
                FROM reservations r
                JOIN restaurants rest ON r.restaurant_id = rest.id
                WHERE r.id = ?`,
                [id]
            );
            console.log('UPDATED RESERVATION:', updatedReservation[0]);

            // Format the response
            const formattedReservation = {
                id: updatedReservation[0].id,
                user_id: updatedReservation[0].user_id,
                restaurant_id: updatedReservation[0].restaurant_id,
                reservation_date: updatedReservation[0].reservation_date,
                reservation_time: updatedReservation[0].reservation_time,
                party_size: updatedReservation[0].party_size,
                status: updatedReservation[0].status,
                special_requests: updatedReservation[0].special_requests,
                created_at: updatedReservation[0].created_at,
                updated_at: updatedReservation[0].updated_at,
                restaurant: {
                    id: updatedReservation[0].restaurant_id,
                    name: updatedReservation[0].restaurant_name,
                    location: updatedReservation[0].restaurant_location,
                    cuisine_type: updatedReservation[0].restaurant_cuisine_type
                }
            };

            res.json(formattedReservation);
        } catch (error) {
            logger.error('Error updating reservation:', error);
            res.status(500).json({ message: 'Error updating reservation' });
        }
    },

    // Cancel a reservation
    cancelReservation: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if reservation exists and belongs to user
            const [reservations] = await pool.query(
                'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (reservations.length === 0) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            const reservation = reservations[0];

            // Only allow cancellation of pending or confirmed reservations
            if (reservation.status === 'cancelled') {
                return res.status(400).json({
                    message: 'Reservation is already cancelled',
                });
            }

            // Update reservation status
            await pool.query(
                'UPDATE reservations SET status = ? WHERE id = ?',
                ['cancelled', id]
            );

            res.json({ message: 'Reservation cancelled successfully' });
        } catch (error) {
            logger.error('Error cancelling reservation:', error);
            res.status(500).json({ message: 'Error cancelling reservation' });
        }
    }
};

module.exports = reservationController; 