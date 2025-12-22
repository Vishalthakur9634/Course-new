const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const router = express.Router();

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await User.find({
            role: 'instructor',
            isInstructorApproved: true
        }).select('name email avatar instructorProfile');

        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructors', error: error.message });
    }
});

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

// Get Public Profile (Student Resume/Gamification)
router.get('/:userId/public-profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name avatar bio createdAt role enrolledCourses certificates')
            .populate({
                path: 'enrolledCourses.courseId',
                select: 'title thumbnail category difficulty'
            })
            .lean();

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Gamification Logic (Orbit XP)
        // 1 Course = 500 XP
        // 1 Certificate = 1000 XP
        // 1 Year active = 200 XP
        const coursesCompleted = user.enrolledCourses.filter(c => c.progress === 100).length;
        const certificatesCount = user.certificates ? user.certificates.length : 0;
        const yearsActive = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 365);

        const xp = Math.floor(
            (user.enrolledCourses.length * 100) +
            (coursesCompleted * 400) +
            (certificatesCount * 1000) +
            (yearsActive * 200)
        );

        // Badges Calculation
        const badges = [];
        if (xp > 1000) badges.push({ name: 'Orbit Explorer', icon: 'Rocket', color: 'blue' });
        if (xp > 5000) badges.push({ name: 'Galaxy Master', icon: 'Crown', color: 'purple' });
        if (coursesCompleted >= 5) badges.push({ name: 'Dedicated Learner', icon: 'BookOpen', color: 'green' });
        if (certificatesCount >= 1) badges.push({ name: 'Certified Pro', icon: 'Award', color: 'yellow' });

        res.json({
            ...user,
            gamification: {
                xp,
                level: Math.floor(xp / 1000) + 1,
                badges,
                coursesCompleted
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public profile', error: error.message });
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

// Get User Wishlist
router.get('/:userId/wishlist', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate({
            path: 'wishlist',
            select: 'title thumbnail price rating instructorId',
            populate: {
                path: 'instructorId',
                select: 'name'
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
});

// Toggle Wishlist Item
router.post('/:userId/wishlist/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.wishlist.indexOf(courseId);
        let action = '';

        if (index > -1) {
            // Remove
            user.wishlist.splice(index, 1);
            action = 'removed';
        } else {
            // Add
            user.wishlist.push(courseId);
            action = 'added';
        }

        await user.save();
        res.json({ message: `Course ${action} from wishlist`, wishlist: user.wishlist, action });
    } catch (error) {
        res.status(500).json({ message: 'Error updating wishlist', error: error.message });
    }
});

// Get top instructors for leaderboard
router.get('/instructors/top', async (req, res) => {
    try {
        const Course = require('../models/Course');
        const Enrollment = require('../models/Enrollment');

        const instructors = await User.find({
            role: 'instructor',
            isInstructorApproved: true
        }).select('name email avatar').lean();

        // Get student count and rating for each instructor
        const instructorStats = await Promise.all(instructors.map(async (instructor) => {
            const courses = await Course.find({ instructorId: instructor._id });
            const courseIds = courses.map(c => c._id);
            const studentCount = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
            const avgRating = courses.length > 0
                ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
                : 0;

            return {
                ...instructor,
                studentCount,
                rating: avgRating.toFixed(1)
            };
        }));

        // Sort by student count descending
        instructorStats.sort((a, b) => b.studentCount - a.studentCount);

        res.json(instructorStats.slice(0, 10));
    } catch (error) {
        console.error('Error fetching top instructors:', error);
        res.status(500).json({ message: 'Error fetching top instructors', error: error.message });
    }
});

module.exports = router;
