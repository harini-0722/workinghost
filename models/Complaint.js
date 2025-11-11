// models/Complaint.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    // --- Links ---
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    block: {
        type: Schema.Types.ObjectId,
        ref: 'Block'
    },
    
    // --- Complaint Details (from form) ---
    type: {
        type: String,
        required: true,
        enum: ['Maintenance', 'Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Noise', 'Security', 'Other']
    },
    location: {
        type: String,
        required: true
    },
    date: { // The date the issue occurred
        type: Date,
        required: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical']
    },
    description: {
        type: String,
        required: true
    },
    
    // --- Admin Tracking ---
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'In Progress', 'Resolved', 'Critical']
    },
    submissionDate: { // The date the form was submitted
        type: Date,
        default: Date.now
    },
    
    // Legacy title (from your original object)
    title: {
        type: String
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);