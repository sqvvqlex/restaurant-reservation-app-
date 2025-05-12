const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
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
        console.log('Attempting to create test user...');
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            ['test2@example.com', 'Test User 2', hashedPassword]
        );
        
        console.log('Test user created successfully!', result);
        
        // Verify the user was created
        const [users] = await pool.query('SELECT id, email, username, created_at FROM users WHERE email = ?', ['test2@example.com']);
        console.log('Created user details:', users[0]);
        
        await pool.end();
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

createTestUser(); 