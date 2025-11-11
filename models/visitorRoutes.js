const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest'); // Adjust path as needed

// 1. POST /api/visitor-request - Save new request
router.post('/', async (req, res) => {
    try {
        const newRequest = new VisitorRequest(req.body);
        await newRequest.save();
        
        // This is what the frontend expects back on success
        res.status(201).json({ 
            success: true, 
            message: 'Visitor request saved successfully', 
            request: newRequest 
        });
    } catch (error) {
        console.error('Error saving visitor request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during submission.' 
        });
    }
});

// 2. GET /api/visitor-request/history/:studentId - Fetch history
router.get('/history/:studentId', async (req, res) => {
    try {
        const requests = await VisitorRequest.find({ 
            studentId: req.params.studentId 
        }).sort({ submissionDate: -1 });

        // This is what the frontend expects back for history population
        res.status(200).json({
            success: true,
            requests: requests
        });
    } catch (error) {
        console.error('Error fetching visitor requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching history.'
        });
    }
});

module.exports = router;