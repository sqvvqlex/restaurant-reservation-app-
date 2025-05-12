const db = require('../config/index').db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    static async findByEmail(email) {
        try {
            console.log('Finding user by email:', email);
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            console.log('Found rows:', rows);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('Finding user by ID:', id);
            const [rows] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [id]);
            console.log('Found rows:', rows);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    static async findByResetToken(token) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
                [token]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { username, email, password } = userData;
            
            // Input validation
            if (!username || username.trim().length === 0) {
                throw new Error('Username is required');
            }
            if (!email || !email.includes('@')) {
                throw new Error('Valid email is required');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            console.log('Creating user:', { username: username.trim(), email });
            
            const [result] = await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username.trim(), email, hashedPassword]
            );
            
            console.log('Insert result:', result);
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email is already registered');
            }
            throw error;
        }
    }

    static async update(id, userData) {
        try {
            const { username, email } = userData;
            const [result] = await db.query(
                'UPDATE users SET username = ?, email = ? WHERE id = ?',
                [username, email, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateResetToken(id, token, expiry) {
        try {
            const [result] = await db.query(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                [token, expiry, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(id, hashedPassword) {
        try {
            const [result] = await db.query(
                'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                [hashedPassword, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        try {
            console.log('Comparing passwords...');
            console.log('Plain password length:', plainPassword.length);
            console.log('Hashed password length:', hashedPassword.length);
            
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            console.log('Password comparison result:', isMatch);
            
            return isMatch;
        } catch (error) {
            console.error('Error comparing passwords:', error);
            throw error;
        }
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'default_jwt_secret_key_for_development',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }
}

module.exports = User; 