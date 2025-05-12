const pool = require('../config/index').db;
const bcrypt = require('bcryptjs');

const userController = {
    // Get user profile
    getProfile: async (req, res) => {
        try {
            const [users] = await pool.query(
                'SELECT id, username, email FROM users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ data: users[0] });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ message: 'Error fetching user profile' });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const updates = [];
            const values = [];

            if (username) {
                updates.push('username = ?');
                values.push(username);
            }

            if (email) {
                // Check if email is already taken
                const [existingUsers] = await pool.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email, req.user.id]
                );

                if (existingUsers.length > 0) {
                    return res.status(400).json({ message: 'Email already in use' });
                }

                updates.push('email = ?');
                values.push(email);
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push('password = ?');
                values.push(hashedPassword);
            }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'No updates provided' });
            }

            values.push(req.user.id);

            await pool.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            // Get updated user profile
            const [users] = await pool.query(
                'SELECT id, username, email FROM users WHERE id = ?',
                [req.user.id]
            );

            res.json({
                message: 'Profile updated successfully',
                data: users[0]
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ message: 'Error updating user profile' });
        }
    }
};

module.exports = userController; 