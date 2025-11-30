const express = require('express');
const Review = require('../models/Review');
const Course = require('../models/Course');
const router = express.Router();

// Get Reviews for a Course
router.get('/:courseId', async (req, res) => {
    try {
        const reviews = await Review.find({ course: req.params.courseId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Add a Review
router.post('/', async (req, res) => {
    try {
        const { userId, courseId, rating, comment } = req.body;

        const review = new Review({
            user: userId,
            course: courseId,
            rating,
            comment
        });

        await review.save();

        // Populate user details for immediate display
        await review.populate('user', 'name avatar');

        res.status(201).json(review);
    } catch (error) {
        // Handle duplicate review error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this course' });
        }
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
});

module.exports = router;
