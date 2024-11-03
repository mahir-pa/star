require('dotenv').config({ path: '/Volumes/PortableSSD/jwt-auth-project/.env' });
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Ensure you have a User model in your project
const authRoutes = require('./routes/authRoutes'); // Import the routes

const app = express(); // Initialize Express app

app.use(express.json()); // Middleware to parse JSON

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Use the imported authentication routes
app.use('/api/auth', authRoutes);

// Middleware for authenticating JWT tokens
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user to request (excluding password)
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'No token, authorization denied' });
    }
};

// Example public route
app.get('/api/public', (req, res) => {
    res.json({ message: 'This is a public route' });
});

// Example protected route
app.get('/api/private', protect, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
