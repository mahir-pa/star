const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Registration route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error); // Debugging line
        res.status(400).json({ error: 'User registration failed' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    console.log('Login request body:', req.body); // Log the incoming request body

    const { username, password } = req.body;
    if (!username || !password) {
        console.log('Missing username or password'); // Log if data is missing
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found'); // Log if user is not found
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User found:', user); // Log user details

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match'); // Log if password comparison fails
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Password matched'); // Log if password matches

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated successfully'); // Log if token is generated successfully

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error); // Log detailed error for debugging
        res.status(400).json({ error: 'Login failed' });
    }
});

module.exports = router;
