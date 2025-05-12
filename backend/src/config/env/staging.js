module.exports = {
    app: {
        env: process.env.NODE_ENV || 'staging',
        port: parseInt(process.env.PORT, 10) || 4000
    },
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT, 10) || 32788,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'book_db'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'devSuperSecretKey',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    swagger: {
        enabled: process.env.ENABLE_SWAGGER === 'true'
    },
    logger: {
        level: process.env.LOG_LEVEL || 'debug'
    },
    cors: {
        origins: (process.env.ALLOWED_ORIGINS || 'http://my.superdomain.eu').split(',').map(s => s.trim())
    }
};
