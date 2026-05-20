const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        //  validation [cite: 44]
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // user existence check
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // password hash
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // database save
        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );

        // JWT Generation
        const token = jwt.sign(
            { id: newUser.rows[0].id, username: newUser.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            token: token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

module.exports = { registerUser };