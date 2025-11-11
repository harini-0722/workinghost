const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest'); 
// ... (Your other imports)

// The POST handler should match the relative path
router.post('/', async (req, res) => { // This is for POST /api/visitor-request
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
        // ... error handling
    }
});

// Also check your GET route for history
router.get('/history/:studentId', async (req, res) => { // This is for GET /api/visitor-request/history/:studentId
    // ... logic
});

module.exports = router;