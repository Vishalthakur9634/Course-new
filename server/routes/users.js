const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const router = express.Router();

// Get User Profile & Progress
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('purchasedCourses')
            .populate({
                path: 'enrolledCourses.courseId',
                select: 'title thumbnail instructorId'
            })
            .populate({
                path: 'watchHistory.videoId',
                select: 'title duration'
            })
            .populate({
                path: 'watchHistory.courseId',
                select: 'title thumbnail'
            });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update User Profile
router.put('/profile/:userId', async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;

        if (req.body.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Update Video Progress
router.post('/progress', async (req, res) => {
    try {
        const { userId, videoId, courseId, progress, completed } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if video exists in history
        const historyIndex = user.watchHistory.findIndex(h => h.videoId.toString() === videoId);

        if (historyIndex > -1) {
            // Update existing record
            user.watchHistory[historyIndex].progress = progress;
            user.watchHistory[historyIndex].lastWatched = Date.now();
            if (completed) user.watchHistory[historyIndex].completed = true;
        } else {
            // Add new record
            user.watchHistory.push({
                videoId,
                courseId,
                progress,
                completed,
                lastWatched: Date.now()
            });
        }

        await user.save();
        res.json({ message: 'Progress updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
});

module.exports = router;
