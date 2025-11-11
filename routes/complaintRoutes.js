// routes/complaintRoutes.js

const express = require('express');
const router = express.Router();

// Import all necessary models
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Room = require('../models/Room');
// const Block = require('../models/Block'); 

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (Student)
router.post('/complaints', async (req, res) => {
    try {
        const { studentId, type, location, date, priority, description, title } = req.body;

        // 1. Find the student who is submitting
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // 2. Find the student's room (to link the complaint to it)
        const room = await Room.findById(student.room);
        if (!room) {
             return res.status(404).json({ success: false, message: 'Student\'s room not found.' });
        }

        // 3. Create the new complaint
        const newComplaint = new Complaint({
            student: studentId,
            room: student.room,
            block: room.block, // Get the block from the room
            type,
            location,
            date,
            priority,
            description,
            title
        });

        // 4. Save the complaint
        await newComplaint.save();

        // 5. Link the complaint back to the student and room
        student.complaints.push(newComplaint._id);
        room.complaints.push(newComplaint._id);
        
        // 6. Save the updated student and room
        await student.save();
        await room.save();

        // 7. Send success response
        res.status(201).json({
            success: true,
            message: 'Complaint filed successfully!',
            complaint: newComplaint
        });

    } catch (error) {
        console.error('Error filing complaint:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
});

// THIS MUST BE THE LAST LINE
module.exports = router;