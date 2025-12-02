const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

// 1. POST: Submit a new Leave Request
router.post('/', async (req, res) => {
    try {
        const { studentId, startDate, endDate, reason } = req.body;

        if (!studentId || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newLeave = new LeaveRequest({
            studentId,
            startDate,
            endDate,
            reason,
            status: 'Pending'
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
        const leaves = await LeaveRequest.find({ studentId: studentId })
                                         .sort({ appliedDate: -1 }); // Newest first
        
        res.status(200).json({ 
            success: true, 
            leaves: leaves 
        });
    } catch (error) {
        console.error("Error fetching leave history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;