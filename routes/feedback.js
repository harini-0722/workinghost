const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Ensure you have this model

// POST: Submit new feedback
router.post('/', async (req, res) => {
    try {
        const { studentId, category, description, anonymous } = req.body;
        const newFeedback = new Feedback({
            student: studentId,
            category,
            description,
            anonymous: anonymous || false
        });
        await newFeedback.save();
        res.status(201).json({ success: true, message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving feedback.' });
    }
});

// GET: Fetch feedback for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ student: req.params.studentId })
            .sort({ createdAt: -1 });
        res.json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching feedback.' });
    }
});

module.exports = router;