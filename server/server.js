const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper MIME types for HLS streaming
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (filePath.endsWith('.ts')) {
            res.setHeader('Content-Type', 'video/mp2t');
        }
    }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-launcher', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip IPv6
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');
const certificateRoutes = require('./routes/certificates');
const announcementRoutes = require('./routes/announcements');
const adminRoutes = require('./routes/admin');

// New multi-role routes
const instructorRoutes = require('./routes/instructor');
const enrollmentRoutes = require('./routes/enrollment');
const superAdminRoutes = require('./routes/superadmin');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const discussionRoutes = require('./routes/discussions');
const instructorAdminRoutes = require('./routes/instructorAdmin');
const notesRoutes = require('./routes/notes');
const megaRoutes = require('./routes/mega');
const communityRoutes = require('./routes/community');
const liveRoutes = require('./routes/live');
const articleRoutes = require('./routes/articles');
const referralRoutes = require('./routes/referrals');
const uploadRoutes = require('./routes/upload');
const practiceRoutes = require('./routes/practice');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);

// New API Routes
app.use('/api/instructor', instructorRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/instructor-admin', instructorAdminRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/mega', megaRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/practice', practiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
