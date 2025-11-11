// routes/complaintRoutes.js (THE CORRECTED FILE CONTENT)

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
// NOTE: Path changed from '/' to '/complaints' to match app.use('/api', ...)
router.post('/complaints', async (req, res) => {
    // ... (Your existing POST logic remains the same) ...
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

// @route   GET /api/complaints
// @desc    Get all complaints, populate student and room info
// @access  Private (Admin)
// NOTE: Path changed from '/' to '/complaints'
router.get('/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate({
                path: 'student',
                select: 'name rollNumber' 
            })
            .populate({
                path: 'room',
                select: 'roomNumber block' 
            })
            .sort({ submissionDate: -1 });

        // Transform the result for the frontend table view
        const formattedComplaints = complaints
            .filter(c => c.student && c.room)
            .map(complaint => ({
                _id: complaint._id,
                studentName: complaint.student.name,
                roomNumber: complaint.room.roomNumber,
                complaintType: complaint.type,
                title: complaint.title,
                description: complaint.description,
                priority: complaint.priority,
                status: complaint.status,
                createdAt: complaint.submissionDate,
            }));

        res.json({ success: true, complaints: formattedComplaints });

    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, message: 'Server error fetching complaints.', error: error.message });
    }
});

// @route   PATCH /api/complaints/:id
// @desc    Update complaint status
// @access  Private (Admin)
// NOTE: Path changed from '/:id' to '/complaints/:id'
router.patch('/complaints/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Pending', 'In Progress', 'Resolved', 'Critical'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }

        res.json({ success: true, message: `Complaint status updated to ${status}`, complaint });

    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ success: false, message: 'Server error updating status.', error: error.message });
    }
});


// THIS MUST BE THE LAST LINE
module.exports = router;