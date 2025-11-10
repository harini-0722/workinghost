// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // --- NEW FIELD (from your form) ---
    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    course: String,
    department: String,
    year: String,
    email: String,
    phone: String,
    joiningDate: Date,
    feeStatus: {
        type: String,
        default: 'Pending'
    },
    paymentMethod: String,
    // --- NEW FIELD ---
    profileImageUrl: {
        type: String // Path to profile image, e.g., /uploads/student-123.jpg
    },
    // --- NEW FIELD ---
    // This stores a snapshot of assets assigned to the student
    assets: [{
        name: String,
        quantity: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);