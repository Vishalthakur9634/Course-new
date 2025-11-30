const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const Video = require('../models/Video');
const { processVideo } = require('../utils/videoProcessor');

const router = express.Router();

// Multer setup for video upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/temp';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Create Course
router.post('/', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error });
    }
});

// Get All Courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('videos');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Get Single Course
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('videos');
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
});

// Upload Video to Course
router.post('/:courseId/videos', upload.single('video'), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;
        const videoFile = req.file;

        if (!videoFile) return res.status(400).json({ message: 'No video file uploaded' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const videoId = new mongoose.Types.ObjectId();
        const outputDir = path.join('uploads', 'courses', courseId, videoId.toString());

        // Process video (HLS)
        const masterPlaylistPath = await processVideo(videoFile.path, outputDir, videoId);

        // Construct public URL (relative path)
        const videoUrl = `/uploads/courses/${courseId}/${videoId}/master.m3u8`;

        const video = new Video({
            _id: videoId,
            title,
            description,
            videoUrl,
            courseId,
            qualities: ['1080p', '720p', '480p', '360p', '144p']
        });

        await video.save();
        course.videos.push(video._id);
        await course.save();

        // Cleanup temp file
        fs.unlinkSync(videoFile.path);

        res.status(201).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading video', error });
    }
});

module.exports = router;
