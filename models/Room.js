// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    block: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    imageUrl: {
        type: String // Path to the room image
    },
    // --- NEW FIELD ---
    // This stores a snapshot of assets assigned to the room
    assets: [{
        name: String,
        quantity: Number
    }]
}, { timestamps: true });

// Make sure roomNumber is unique *within* its block
roomSchema.index({ roomNumber: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);