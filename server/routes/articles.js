const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authenticate, requireInstructor } = require('../middleware/rbac');

// Get all published articles (with optional filtering)
router.get('/', async (req, res) => {
    try {
        const query = { isPublished: true };
        if (req.query.category) query.category = req.query.category;
        if (req.query.authorId) query.authorId = req.query.authorId; // [NEW] Filter by author

        const articles = await Article.find(query)
            .populate('authorId', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error: error.message });
    }
});

// Get single article by slug
router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
            .populate('authorId', 'name avatar bio'); // Assume bio exists or ignore

        if (!article) return res.status(404).json({ message: 'Article not found' });

        // Increment views
        article.views += 1;
        await article.save();

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching article', error: error.message });
    }
});

// Create article (Instructor only)
router.post('/', authenticate, requireInstructor, async (req, res) => {
    try {
        const article = new Article({
            ...req.body,
            authorId: req.user._id
        });
        await article.save();
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error creating article', error: error.message });
    }
});

module.exports = router;
