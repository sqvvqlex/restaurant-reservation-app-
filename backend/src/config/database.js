const mysql = require('mysql2/promise');
const config = require('./index');

// Debug: Print DB config at runtime
console.log('DB CONFIG:', {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
});

const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Debug: log connection details on new connection
pool.on('connection', (connection) => {
  console.log('New DB connection created:', { host: connection.config.host, port: connection.config.port, user: connection.config.user, database: connection.config.database });
});

// Initialize database
const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create restaurants table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                cuisine_type VARCHAR(100),
                opening_hours TIME NOT NULL,
                closing_hours TIME NOT NULL,
                max_capacity INT NOT NULL DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create reservations table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                restaurant_id INT NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                people_count INT NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                special_requests TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            )
        `);

        // Insert sample restaurants if none exist
        const [restaurants] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
        if (restaurants[0].count === 0) {
            const sampleRestaurants = [
                {
                    name: 'La Bella Italia',
                    location: 'Downtown Athens',
                    description: 'Authentic Italian cuisine in the heart of Athens',
                    cuisine_type: 'Italian',
                    opening_hours: '12:00:00',
                    closing_hours: '23:00:00',
                    max_capacity: 60
                },
                {
                    name: 'Souvlaki House',
                    location: 'Kolonaki',
                    description: 'Traditional Greek souvlaki and mezedes',
                    cuisine_type: 'Greek',
                    opening_hours: '11:00:00',
                    closing_hours: '00:00:00',
                    max_capacity: 40
                },
                {
                    name: 'Sushi Master',
                    location: 'Glyfada',
                    description: 'Premium Japanese sushi and sashimi',
                    cuisine_type: 'Japanese',
                    opening_hours: '13:00:00',
                    closing_hours: '23:00:00',
                    max_capacity: 30
                }
            ];

            for (const restaurant of sampleRestaurants) {
                await connection.query(
                    `INSERT INTO restaurants (
                        name, location, description, cuisine_type, 
                        opening_hours, closing_hours, max_capacity
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        restaurant.name, restaurant.location, restaurant.description,
                        restaurant.cuisine_type, restaurant.opening_hours,
                        restaurant.closing_hours, restaurant.max_capacity
                    ]
                );
            }
        }

        console.log('✅ Database initialized successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};

// Initialize the database when the module is loaded
(async () => {
    try {
        await initDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
})();

module.exports = pool;
