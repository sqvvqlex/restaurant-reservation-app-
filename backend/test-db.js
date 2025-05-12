const mysql = require('mysql2/promise');

async function testConnection() {
    const pool = mysql.createPool({
        host: 'ipv4.kosmidis.me',
        port: 33066,
        user: 'asavvatianos22b',
        password: 'b559aa7c',
        database: 'asavvatianos22b_db2',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Attempting to connect to database...');
        const connection = await pool.getConnection();
        console.log('Successfully connected to database!');
        
        // Test query
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('Test query result:', rows);
        
        // Check if users table exists
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Available tables:', tables);
        
        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testConnection(); 