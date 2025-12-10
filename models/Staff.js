const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    // Login Details - SET TO OPTIONAL
    username: {
        type: String,
        // CHANGED: Set to false to allow empty username
        required: false, 
        // NOTE: unique: true can still cause issues if multiple entries try to save 
        // with a completely empty (default: '') username. You may need custom validation
        // if you want to allow blank but prevent duplicates of non-blank usernames.
        unique: true,
        default: '', // Added default empty string
    },
    password: {
        type: String,
        // CHANGED: Set to false to allow empty password
        required: false, 
        default: '', // Added default empty string
    },
    
    // Personal Details - SET TO OPTIONAL
    name: {
        type: String,
        // CHANGED: Set to false to allow empty name
        required: false,
        default: '', // Added default empty string
    },
    email: {
        type: String,
        required: false, // Already optional but explicit
        default: '', // Added default empty string
    },
    phone: {
        type: String,
        required: false, // Already optional but explicit
        default: '', // Added default empty string
    },
    
    // Assignment Details - SET TO OPTIONAL
    role: { 
        type: String,
        // CHANGED: Set to false to allow empty role
        required: false,
        default: '', // Added default empty string
    },
    place: { 
        type: String,
        // CHANGED: Set to false to allow empty place
        required: false,
        default: '', // Added default empty string
    },
    
    // Date Details - SET TO OPTIONAL with a default value
    joiningDate: {
        type: Date,
        default: Date.now,
        // CHANGED: Set to false to allow omission (will use default if omitted)
        required: false 
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