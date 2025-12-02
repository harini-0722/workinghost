const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

// 1. POST: Submit a new Leave Request (Student)
router.post('/', async (req, res) => {
    try {
        const { studentId, studentName, roomNumber, startDate, endDate, reason } = req.body;

        // Note: Ensure your frontend sends studentName and roomNumber, or fetch them here using studentId
        if (!studentId || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newLeave = new LeaveRequest({
            studentId,
            studentName, // Saved to display easily in admin
            roomNumber,  // Saved to display easily in admin
            startDate,
            endDate,
            reason,
            status: 'Pending',
            appliedDate: new Date()
        });

        await newLeave.save();

        res.status(201).json({ 
            success: true, 
            message: 'Leave request submitted successfully', 
            leave: newLeave 
        });
    } catch (error) {
        console.error("Error creating leave request:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET: Fetch Leave History for a specific student
router.get('/history/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const leaves = await LeaveRequest.find({ studentId: studentId }).sort({ appliedDate: -1 });
        res.status(200).json({ success: true, leaves: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- NEW ADMIN ROUTES ---

// 3. GET: Fetch ALL Leave Requests (For Admin Dashboard)
router.get('/', async (req, res) => {
    try {
        // Fetch all leaves, sorted by newest first
        const leaves = await LeaveRequest.find().sort({ appliedDate: -1 });
        res.status(200).json({ success: true, leaves: leaves });
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. PATCH: Update Leave Status (Approve/Reject)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // Expect 'Approved' or 'Rejected'
        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );
        
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found" });
        }

        res.status(200).json({ success: true, message: `Leave marked as ${status}`, leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;