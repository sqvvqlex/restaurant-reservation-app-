require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    port: process.env.PORT || 3008,
    db: {
        host: process.env.DB_HOST || 'ipv4.kosmidis.me',
        port: process.env.DB_PORT || 33066,
        user: process.env.DB_USER || 'asavvatianos22b',
        password: process.env.DB_PASSWORD || 'b559aa7c',
        database: process.env.DB_NAME || 'asavvatianos22b_db2',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_secure_jwt_secret_here',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    }
};

// Create the connection pool
const pool = mysql.createPool(config.db);

// Validate required configuration
const requiredEnvVars = ['jwt.secret'];
const missingEnvVars = requiredEnvVars.filter(path => {
    const value = path.split('.').reduce((obj, key) => obj && obj[key], config);
    return !value || value === 'your_secure_jwt_secret_here';
});

if (missingEnvVars.length > 0) {
    console.warn('⚠️  Warning: The following required environment variables are not set or using default values:');
    missingEnvVars.forEach(path => console.warn(`   - ${path}`));
}

module.exports = {
    ...config,
    db: pool  // Export the pool instead of just the config
};
