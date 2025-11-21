// models/Room.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomNumber: {
        type: String,
        required: true
    },
    floor: {
        type: String,


        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    imageUrl: {
        type: String // Path to room image, e.g., /uploads/room-123.jpg
    },
    
    // --- Links to other models ---
    block: {
        type: Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,

        ref: 'Student'
    }],

    // --- Asset & Complaint Tracking ---
    assets: [{
        name: String,
        quantity: Number
    }],
    
    // --- THIS IS THE NEW FIELD ---
    // This array will store all complaints related to this room
    complaints: [{
        type: Schema.Types.ObjectId,
        ref: 'Complaint'
    }]
}, { 
    timestamps: true,
    // This ensures a room number is unique *within the same block*
    // but allows "101" to exist in Block A and Block B
    indexes: [{ unique: true, fields: ['roomNumber', 'block'] }]
});

module.exports = mongoose.model('Room', roomSchema);