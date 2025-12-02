const mongoose = require('mongoose');

const visitorRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    visitorName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        // UPDATED: Added 'Checked In' and 'Checked Out' to the allowed values
        enum: ['Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out'],
        default: 'Pending'
    },
    // NEW FIELD: To track when they actually arrive
    checkInTime: {
        type: Date
    },
    // NEW FIELD: To track when they actually leave
    checkOutTime: {
        type: Date
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VisitorRequest', visitorRequestSchema);