const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    student: { // Changed from studentId to student to match route
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    anonymous: { // Changed from isAnonymous to anonymous
        type: Boolean,
        default: false
    },
    createdAt: { // Changed from date to createdAt
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);