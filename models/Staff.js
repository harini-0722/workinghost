const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    // Login Details
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Personal Details
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    // Assignment Details
    role: { 
        type: String,
        required: true,
    },
    place: { 
        type: String,
        required: true,
    },
    // ✅ FIX: Added joiningDate to Schema
    joiningDate: {
        type: Date,
        default: Date.now,
        required: true 
    },
    // Photo URL
    profileImageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150/A5B4FC/374151?text=Staff'
    },
    // Status
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;