const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest'); 
// ... (Your other imports)

// The POST handler - This is for POST /api/visitor-request
router.post('/', async (req, res) => { 
    try {
        const newRequest = new VisitorRequest(req.body);
        await newRequest.save();
        
        // Ensure you are returning valid JSON!
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

// The GET handler - This is for GET /api/visitor-request/history/:studentId
router.get('/history/:studentId', async (req, res) => { 
    try {
        // Fetch all visitor requests for the given studentId, sorted by submissionDate desc
        const visitorRequests = await VisitorRequest.find({ studentId: req.params.studentId })
                                                .sort({ submissionDate: -1 });
        
        res.status(200).json({
            success: true,
            visitorRequests: visitorRequests
        });
    } catch (error) {
        console.error("Error fetching visitor history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;