const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get admin statistics
router.get('/stats', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const totalVideos = await Video.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total storage (approximate)
        const uploadsDir = path.join(__dirname, '../uploads/courses');
        let totalSize = 0;

        try {
            if (fs.existsSync(uploadsDir)) {
                const calculateDirSize = (dirPath) => {
                    let size = 0;
                    try {
                        const files = fs.readdirSync(dirPath);
                        files.forEach(file => {
                            try {
                                const filePath = path.join(dirPath, file);
                                const stats = fs.statSync(filePath);
                                if (stats.isDirectory()) {
                                    size += calculateDirSize(filePath);
                                } else {
                                    size += stats.size;
                                }
                            } catch (fileError) {
                                // Skip files that can't be accessed
                                console.warn('Could not access file:', file);
                            }
                        });
                    } catch (dirError) {
                        console.warn('Could not read directory:', dirPath);
                    }
                    return size;
                };
                totalSize = calculateDirSize(uploadsDir);
            }
        } catch (storageError) {
            console.error('Error calculating storage:', storageError.message);
            // Continue with totalSize = 0
        }

        const totalStorageGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);

        res.json({
            totalCourses,
            totalVideos,
            totalUsers,
            totalStorageGB
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

// Get all users (admin only in production, but open for setup)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Make user admin
router.post('/make-admin/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = 'admin';
        await user.save();

        res.json({ message: 'User is now admin', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Delete course
router.delete('/courses/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Delete all videos associated with this course
        const videos = await Video.find({ courseId: course._id });

        for (const video of videos) {
            // Delete video files from disk
            const videoPath = video.videoUrl.replace('/uploads/', '');
            const fullPath = path.join(__dirname, '../uploads', videoPath);
            const videoDir = path.dirname(fullPath);

            if (fs.existsSync(videoDir)) {
                fs.rmSync(videoDir, { recursive: true, force: true });
            }

            // Delete video from database
            await Video.findByIdAndDelete(video._id);
        }

        // Delete course from database
        await Course.findByIdAndDelete(course._id);

        res.json({ message: 'Course and all associated videos deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

// Delete video
router.delete('/courses/:courseId/videos/:videoId', async (req, res) => {
    try {
        const { courseId, videoId } = req.params;

        // Find the video
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Delete video files from disk
        const videoPath = video.videoUrl.replace('/uploads/', '');
        const fullPath = path.join(__dirname, '../uploads', videoPath);
        const videoDir = path.dirname(fullPath);

        console.log('Deleting video directory:', videoDir);

        if (fs.existsSync(videoDir)) {
            fs.rmSync(videoDir, { recursive: true, force: true });
            console.log('Video files deleted successfully');
        }

        // Remove video reference from course
        await Course.findByIdAndUpdate(courseId, {
            $pull: { videos: videoId }
        });

        // Delete video from database
        await Video.findByIdAndDelete(videoId);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
});

// Get Payment History
router.get('/payments', async (req, res) => {
    try {
        const Payment = require('../models/Payment');
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});

// Get all reviews
router.get('/reviews', async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Delete review
router.delete('/reviews/:reviewId', async (req, res) => {
    try {
        const Review = require('../models/Review');
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

// Get all announcements
router.get('/announcements', async (req, res) => {
    try {
        const Announcement = require('../models/Announcement');
        const announcements = await Announcement.find()
            .populate('courseId', 'title')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements', error: error.message });
    }
});

// Create announcement
router.post('/announcements', async (req, res) => {
    try {
        const Announcement = require('../models/Announcement');
        const { courseId, title, message, priority } = req.body;

        const announcement = new Announcement({
            courseId,
            title,
            message,
            priority: priority || 'medium',
            createdBy: req.user?.id // If auth is implemented
        });

        await announcement.save();

        // Populate for return
        const populated = await Announcement.findById(announcement._id)
            .populate('courseId', 'title')
            .populate('createdBy', 'name email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Error creating announcement', error: error.message });
    }
});

// Delete announcement
router.delete('/announcements/:announcementId', async (req, res) => {
    try {
        const Announcement = require('../models/Announcement');
        const announcement = await Announcement.findByIdAndDelete(req.params.announcementId);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Error deleting announcement', error: error.message });
    }
});

// Get all certificates
router.get('/certificates', async (req, res) => {
    try {
        const Certificate = require('../models/Certificate');
        const certificates = await Certificate.find()
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ issueDate: -1 });
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Error fetching certificates', error: error.message });
    }
});

module.exports = router;
