const db = require('../config/index').db;

class Reservation {
    static async create(data) {
        try {
            const { user_id, restaurant_id, date, time, party_size } = data;

            // Check if restaurant exists and has capacity
            const [restaurant] = await db.query(
                'SELECT max_capacity FROM restaurants WHERE id = ?',
                [restaurant_id]
            );

            if (!restaurant[0]) {
                throw new Error('Restaurant not found');
            }

            // Check existing reservations for the same time slot
            const [existingReservations] = await db.query(
                `SELECT SUM(party_size) as total_guests 
                FROM reservations 
                WHERE restaurant_id = ? 
                AND date = ? 
                AND time = ? 
                AND status = 'confirmed'`,
                [restaurant_id, date, time]
            );

            const currentCapacity = existingReservations[0].total_guests || 0;
            if (currentCapacity + party_size > restaurant[0].max_capacity) {
                throw new Error('Not enough capacity for this reservation');
            }

            const [result] = await db.query(
                `INSERT INTO reservations 
                (user_id, restaurant_id, date, time, party_size, status) 
                VALUES (?, ?, ?, ?, ?, 'confirmed')`,
                [user_id, restaurant_id, date, time, party_size]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT r.*, rest.name as restaurant_name, rest.location 
                FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE r.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await db.query(
                `SELECT r.*, rest.name as restaurant_name, rest.location 
                FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE r.user_id = ? 
                ORDER BY r.date DESC, r.time DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, userId, data) {
        try {
            // Verify reservation belongs to user and is not in the past
            const [reservation] = await db.query(
                `SELECT * FROM reservations 
                WHERE id = ? 
                AND user_id = ? 
                AND date >= CURDATE()`,
                [id, userId]
            );

            if (!reservation[0]) {
                throw new Error('Reservation not found or cannot be modified');
            }

            // If changing date/time/party_size, check capacity
            if (data.date || data.time || data.party_size) {
                const date = data.date || reservation[0].date;
                const time = data.time || reservation[0].time;
                const party_size = data.party_size || reservation[0].party_size;

                const [existingReservations] = await db.query(
                    `SELECT SUM(party_size) as total_guests 
                    FROM reservations 
                    WHERE restaurant_id = ? 
                    AND date = ? 
                    AND time = ? 
                    AND status = 'confirmed' 
                    AND id != ?`,
                    [reservation[0].restaurant_id, date, time, id]
                );

                const [restaurant] = await db.query(
                    'SELECT max_capacity FROM restaurants WHERE id = ?',
                    [reservation[0].restaurant_id]
                );

                const currentCapacity = existingReservations[0].total_guests || 0;
                if (currentCapacity + party_size > restaurant[0].max_capacity) {
                    throw new Error('Not enough capacity for this modification');
                }
            }

            const fields = Object.keys(data);
            const values = Object.values(data);

            if (fields.length === 0) return false;

            const query = `
                UPDATE reservations 
                SET ${fields.map(field => `${field} = ?`).join(', ')}
                WHERE id = ? AND user_id = ?
            `;

            const [result] = await db.query(query, [...values, id, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async cancel(id, userId) {
        try {
            const [result] = await db.query(
                `UPDATE reservations 
                SET status = 'cancelled' 
                WHERE id = ? 
                AND user_id = ? 
                AND date >= CURDATE()`,
                [id, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getUpcoming(userId) {
        try {
            const [rows] = await db.query(
                `SELECT r.*, rest.name as restaurant_name, rest.location 
                FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE r.user_id = ? 
                AND r.date >= CURDATE() 
                AND r.status = 'confirmed' 
                ORDER BY r.date ASC, r.time ASC`,
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Reservation; 