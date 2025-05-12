const validateReservation = (data) => {
    const errors = [];

    // Validate restaurant_id
    if (!data.restaurant_id || !Number.isInteger(data.restaurant_id)) {
        errors.push('Valid restaurant ID is required');
    }

    // Validate party_size
    if (!data.party_size || !Number.isInteger(data.party_size) || data.party_size < 1 || data.party_size > 20) {
        errors.push('Party size must be between 1 and 20');
    }

    // Validate reservation_date
    if (!data.reservation_date) {
        errors.push('Reservation date is required');
    } else {
        const date = new Date(data.reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(date.getTime())) {
            errors.push('Invalid reservation date format');
        } else if (date < today) {
            errors.push('Reservation date cannot be in the past');
        }
    }

    // Validate reservation_time
    if (!data.reservation_time) {
        errors.push('Reservation time is required');
    } else {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.reservation_time)) {
            errors.push('Invalid time format (use HH:MM)');
        }
    }

    // Validate special_requests (optional)
    if (data.special_requests && typeof data.special_requests !== 'string') {
        errors.push('Special requests must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateReservation
}; 