const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/index').db;
const { validateRestaurantData, validateUuid } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Get all books with optional pagination.
 */
const getAllRestaurants = async (req, res) => {
    let query = 'SELECT * FROM restaurants';
    const limit = req.query.limit && /^\d+$/.test(req.query.limit) ? parseInt(req.query.limit, 10) : null;
    const offset = req.query.offset && /^\d+$/.test(req.query.offset) ? parseInt(req.query.offset, 10) : null;

    if (req.query.limit && (isNaN(limit) || limit <= 0)) {
        return res.status(400).json({ message: 'Invalid limit value. Must be a positive integer.' });
    }

    if (req.query.offset && (isNaN(offset) || offset < 0)) {
        return res.status(400).json({ message: 'Invalid offset value. Must be a non-negative integer.' });
    }

    if (limit !== null) {
        query += ` LIMIT ${limit}`;
    }

    if (offset !== null && limit !== null) {
        query += ` OFFSET ${offset}`;
    }

    try {
        const conn = await db.createConnection();
        const [restaurants] = await conn.execute(query);
        await conn.end();
        return res.status(200).json(restaurants);
    } catch (error) {
        logger.error('Error fetching restaurants:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Get a single restaurant by UUID.
 */
const getRestaurantById = async (req, res) => {
    const { id } = req.params;

    if (!validateUuid(id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    try {
        const conn = await db.createConnection();
        const [rows] = await conn.execute('SELECT * FROM restaurant WHERE restaurant_uuid = ?', [restaurant_id]);
        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'restaurant not found.' });
        }

        //const {id, ...filteredRow} = rows[0];

        // delete rows[0].id;

        return res.status(200).json(rows[0]);
    } catch (error) {
        logger.error('Error fetching restaurant by ID:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Create a new restaurant.
 */
const createRestaurant = async (req, res) => {
    const validation = validateRestaurantData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const { name, address, phone} = req.body;
    const restaurant_uuid = uuidv4();

    try {
        const conn = await db.createConnection();
        await conn.execute(
            'INSERT INTO restaurants (restaurant_uuid, name, address, phone) VALUES (?, ?, ?, ?)',
            [restaurant_uuid, name, address, phone]
        );
        await conn.end();

        return res.status(201).json({ restaurant_uuid, name, address, phone});
    } catch (error) {
        logger.error('Error creating restaurant:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Update an existing book.
 */
const updateRestaurant = async (req, res) => {
    const { id } = req.params;

    if (!validateUuid(id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    const validation = validateRestaurantData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const { name, address, phone} = req.body;

    try {
        const conn = await db.createConnection();
        const [existing] = await conn.execute('SELECT * FROM restaurants WHERE restaurant_uuid = ?', [restaurant_id]);

        if (existing.length === 0) {
            await conn.end();
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        await conn.execute(
            'UPDATE restaurants SET name = ?, address = ?, phone = ? WHERE restaurant_uuid = ?',
            [name, address, phone, restaurant_id]
        );
        await conn.end();

        return res.status(200).json({ message: 'Restaurant updated successfully.' });
    } catch (error) {
        logger.error('Error updating restaurant:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Delete a restaurant by UUID.
 */
const deleteRestaurant = async (req, res) => {
    const { restaurant_id } = req.params;

    if (!validateUuid(restaurant_id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    try {
        const conn = await db.createConnection();
        const [existing] = await conn.execute('SELECT * FROM restaurants WHERE restaurant_uuid = ?', [restaurant_id]);

        if (existing.length === 0) {
            await conn.end();
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        await conn.execute('DELETE FROM restaurants WHERE restaurant_uuid = ?', [restaurant_id]);
        await conn.end();

        return res.status(204).json({ message: 'Restaurant deleted successfully.' });
    } catch (error) {
        logger.error('Error deleting Restaurant:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
};
