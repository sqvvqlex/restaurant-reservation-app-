const express = require('express');
const cors = require('cors');
const config = require('./config');
const { logger } = require('./utils/logger');
const { checkDatabase } = require('./utils/dbCheck');

const app = express();

// Middleware
app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health-check', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ message: 'An unexpected error occurred' });
});

// Start server
const startServer = async () => {
    try {
        // Check database connection and tables
        const dbReady = await checkDatabase();
        if (!dbReady) {
            logger.error('Database check failed - server will not start');
            process.exit(1);
        }

        const PORT = config.port;
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 