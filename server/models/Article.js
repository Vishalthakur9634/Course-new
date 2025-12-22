const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        default: 'general'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Pre-save middleware to generate slug
articleSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        // Add random suffix to ensure uniqueness
        this.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }
    next();
});

module.exports = mongoose.model('Article', articleSchema);