const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    purchasedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    avatar: {
        type: String,
        default: ''
    },
    watchHistory: [{
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        progress: {
            type: Number, // Time in seconds
            default: 0
        },
        completed: {
            type: Boolean,
            default: false
        },
        lastWatched: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
