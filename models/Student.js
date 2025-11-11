// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Use Schema for consistency

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
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
        type: Schema.Types.ObjectId,
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
    profileImageUrl: {
        type: String // Path to profile image, e.g., /uploads/student-123.jpg
    },
    // This stores a snapshot of assets assigned to the student
    assets: [{
        name: String,
        quantity: Number
    }],

    // --- THIS IS THE FIX ---
    // The complaints array must be INSIDE the schema definition
    complaints: [{
        type: Schema.Types.ObjectId,
        ref: 'Complaint'
    }]
    
}, { timestamps: true });


module.exports = mongoose.model('Student', studentSchema);