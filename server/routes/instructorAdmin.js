const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const { authenticate } = require('../middleware/rbac');

// Middleware to check if user is instructor or admin
const isInstructor = (req, res, next) => {
    console.log('isInstructor Middleware Check:', {
        user: req.user ? req.user._id : 'No User',
        role: req.user ? req.user.role : 'No Role',
        approved: req.user ? req.user.isInstructorApproved : 'N/A'
    });

    if (!req.user || !['instructor', 'admin', 'superadmin'].includes(req.user.role)) {
        console.log('Access Denied: Invalid Role');
        return res.status(403).json({ message: 'Access denied. Instructor or Admin only.' });
    }
    next();
};

// Apply authentication to all routes
router.use(authenticate);

// Dashboard stats for instructor
router.get('/dashboard', isInstructor, async (req, res) => {
    try {
        const instructorId = req.user._id;

        // Get all courses by this instructor
        const courses = await Course.find({ instructorId }).populate('videos');

        // Get enrollments for these courses
        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email avatar')
            .populate('courseId', 'title');

        // Calculate stats
        // Safety check: Filter out enrollments where userId is null (deleted users)
        const validEnrollments = enrollments.filter(e => e.userId);
        const totalStudents = new Set(validEnrollments.map(e => e.userId._id.toString())).size;

        const totalRevenue = courses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);
        const totalCourses = courses.length;
        // Safety check: Ensure videos array exists
        const totalVideos = courses.reduce((sum, course) => sum + (course.videos ? course.videos.length : 0), 0);

        res.json({
            totalCourses,
            totalStudents,
            totalRevenue,
            totalVideos,
            courses: courses.map(c => ({
                _id: c._id,
                title: c.title,
                enrollmentCount: c.enrollmentCount || 0,
                revenue: c.totalRevenue || 0,
                rating: c.rating || 0,
                videoCount: c.videos ? c.videos.length : 0
            })),
            recentEnrollments: validEnrollments.slice(0, 10).map(e => ({
                _id: e._id,
                enrolledAt: e.enrolledAt,
                userId: e.userId
            }))
        });
    } catch (error) {
        console.error('Error fetching instructor dashboard:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all courses by instructor
router.get('/courses', isInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id })
            .populate('videos')
            .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update instructor admin settings for a course
router.put('/courses/:id/settings', isInstructor, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            instructorId: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        const { enableOverview, enableQA, enableSummary, enableNotes, customOverviewContent } = req.body;

        if (!course.instructorAdminSettings) {
            course.instructorAdminSettings = {};
        }

        if (enableOverview !== undefined) course.instructorAdminSettings.enableOverview = enableOverview;
        if (enableQA !== undefined) course.instructorAdminSettings.enableQA = enableQA;
        if (enableSummary !== undefined) course.instructorAdminSettings.enableSummary = enableSummary;
        if (enableNotes !== undefined) course.instructorAdminSettings.enableNotes = enableNotes;
        if (customOverviewContent !== undefined) course.instructorAdminSettings.customOverviewContent = customOverviewContent;

        await course.save();
        res.json(course);
    } catch (error) {
        console.error('Error updating course settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get students enrolled in instructor's courses
router.get('/students', isInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email avatar')
            .populate('courseId', 'title')
            .sort({ enrolledAt: -1 });

        // Filter out enrollments with deleted users
        const validEnrollments = enrollments.filter(e => e.userId);

        res.json(validEnrollments);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get students for a specific course
router.get('/courses/:id/students', isInstructor, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            instructorId: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        const enrollments = await Enrollment.find({ courseId: req.params.id })
            .populate('userId', 'name email avatar watchHistory')
            .sort({ enrolledAt: -1 });

        // Calculate progress for each student
        const studentsWithProgress = enrollments
            .filter(e => e.userId) // Filter out deleted users
            .map(enrollment => {
                const user = enrollment.userId;
                const courseVideos = course.videos ? course.videos.length : 0;
                const watchedVideos = user.watchHistory ? user.watchHistory.filter(h =>
                    h.courseId && h.courseId.toString() === req.params.id && h.completed
                ).length : 0;

                return {
                    ...enrollment.toObject(),
                    progress: courseVideos > 0 ? Math.round((watchedVideos / courseVideos) * 100) : 0,
                    watchedVideos,
                    totalVideos: courseVideos
                };
            });

        res.json(studentsWithProgress);
    } catch (error) {
        console.error('Error fetching course students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get earnings summary
router.get('/earnings', isInstructor, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const courses = await Course.find({ instructorId: req.user._id });

        const totalRevenue = courses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);

        // Ensure earnings object exists
        const userEarnings = user.earnings || { total: 0, pending: 0, withdrawn: 0 };

        const earnings = {
            total: userEarnings.total || totalRevenue,
            pending: userEarnings.pending || 0,
            withdrawn: userEarnings.withdrawn || 0,
            available: (userEarnings.total || totalRevenue) - (userEarnings.withdrawn || 0),
            courseBreakdown: courses.map(c => ({
                courseId: c._id,
                courseTitle: c.title,
                revenue: c.totalRevenue || 0,
                enrollments: c.enrollmentCount || 0
            }))
        };

        res.json(earnings);
    } catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get analytics for instructor's courses
router.get('/analytics', isInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });

        // Group enrollments by month
        const enrollmentsByMonth = {};
        enrollments.forEach(e => {
            if (e.enrolledAt) {
                try {
                    const date = new Date(e.enrolledAt);
                    if (!isNaN(date.getTime())) {
                        const month = date.toISOString().slice(0, 7);
                        enrollmentsByMonth[month] = (enrollmentsByMonth[month] || 0) + 1;
                    }
                } catch (err) {
                    console.error('Error parsing date:', err);
                }
            }
        });

        // Revenue by month
        const revenueByMonth = {};
        enrollments.forEach(e => {
            if (e.enrolledAt) {
                try {
                    const date = new Date(e.enrolledAt);
                    if (!isNaN(date.getTime())) {
                        const month = date.toISOString().slice(0, 7);
                        const course = courses.find(c => c._id.toString() === e.courseId.toString());
                        const price = course?.price || 0;
                        revenueByMonth[month] = (revenueByMonth[month] || 0) + price;
                    }
                } catch (err) {
                    console.error('Error parsing date:', err);
                }
            }
        });

        const analytics = {
            totalEnrollments: enrollments.length,
            enrollmentTrend: Object.entries(enrollmentsByMonth).map(([month, count]) => ({
                month,
                enrollments: count
            })),
            revenueTrend: Object.entries(revenueByMonth).map(([month, revenue]) => ({
                month,
                revenue
            })),
            topCourses: courses
                .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
                .slice(0, 5)
                .map(c => ({
                    title: c.title,
                    enrollments: c.enrollmentCount || 0,
                    revenue: c.totalRevenue || 0,
                    rating: c.rating || 0
                }))
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
