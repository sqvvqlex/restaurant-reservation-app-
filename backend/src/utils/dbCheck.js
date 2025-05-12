const pool = require('../config/index').db;
const { logger } = require('./logger');

async function checkDatabase() {
    try {
        // Test connection
        const connection = await pool.getConnection();
        logger.info('✅ Database connection successful');

        // Check if tables exist
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [process.env.DB_NAME || 'asavvatianos22b_db2']);

        logger.info('Existing tables:', tables.map(t => t.table_name));

        // Check restaurants table
        const [restaurants] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
        logger.info(`Restaurants in database: ${restaurants[0].count}`);

        // Release connection
        connection.release();
        
        return true;
    } catch (error) {
        logger.error('Database check failed:', error);
        return false;
    }
}

module.exports = { checkDatabase }; 