const db = require('../src/config/index').db;

const createReservation = async (req, res) => {
  try {
    const { restaurant_id, date, time, party_size, special_requests } = req.body;
    const user_id = req.user.id;

    // Check if restaurant exists
    const [restaurant] = await db.query('SELECT * FROM restaurants WHERE id = ?', [restaurant_id]);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create reservation
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, restaurant_id, reservation_date, reservation_time, party_size, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, restaurant_id, date, time, party_size, special_requests, 'pending']
    );

    // Get the created reservation
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(reservation[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation', details: error.message });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Get user's reservations with complete restaurant details
    const [reservations] = await db.query(
      `SELECT 
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
      ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [user_id]
    );

    // Transform the data to match the expected format
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

    res.json(formattedReservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations', details: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, party_size, special_requests } = req.body;
    const user_id = req.user.id;

    // Check if reservation exists and belongs to user
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update reservation
    await db.query(
      'UPDATE reservations SET reservation_date = ?, reservation_time = ?, party_size = ?, special_requests = ? WHERE id = ?',
      [date, time, party_size, special_requests || null, id]
    );

    // Get updated reservation
    const [updatedReservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    res.json(updatedReservation[0]);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation', details: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if reservation exists and belongs to user
    const [reservation] = await db.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Cancel reservation
    await db.query(
      'UPDATE reservations SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  updateReservation,
  cancelReservation
}; 