const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        points: { type: Number, default: 1 }
    }],
    passingScore: {
        type: Number,
        default: 70 // Percentage
    },
    durationLimit: {
        type: Number, // in minutes, 0 for unlimited
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
