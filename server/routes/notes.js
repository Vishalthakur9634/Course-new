const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get all notes for a video (user-specific)
router.get('/video/:videoId', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const notes = await Note.find({
            userId: req.user.id,
            videoId: req.params.videoId
        }).sort({ timestamp: 1 });

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new note
router.post('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { videoId, courseId, content, timestamp, attachments } = req.body;

        const note = new Note({
            userId: req.user.id,
            videoId,
            courseId,
            content,
            timestamp: timestamp || 0,
            attachments: attachments || []
        });

        await note.save();
        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a note
router.put('/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const { content, timestamp, attachments } = req.body;

        if (content !== undefined) note.content = content;
        if (timestamp !== undefined) note.timestamp = timestamp;
        if (attachments !== undefined) note.attachments = attachments;

        await note.save();
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all notes for a course (user-specific)
router.get('/course/:courseId', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const notes = await Note.find({
            userId: req.user.id,
            courseId: req.params.courseId
        })
            .populate('videoId', 'title')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        console.error('Error fetching course notes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
