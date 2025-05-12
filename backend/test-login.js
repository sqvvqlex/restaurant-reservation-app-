const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin(email, password) {
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
        console.log(`Attempting login for: ${email}`);
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('No user found with this email');
            return;
        }
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            console.log('Login successful! User:', {
                id: user.id,
                username: user.username,
                email: user.email
            });
        } else {
            console.log('Invalid password');
        }
    } catch (error) {
        console.error('Login test error:', error);
    } finally {
        await pool.end();
    }
}

// Test with known user
// Change these values to test other users
const email = 'test2@example.com';
const password = 'test123';
testLogin(email, password); 