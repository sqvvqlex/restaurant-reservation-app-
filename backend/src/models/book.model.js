const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

/**
 * Get a new database connection
 * @returns {Promise<mysql.Connection>}
 */
const getConnection = async () => {
    return mysql.createConnection(dbConfig);
};

const BookModel = {
    /**
     * Fetch all books with optional pagination
     * @param {number|null} limit
     * @param {number|null} offset
     * @returns {Promise<Array>}
     */
    async getAllBooks(limit = null, offset = null) {
        let query = 'SELECT * FROM books';
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
     * Get a book by its UUID
     * @param {string} uuid
     * @returns {Promise<Object|null>}
     */
    async getBookById(uuid) {
        const conn = await getConnection();
        const [rows] = await conn.execute('SELECT * FROM books WHERE uuid = ?', [uuid]);
        await conn.end();
        return rows.length ? rows[0] : null;
    },

    /**
     * Create a new book
     * @param {Object} bookData
     * @param {string} bookData.uuid
     * @param {string} bookData.title
     * @param {string} bookData.author
     * @param {number} bookData.published_year
     * @param {string} bookData.genre
     * @returns {Promise<void>}
     */
    async createBook({ uuid, title, author, published_year, genre }) {
        const conn = await getConnection();
        await conn.execute(
            'INSERT INTO books (uuid, title, author, published_year, genre) VALUES (?, ?, ?, ?, ?)',
            [uuid, title, author, published_year, genre]
        );
        await conn.end();
    },

    /**
     * Update an existing book
     * @param {string} uuid
     * @param {Object} bookData
     * @param {string} bookData.title
     * @param {string} bookData.author
     * @param {number} bookData.published_year
     * @param {string} bookData.genre
     * @returns {Promise<boolean>} - True if updated, false if book not found
     */
    async updateBook(uuid, { title, author, published_year, genre }) {
        const conn = await getConnection();

        const [result] = await conn.execute(
            'UPDATE books SET title = ?, author = ?, published_year = ?, genre = ? WHERE uuid = ?',
            [title, author, published_year, genre, uuid]
        );

        await conn.end();
        return result.affectedRows > 0;
    },

    /**
     * Delete a book by UUID
     * @param {string} uuid
     * @returns {Promise<boolean>} - True if deleted, false if not found
     */
    async deleteBook(uuid) {
        const conn = await getConnection();
        const [result] = await conn.execute('DELETE FROM books WHERE uuid = ?', [uuid]);
        await conn.end();
        return result.affectedRows > 0;
    },

    /**
     * Check if a book exists by UUID
     * @param {string} uuid
     * @returns {Promise<boolean>}
     */
    async bookExists(uuid) {
        const conn = await getConnection();
        const [rows] = await conn.execute('SELECT 1 FROM books WHERE uuid = ? LIMIT 1', [uuid]);
        await conn.end();
        return rows.length > 0;
    }
};

module.exports = BookModel;
