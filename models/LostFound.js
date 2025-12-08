const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false // Optional, because an admin might post a found item
    },
    itemName: {
        type: String,
        required: true
    },
    location: { 
        type: String, // Maps to 'lastSeenLocation' or 'foundLocation'
        required: true 
    },
    type: {
        type: String,
        enum: ['Lost', 'Found'], // Distinguishes between items students lost and items staff found
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Retrieved', 'Closed'],
        default: 'Pending'
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);