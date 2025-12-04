const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate role
        if (role && !['student', 'instructor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Choose student or instructor.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if this is the first user - if so, make them superadmin
        const userCount = await User.countDocuments();
        let userRole = role || 'student';
        let isInstructorApproved = false;

        if (userCount === 0) {
            userRole = 'superadmin';
            isInstructorApproved = true;
        } else if (userRole === 'instructor') {
            // Instructors need approval (set to false initially)
            isInstructorApproved = false;
        }

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            isInstructorApproved: userRole === 'instructor' ? isInstructorApproved : true,
            instructorApplicationDate: userRole === 'instructor' ? new Date() : undefined
        });

        await user.save();

        // Create welcome notification
        await Notification.create({
            userId: user._id,
            type: 'system_announcement',
            title: 'Welcome to Course Launcher!',
            message: userRole === 'instructor'
                ? 'Your instructor application is under review. You will be notified once approved.'
                : 'Start browsing courses and begin your learning journey!',
            priority: 'medium'
        });

        // If instructor, notify super admins
        if (userRole === 'instructor') {
            const superAdmins = await User.find({ role: 'superadmin' });
            for (const admin of superAdmins) {
                await Notification.create({
                    userId: admin._id,
                    type: 'instructor_approved',
                    title: 'New Instructor Application',
                    message: `${name} (${email}) has applied to become an instructor`,
                    link: `/admin/instructors/pending`,
                    priority: 'high'
                });
            }
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                isInstructorApproved: user.isInstructorApproved
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name,
                email,
                role: user.role,
                isInstructorApproved: user.isInstructorApproved,
                avatar: user.avatar
            }
        });
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

        if (user.isBanned) {
            return res.status(403).json({
                message: 'Your account has been suspended',
                reason: user.banReason
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                isInstructorApproved: user.isInstructorApproved
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email,
                role: user.role,
                isInstructorApproved: user.isInstructorApproved,
                avatar: user.avatar,
                bio: user.bio,
                instructorProfile: user.role === 'instructor' ? user.instructorProfile : undefined
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

// Get current user (verify token)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;

