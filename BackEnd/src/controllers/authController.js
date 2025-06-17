const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDb } = require('../../db');

const authController = {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validate user input
            const validationErrors = User.validate({ name, email, password });
            if (validationErrors.length > 0) {
                return res.status(400).json({ errors: validationErrors });
            }

            const db = getDb();

            // Check if user already exists
            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new User(name, email, hashedPassword);
            const result = await db.collection('users').insertOne(user);

            // Generate JWT token
            const token = jwt.sign(
                { userId: result.insertedId },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Return user data (excluding password) and token
            const userData = {
                id: result.insertedId,
                name: user.name,
                email: user.email,
                token
            };

            res.status(201).json(userData);
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Error creating user account' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate login credentials
            const validationErrors = User.validateLogin({ email, password });
            if (validationErrors.length > 0) {
                return res.status(400).json({ errors: validationErrors });
            }

            const db = getDb();

            // Find user by email
            const user = await db.collection('users').findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Return user data (excluding password) and token
            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                token
            };

            res.status(200).json(userData);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Error during login' });
        }
    }
};

module.exports = authController; 