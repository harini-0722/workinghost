// models/LostFound.js
const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    reporterStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Links to the Student who reported the item as lost
        required: true,
    },
    reporterName: {
        type: String,
        required: true,
    },
    itemType: {
        type: String,
        required: true,
        default: 'Lost', // We assume students only file 'Lost' reports on the portal
        enum: ['Lost', 'Found'], 
    },
    itemName: {
        type: String,
        required: true,
    },
    lastSeenLocation: {
        type: String,
        required: false,
    },
    submissionDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'Pending', // Pending, Retrieved, Closed
        enum: ['Pending', 'Retrieved', 'Closed'],
    }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);