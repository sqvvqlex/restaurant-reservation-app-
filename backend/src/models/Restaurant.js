const db = require('../config/index').db;

class Restaurant {
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT * 
                FROM restaurants 
                WHERE 1=1
            `;
            const params = [];

            if (filters.location) {
                query += ' AND location LIKE ?';
                params.push(`%${filters.location}%`);
            }

            if (filters.cuisine_type) {
                query += ' AND cuisine_type = ?';
                params.push(filters.cuisine_type);
            }

            if (filters.search) {
                query += ' AND (name LIKE ? OR description LIKE ?)';
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ' ORDER BY rating DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAvailableTimeSlots(restaurantId, date, partySize) {
        try {
            // Get restaurant details
            const [restaurant] = await db.query(
                'SELECT opening_hours, closing_hours, max_capacity FROM restaurants WHERE id = ?',
                [restaurantId]
            );

            if (!restaurant[0]) {
                throw new Error('Restaurant not found');
            }

            // Get existing reservations for the date
            const [reservations] = await db.query(
                `SELECT time, party_size 
                FROM reservations 
                WHERE restaurant_id = ? 
                AND date = ? 
                AND status = 'confirmed'`,
                [restaurantId, date]
            );

            // Generate time slots between opening and closing hours
            const slots = [];
            let currentTime = new Date(`2000-01-01T${restaurant[0].opening_hours}`);
            const closingTime = new Date(`2000-01-01T${restaurant[0].closing_hours}`);

            while (currentTime < closingTime) {
                const timeSlot = currentTime.toTimeString().slice(0, 5);
                
                // Calculate total occupancy for this time slot
                const existingReservations = reservations.filter(r => r.time === timeSlot);
                const currentOccupancy = existingReservations.reduce((sum, r) => sum + r.party_size, 0);

                // Check if there's enough capacity for the new party
                if (currentOccupancy + partySize <= restaurant[0].max_capacity) {
                    slots.push({
                        time: timeSlot,
                        available: true
                    });
                }

                // Move to next 30-minute slot
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            return slots;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const {
                name,
                location,
                cuisine_type,
                opening_hours,
                closing_hours,
                max_capacity,
                description
            } = data;

            const [result] = await db.query(
                `INSERT INTO restaurants 
                (name, location, cuisine_type, opening_hours, closing_hours, max_capacity, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, location, cuisine_type, opening_hours, closing_hours, max_capacity, description]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);

            if (fields.length === 0) return false;

            const query = `
                UPDATE restaurants 
                SET ${fields.map(field => `${field} = ?`).join(', ')}
                WHERE id = ?
            `;

            const [result] = await db.query(query, [...values, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async checkAvailability(id, date, time, party_size) {
        try {
            // Get restaurant capacity
            const [restaurant] = await db.query('SELECT max_capacity FROM restaurants WHERE id = ?', [id]);
            if (!restaurant[0]) return false;

            // Count existing reservations for the time slot
            const [reservations] = await db.query(
                'SELECT SUM(party_size) as total_guests FROM reservations WHERE restaurant_id = ? AND reservation_date = ? AND reservation_time = ? AND status != "cancelled"',
                [id, date, time]
            );

            const currentGuests = reservations[0].total_guests || 0;
            return (currentGuests + party_size) <= restaurant[0].max_capacity;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Restaurant; 