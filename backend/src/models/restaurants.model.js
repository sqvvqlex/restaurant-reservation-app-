const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

/**
 * Get a new database connection
 * @returns {Promise<mysql.Connection>}
 */
const getConnection = async () => {
    return mysql.createConnection(dbConfig);
};

const RestaurantModel = {
    /**
     * Fetch all Restaurants with optional pagination
     * @param {number|null} limit
     * @param {number|null} offset
     * @returns {Promise<Array>}
     */
    async getAllRestaurants(limit = null, offset = null) {
        let query = 'SELECT * FROM restaurants';
        const params = [];

        if (limit !== null) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        if (offset !== null && limit !== null) {
            query += ' OFFSET ?';
            params.push(offset);
        }

        const conn = await getConnection();
        const [rows] = await conn.execute(query, params);
        await conn.end();
        return rows;
    },

    /**
     * Get a Restaurant by its UUID
     * @param {string} uuid
     * @returns {Promise<Object|null>}
     */
    async getRestaurantById(uuid) {
        const conn = await getConnection();
        const [rows] = await conn.execute('SELECT * FROM restaurants WHERE restaurant_uuid = ?', [restaurant_uuid]);
        await conn.end();
        return rows.length ? rows[0] : null;
    },

    /**
     * Create a new Restaurant
     * @param {Object} RestaurantsData
     * @param {string} RestaurantsData.restaurant_uuid
     * @param {string} RestaurantsData.name
     * @param {string} RestaurantsData.address
     * @param {number} RestaurantsData.phone
     * @returns {Promise<void>}
     */
    async createRestaurant({ restaurant_uuid, name, address, phone}) {
        const conn = await getConnection();
        await conn.execute(
            'INSERT INTO restaurants (restaurant_uuid, name, address, phone) VALUES (?, ?, ?, ?)',
            [restaurant_uuid, name, address, phone]
        );
        await conn.end();
    },

    /**
     * Update an existing Restaurants
     * @param {string} restaurant_uuid
     * @param {Object} restaurantData
     * @param {string} restaurantData.name
     * @param {string} restaurantData.address
     * @param {number} restaurantData.phone
     * @returns {Promise<boolean>} - True if updated, false if book not found
     */
    async updateRestaurant(restaurant_uuid, { title, author, published_year, genre }) {
        const conn = await getConnection();

        const [result] = await conn.execute(
            'UPDATE restaurants SET name = ?, address = ?, phone = ? WHERE restaurant_uuid = ?',
            [name, address, phone, restaurant_uuid]
        );

        await conn.end();
        return result.affectedRows > 0;
    },

    /**
     * Delete a restaurant by UUID
     * @param {string} restaurant_uuid
     * @returns {Promise<boolean>} - True if deleted, false if not found
     */
    async deleteRestaurant(uuid) {
        const conn = await getConnection();
        const [result] = await conn.execute('DELETE FROM restaurants WHERE restaurant_uuid = ?', [restaurant_uuid]);
        await conn.end();
        return result.affectedRows > 0;
    },

    /**
     * Check if a restaurant exists by UUID
     * @param {string} restaurant_uuid
     * @returns {Promise<boolean>}
     */
    async restaurantExists(restaurant_uuid) {
        const conn = await getConnection();
        const [rows] = await conn.execute('SELECT 1 FROM restaurants WHERE restaurant_uuid = ? LIMIT 1', [restaurant_uuid]);
        await conn.end();
        return rows.length > 0;
    }
};

module.exports = BookModel;
