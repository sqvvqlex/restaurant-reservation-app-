const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/index').db;
const { validateBookData, validateUuid } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Get all books with optional pagination.
 */
const getAllBooks = async (req, res) => {
    let query = 'SELECT * FROM books';
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
        const [books] = await conn.execute(query);
        await conn.end();
        return res.status(200).json(books);
    } catch (error) {
        logger.error('Error fetching books:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Get a single book by UUID.
 */
const getBookById = async (req, res) => {
    const { id } = req.params;

    if (!validateUuid(id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    try {
        const conn = await db.createConnection();
        const [rows] = await conn.execute('SELECT * FROM books WHERE uuid = ?', [id]);
        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        //const {id, ...filteredRow} = rows[0];

        // delete rows[0].id;

        return res.status(200).json(rows[0]);
    } catch (error) {
        logger.error('Error fetching book by ID:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Create a new book.
 */
const createBook = async (req, res) => {
    const validation = validateBookData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const { title, author, published_year, genre } = req.body;
    const uuid = uuidv4();

    try {
        const conn = await db.createConnection();
        await conn.execute(
            'INSERT INTO books (uuid, title, author, published_year, genre) VALUES (?, ?, ?, ?, ?)',
            [uuid, title, author, published_year, genre]
        );
        await conn.end();

        return res.status(201).json({ uuid, title, author, published_year, genre });
    } catch (error) {
        logger.error('Error creating book:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Update an existing book.
 */
const updateBook = async (req, res) => {
    const { id } = req.params;

    if (!validateUuid(id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    const validation = validateBookData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const { title, author, published_year, genre } = req.body;

    try {
        const conn = await db.createConnection();
        const [existing] = await conn.execute('SELECT * FROM books WHERE uuid = ?', [id]);

        if (existing.length === 0) {
            await conn.end();
            return res.status(404).json({ message: 'Book not found.' });
        }

        await conn.execute(
            'UPDATE books SET title = ?, author = ?, published_year = ?, genre = ? WHERE uuid = ?',
            [title, author, published_year, genre, id]
        );
        await conn.end();

        return res.status(200).json({ message: 'Book updated successfully.' });
    } catch (error) {
        logger.error('Error updating book:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

/**
 * Delete a book by UUID.
 */
const deleteBook = async (req, res) => {
    const { id } = req.params;

    if (!validateUuid(id)) {
        return res.status(400).json({ message: 'Invalid UUID format.' });
    }

    try {
        const conn = await db.createConnection();
        const [existing] = await conn.execute('SELECT * FROM books WHERE uuid = ?', [id]);

        if (existing.length === 0) {
            await conn.end();
            return res.status(404).json({ message: 'Book not found.' });
        }

        await conn.execute('DELETE FROM books WHERE uuid = ?', [id]);
        await conn.end();

        return res.status(204).json({ message: 'Book deleted successfully.' });
    } catch (error) {
        logger.error('Error deleting book:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
};
