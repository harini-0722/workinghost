// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Links to the Student who submitted the feedback
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Mess & Food Quality', 'Staff & Warden Behavior', 'Hostel Facilities', 'Events & Activities', 'Other Suggestions'],
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    submissionDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Feedback', feedbackSchema);