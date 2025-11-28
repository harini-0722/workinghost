const express = require('express');
const router = express.Router();
// This path '../models/VisitorRequest' means "go up one folder, then into models"
const VisitorRequest = require('../models/VisitorRequest'); 

// 1. POST: Submit a new visitor request
router.post('/', async (req, res) => {
    try {
        const { studentId, visitorName, startDate, endDate, reason } = req.body;

        const newRequest = new VisitorRequest({
            studentId,
            visitorName,
            startDate,
            endDate,
            reason,
            status: 'Pending' // Default status
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

// 2. GET: Fetch visitor history for a specific student
router.get('/history/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        // Fetch requests matching the studentId, sorted by newest first (_id contains timestamp)
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

module.exports = router;