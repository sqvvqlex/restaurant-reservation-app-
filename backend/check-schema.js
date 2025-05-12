const mysql = require('mysql2/promise');

async function checkSchema() {
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
        console.log('Checking users table schema...');
        const [columns] = await pool.query('DESCRIBE users');
        console.log('Users table columns:', columns);
        
        // Also check if there are any existing users
        const [users] = await pool.query('SELECT * FROM users LIMIT 1');
        console.log('Sample user (if any):', users[0]);
        
        await pool.end();
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema(); 