// routes/visitorRoutes.js

const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest');
const Student = require('../models/Student');
const Room = require('../models/Room');

// @route   POST /api/visitor-request
// @desc    Submit a new visitor request (No changes needed for this route)
router.post('/', async (req, res) => {
    // ... (Your existing POST route logic remains the same) ...
});

// @route   GET /api/visitor-request/history/:studentId
// @desc    Get all visitor requests for a specific student
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const requests = await VisitorRequest.find({ student: studentId })
            .sort({ startDate: -1 });

        res.json({
            success: true,
            requests: requests
        });

    } catch (error) {
        console.error('❌ Error fetching visitor requests:', error);
        res.status(500).json({ success: false, message: 'Server error fetching history.', error: error.message });
    }
});


// @route   GET /api/visitor-request
// @desc    Get all visitor requests for Admin Panel (NEW/FIXED ROUTE)
// @access  Private (Admin)
router.get('/', async (req, res) => {
    try {
        const requests = await VisitorRequest.find()
            .populate({
                path: 'student',
                select: 'name rollNumber' 
            })
            .populate({
                path: 'room',
                select: 'roomNumber block' 
            })
            .sort({ submissionDate: -1 }); // Newest requests first

        // Mapping requests to show room number and student name
        const formattedRequests = requests
            .filter(r => r.student) // Ensure student data is present
            .map(request => ({
                _id: request._id,
                studentName: request.student.name,
                rollNumber: request.student.rollNumber,
                roomNumber: request.room ? request.room.roomNumber : 'N/A', // Null check for room
                visitorName: request.visitorName,
                startDate: request.startDate,
                endDate: request.endDate,
                reason: request.reason,
                status: request.status,
                submissionDate: request.submissionDate,
            }));

        res.json({ success: true, requests: formattedRequests });

    } catch (error) {
        console.error('❌ Error fetching all visitor requests for admin:', error);
        res.status(500).json({ success: false, message: 'Server error fetching all requests.', error: error.message });
    }
});

module.exports = router;