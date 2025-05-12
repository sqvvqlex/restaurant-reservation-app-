const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const {validateUUID} = require("../middlewares/validateUUID.middleware");

// Public routes

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Retrieve a list of books
 *     description: Fetches all books from the database with optional pagination.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Maximum number of books to return (optional).
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *         description: Number of books to skip before starting to collect the result set (optional).
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *               examples:
 *                  multipleBooks:
 *                    summary: Example response with multiple books
 *                    value:
 *                      - uuid: "123e4567-e89b-12d3-a456-426614174000"
 *                        title: "The Great Gatsby"
 *                        author: "F. Scott Fitzgerald"
 *                        published_year: 1925
 *                        genre: "Fiction"
 *                      - uuid: "456e7890-f12b-34c5-d678-91011a121314"
 *                        title: "1984"
 *                        author: "George Orwell"
 *                        published_year: 1949
 *                        genre: "Dystopian"
 *       400:
 *         description: Bad request - Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid limit or offset value. Must be a positive integer."
 *       500:
 *         description: Internal Server Error - Unexpected database issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Retrieve a book by UUID
 *     description: Fetches a single book from the database using its UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the book to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Book"
 *             examples:
 *               singleBook:
 *                 summary: Example response with a book
 *                 value:
 *                   uuid: "123e4567-e89b-12d3-a456-426614174000"
 *                   title: "The Great Gatsby"
 *                   author: "F. Scott Fitzgerald"
 *                   published_year: 1925
 *                   genre: "Fiction"
 *       400:
 *         description: Bad request - Invalid UUID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid UUID format."
 *       404:
 *         description: Book not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book not found."
 *       500:
 *         description: Internal Server Error - Unexpected database issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.get('/:id', bookController.getBookById);

// Protected routes

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book
 *     description: Creates a new book record in the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/BookInput"
 *           examples:
 *             newBook:
 *               summary: Example of a book to be created
 *               value:
 *                 title: "To Kill a Mockingbird"
 *                 author: "Harper Lee"
 *                 published_year: 1960
 *                 genre: "Fiction"
 *     responses:
 *       201:
 *         description: Book successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 title:
 *                   type: string
 *                   example: "The Great Gatsby"
 *                 author:
 *                   type: string
 *                   example: "F. Scott Fitzgerald"
 *                 published_year:
 *                   type: integer
 *                   example: 1925
 *                 genre:
 *                   type: string
 *                   example: "Fiction"
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid data. All fields (title, author, published_year, genre) are required."
 *       401:
 *         description: Unauthorized - Missing authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       403:
 *         description: Forbidden - Invalid or expired authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Invalid token"
 *       500:
 *         description: Internal Server Error - Unexpected database issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.post('/', authenticateToken, bookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update an existing book
 *     description: Updates details of an existing book in the database.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the book to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Great Gatsby"
 *               author:
 *                 type: string
 *                 example: "F. Scott Fitzgerald"
 *               published_year:
 *                 type: integer
 *                 example: 1925
 *               genre:
 *                 type: string
 *                 example: "Fiction"
 *             required:
 *               - title
 *               - author
 *               - published_year
 *               - genre
 *     responses:
 *       200:
 *         description: Book successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book updated successfully."
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid data. All fields (title, author, published_year, genre) are required."
 *       401:
 *         description: Unauthorized - Missing authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       403:
 *         description: Forbidden - Invalid or expired authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Invalid token"
 *       404:
 *         description: Book not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book not found."
 *       500:
 *         description: Internal Server Error - Unexpected database issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.put('/:id', [authenticateToken, validateUUID], bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Removes a book from the database using its UUID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the book to delete.
 *     responses:
 *       204:
 *         description: Book successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book deleted successfully."
 *       400:
 *         description: Bad request - Invalid UUID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid UUID format."
 *       401:
 *         description: Unauthorized - Missing authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       403:
 *         description: Forbidden - Invalid or expired authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Invalid token"
 *       404:
 *         description: Book not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book not found."
 *       500:
 *         description: Internal Server Error - Unexpected database issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.delete('/:id', authenticateToken, bookController.deleteBook);

module.exports = router;
