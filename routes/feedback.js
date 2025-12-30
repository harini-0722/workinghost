const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST: Submit new feedback
router.post('/', async (req, res) => {
    try {
        const { studentId, category, description, anonymous } = req.body;
        
        // Log the incoming data to debug
        console.log("Incoming Feedback:", req.body);

        const newFeedback = new Feedback({
            student: studentId, // Maps studentId from frontend to student in Model
            category,
            description,
            anonymous: anonymous || false
        });

        await newFeedback.save();
        res.status(201).json({ success: true, message: 'Feedback submitted successfully!' });
    } catch (error) {
        console.error("❌ Feedback Save Error:", error);
        res.status(500).json({ success: false, message: 'Error saving feedback.', error: error.message });
    }
});
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // FIX: Change 'studentId' to 'student' to match how you saved it in the POST route
        const feedback = await Feedback.find({ student: studentId }).sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            feedback 
        });
    } catch (err) {
        console.error("Error fetching student feedback:", err);
        res.status(500).json({ success: false, message: 'Server error fetching history.' });
    }
});

module.exports = router;