const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Get Announcements for Course
router.get('/course/:courseId', async (req, res) => {
    try {
        const announcements = await Announcement.find({ courseId: req.params.courseId })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching announcements', error: error.message });
    }
});

// Create Announcement (Admin)
router.post('/', async (req, res) => {
    try {
        const { courseId, title, message, priority, createdBy } = req.body;
        const announcement = new Announcement({
            courseId,
            title,
            message,
            priority: priority || 'medium',
            createdBy
        });
        await announcement.save();
        await announcement.populate('createdBy', 'name');
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: 'Error creating announcement', error: error.message });
    }
});

// Delete Announcement (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting announcement', error: error.message });
    }
});

module.exports = router;
