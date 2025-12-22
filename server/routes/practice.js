const express = require('express');
const router = express.Router();
const Practice = require('../models/Practice');
const Course = require('../models/Course'); // Ensure Course model is imported for validation if needed
const { authenticate, requireInstructor } = require('../middleware/rbac');

// Get all practice problems for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
        const problems = await Practice.find({ courseId: req.params.courseId })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching practice problems', error: error.message });
    }
});

// Create a new practice problem (Instructor only)
router.post('/', authenticate, requireInstructor, async (req, res) => {
    try {
        const { courseId, title, description, attachments } = req.body;

        const problem = new Practice({
            courseId,
            title,
            description,
            attachments,
            createdBy: req.user._id
        });

        await problem.save();
        res.status(201).json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating practice problem', error: error.message });
    }
});

// Delete a practice problem (Instructor only)
router.delete('/:id', authenticate, requireInstructor, async (req, res) => {
    try {
        const problem = await Practice.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Verify ownership (optional but recommended)
        if (problem.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Practice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting problem', error: error.message });
    }
});

module.exports = router;
