const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const { authenticate } = require('../middleware/rbac');

// Middleware to check if user is instructor or admin
const { requireInstructor } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticate);

// Dashboard stats for instructor
router.get('/dashboard', requireInstructor, async (req, res) => {
    // Initialize default response structure
    let responseData = {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        totalVideos: 0,
        courses: [],
        recentEnrollments: []
    };

    try {
        const instructorId = req.user._id;
        console.log('Fetching dashboard for instructor:', instructorId);

        // 1. Fetch Courses
        let courses = [];
        try {
            courses = await Course.find({ instructorId }).populate('videos').lean();
            responseData.totalCourses = courses.length;

            responseData.courses = courses.map(c => ({
                _id: c._id,
                title: c.title,
                enrollmentCount: c.enrollmentCount || 0,
                revenue: c.totalRevenue || 0,
                rating: c.rating || 0,
                videoCount: c.videos ? c.videos.length : 0
            }));

            // Aggregates from courses
            responseData.totalRevenue = courses.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
            responseData.totalVideos = courses.reduce((sum, c) => sum + (c.videos ? c.videos.length : 0), 0);
        } catch (err) {
            console.error('Error processing courses:', err);
        }

        // 2. Fetch Enrollments
        if (courses.length > 0) {
            try {
                const courseIds = courses.map(c => c._id);
                const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
                    .populate('studentId', 'name email avatar')
                    .populate('courseId', 'title')
                    .sort({ enrolledAt: -1 })
                    .lean();

                // Valid enrollments (where student exists)
                const validEnrollments = enrollments.filter(e => e && e.studentId);

                // Count unique students
                const studentIds = validEnrollments.map(e => e.studentId._id.toString());
                responseData.totalStudents = new Set(studentIds).size;

                // Recent enrollments list
                responseData.recentEnrollments = validEnrollments.slice(0, 10).map(e => ({
                    _id: e._id,
                    enrolledAt: e.enrolledAt,
                    studentId: e.studentId,
                    userId: e.studentId // fallback alias
                }));
            } catch (err) {
                console.error('Error processing enrollments:', err);
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('CRITICAL DASHBOARD ERROR:', error);
        // Even in critical error, ensure we return JSON, not crashing the server
        res.status(200).json(responseData);
    }
});

// Get all courses by instructor
router.get('/courses', requireInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id })
            .populate('videos')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch reviews for each course separately since they aren't in the Course model
        const Review = require('../models/Review');
        const coursesWithReviews = await Promise.all(courses.map(async (course) => {
            const reviews = await Review.find({ course: course._id }).populate('user', 'name avatar');
            return { ...course, reviews };
        }));

        res.json(coursesWithReviews);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update instructor admin settings for a course
router.put('/courses/:id/settings', requireInstructor, async (req, res) => {
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



// Get students for a specific course
router.get('/courses/:id/students', requireInstructor, async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            instructorId: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        const enrollments = await Enrollment.find({ courseId: req.params.id })
            .populate('studentId', 'name email avatar watchHistory')
            .sort({ enrolledAt: -1 });

        // Calculate progress for each student
        const studentsWithProgress = enrollments
            .filter(e => e.studentId) // Filter out deleted users
            .map(enrollment => {
                const user = enrollment.studentId;
                const courseVideos = course.videos ? course.videos.length : 0;
                const watchedVideos = user.watchHistory ? user.watchHistory.filter(h =>
                    h.courseId && h.courseId.toString() === req.params.id && h.completed
                ).length : 0;

                return {
                    ...enrollment.toObject(),
                    progress: courseVideos > 0 ? Math.round((watchedVideos / courseVideos) * 100) : 0,
                    watchedVideos,
                    totalVideos: courseVideos,
                    studentId: user, // Ensure frontend gets the populated user object
                    userId: user // Alias for frontend
                };
            });

        res.json(studentsWithProgress);
    } catch (error) {
        console.error('Error fetching course students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get earnings summary
router.get('/earnings', requireInstructor, async (req, res) => {
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
router.get('/analytics', requireInstructor, async (req, res) => {
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

// Get all reviews for instructor's courses
router.get('/reviews', requireInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const courseIds = courses.map(c => c._id);

        const Review = require('../models/Review');
        const reviews = await Review.find({ course: { $in: courseIds } })
            .populate('user', 'name email avatar')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching instructor reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all students enrolled in instructor's courses
router.get('/students', requireInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user._id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('studentId', 'name email avatar')
            .populate('courseId', 'title thumbnail category')
            .sort({ enrolledAt: -1 })
            .lean();

        // Filter out null users (deleted accounts)
        const validEnrollments = enrollments.filter(e => e.studentId);

        // Map to include alias
        const robustEnrollments = validEnrollments.map(e => ({
            ...e,
            userId: e.studentId // Alias for frontend compatibility
        }));

        res.json(robustEnrollments);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all certificates issued for instructor's courses
router.get('/certificates', requireInstructor, async (req, res) => {
    try {
        const Certificate = require('../models/Certificate');
        const certificates = await Certificate.find({ instructorId: req.user._id })
            .populate('userId', 'name email avatar')
            .populate('courseId', 'title')
            .sort({ issueDate: -1 });

        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
