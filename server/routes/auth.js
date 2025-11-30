const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if this is the first user - if so, make them admin
        const userCount = await User.countDocuments();
        const userRole = userCount === 0 ? 'admin' : (role || 'user');

        const user = new User({ name, email, password: hashedPassword, role: userRole });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

module.exports = router;
