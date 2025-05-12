const { validate: validateUuidV4 } = require('uuid');

/**
 * Validate if a string is a valid UUID v4.
 * @param {string} uuid - UUID string to validate.
 * @returns {boolean} True if valid UUID v4, false otherwise.
 */
function validateUuid(uuid) {
    return validateUuidV4(uuid);
}

/**
 * Validate the structure and types of a book object.
 * @param {object} book - Book object to validate.
 * @param {string} book.title
 * @param {string} book.author
 * @param {number} book.published_year
 * @param {string} book.genre
 * @returns {{ valid: boolean, message?: string }}
 */
function validateBookData(book) {
    if (!book || typeof book !== 'object') {
        return { valid: false, message: 'Book data must be a valid object.' };
    }

    const { title, author, published_year, genre } = book;

    if (!title || typeof title !== 'string') {
        return { valid: false, message: 'Invalid or missing "title".' };
    }
    if (!author || typeof author !== 'string') {
        return { valid: false, message: 'Invalid or missing "author".' };
    }
    if (typeof published_year !== 'number' || published_year < 0) {
        return { valid: false, message: 'Invalid or missing "published_year".' };
    }
    if (!genre || typeof genre !== 'string') {
        return { valid: false, message: 'Invalid or missing "genre".' };
    }

    return { valid: true };
}

/**
 * Validate the structure and types of a book object.
 * @param {object} restaurant - Book object to validate.
 * @param {string} restaurants.title
 * @param {string} restaurants.author
 * @param {number} restaurants.published_year
 * @param {string} restaurants.genre
 * @returns {{ valid: boolean, message?: string }}
 */
function validateRestaurantData(restaurant) {
    if (!restaurant || typeof restaurant !== 'object') {
        return { valid: false, message: 'Restaurant data must be a valid object.' };
    }

    const { name, address, phone } = restaurant;

    if (!name || typeof name !== 'string') {
        return { valid: false, message: 'Invalid or missing "name".' };
    }
    if (!address || typeof address !== 'string') {
        return { valid: false, message: 'Invalid or missing "address".' };
    }
    if (!phone || typeof phone !== 'string') {
        return { valid: false, message: 'Invalid or missing "phone".' };
    }

    return { valid: true };
}

const validateReservation = ({ date, time, party_size }) => {
    // Validate date
    if (!date) {
        return 'Date is required';
    }
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservationDate < today) {
        return 'Reservation date cannot be in the past';
    }

    // Validate time
    if (!time) {
        return 'Time is required';
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        return 'Invalid time format. Please use HH:MM format';
    }

    // Validate party size
    if (!party_size || !Number.isInteger(Number(party_size))) {
        return 'Party size must be a valid number';
    }
    if (party_size < 1) {
        return 'Party size must be at least 1';
    }
    if (party_size > 20) {
        return 'Party size cannot exceed 20 people';
    }

    return null;
};

const validateUser = ({ name, email, password }) => {
    // Validate name
    if (!name || name.trim().length < 2) {
        return 'Name must be at least 2 characters long';
    }

    // Validate email
    if (!email) {
        return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }

    // Validate password
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters long';
    }

    return null;
};

module.exports = {
    validateUuid,
    validateBookData,
    validateRestaurantData,
    validateReservation,
    validateUser
};
