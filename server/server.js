const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-selling-app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Course Selling API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
