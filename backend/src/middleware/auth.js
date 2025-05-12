const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

module.exports = (req, res, next) => {
    try {
        logger.info('Checking authorization for:', {
            path: req.path,
            method: req.method
        });

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.warn('No authorization header found');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            logger.warn('Invalid authorization format:', authHeader);
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        const token = authHeader.split(' ')[1];
        logger.info('Token received, attempting verification');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info('Token verified successfully for user:', {
            userId: decoded.id,
            email: decoded.email
        });
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Token verification failed:', {
            error: error.message,
            type: error.name,
            token: req.headers.authorization ? '(token present)' : '(no token)'
        });
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token format' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 