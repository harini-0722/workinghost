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

router.get('/', async (req, res) => {
    try {
        // Fetch all feedback, populate student details, and sort by newest first
        const feedback = await Feedback.find()
            .populate('student', 'name rollNumber') // If your model supports population
            .sort({ createdAt: -1 });
        
        res.json({ success: true, feedback });
    } catch (err) {
        console.error("❌ Admin Feedback Fetch Error:", err);
        res.status(500).json({ success: false, message: 'Server error fetching feedback registry.' });
    }
});
module.exports = router;