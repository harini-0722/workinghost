const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest'); 
const Student = require('../models/Student'); 
const Room = require('../models/Room'); 

// Helper function to format ISO date string to a simple time string (if needed, though standard ISO is better for API)
// const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : null;

// 1. POST: Submit a new visitor request (for Student Dashboard)
router.post('/', async (req, res) => {
    try {
        const { studentId, visitorName, startDate, endDate, reason } = req.body;

        const newRequest = new VisitorRequest({
            studentId,
            visitorName,
            startDate,
            endDate,
            reason,
            status: 'Pending'
        });

        await newRequest.save();

        res.status(201).json({ 
            success: true, 
            message: 'Visitor request saved successfully', 
            request: newRequest 
        });
    } catch (error) {
        console.error("Error creating visitor request:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET: Fetch ALL visitor requests (for Admin Dashboard)
router.get('/', async (req, res) => {
    try {
        const requests = await VisitorRequest.find()
                                           .populate({
                                                path: 'studentId',
                                                select: 'name room', 
                                                populate: {
                                                    path: 'room',
                                                    select: 'roomNumber' 
                                                }
                                           })
                                           .sort({ submissionDate: -1 }); 

        const formattedLogs = requests.map(req => ({
            id: req._id,
            visitorName: req.visitorName,
            studentName: req.studentId?.name || 'Unknown Student',
            roomNumber: req.studentId?.room?.roomNumber || 'N/A',
            date: new Date(req.submissionDate).toISOString().split('T')[0], // Submission date
            startDate: req.startDate, // Requested Start Date
            endDate: req.endDate,     // Requested End Date
            reason: req.reason,
            timeIn: req.timeIn ? new Date(req.timeIn).toISOString() : null,
            timeOut: req.timeOut ? new Date(req.timeOut).toISOString() : null,
            status: req.status
        }));
        
        res.status(200).json({ 
            success: true, 
            logs: formattedLogs 
        });
    } catch (error) {
        console.error("Error fetching all visitor requests:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 3. GET: Fetch visitor history for a specific student (for Student Page)
router.get('/history/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const requests = await VisitorRequest.find({ studentId: studentId })
                                             .sort({ _id: -1 });
        
        res.status(200).json({ 
            success: true, 
            visitorRequests: requests 
        });
    } catch (error) {
        console.error("Error fetching visitor history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. PATCH: Update Visitor Request Status (Approve/Reject)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }
        
        // Reset times if status changes from approved/pending to rejected
        const updateFields = { status: status };
        if (status === 'Rejected') {
            updateFields.timeIn = null;
            updateFields.timeOut = null;
        }


        const updatedRequest = await VisitorRequest.findByIdAndUpdate(
            id,
            updateFields,
            { new: true } 
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Visitor request not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `Request status updated to ${status}.`,
            request: updatedRequest 
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. PATCH: Record Check-in Time
router.patch('/:id/checkin', async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date(); 

        const updatedRequest = await VisitorRequest.findByIdAndUpdate(
            id,
            { 
                timeIn: now, 
                status: 'Approved' // Ensure status is approved before check-in
            },
            { new: true } 
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Visitor request not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Visitor checked in successfully.',
            request: updatedRequest 
        });
    } catch (error) {
        console.error("Error recording check-in:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. PATCH: Record Check-out Time
router.patch('/:id/checkout', async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date(); 

        const updatedRequest = await VisitorRequest.findByIdAndUpdate(
            id,
            { 
                timeOut: now,
            },
            { new: true } 
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Visitor request not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Visitor checked out successfully.',
            request: updatedRequest 
        });
    } catch (error) {
        console.error("Error recording check-out:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;