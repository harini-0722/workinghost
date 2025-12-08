const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST: Submit new feedback
router.post('/', async (req, res) => {
    try {
        const { studentId, category, description, isAnonymous } = req.body;

        const newFeedback = new Feedback({
            studentId,
            category,
            description,
            isAnonymous
        });

        await newFeedback.save();

        res.status(201).json({ 
            success: true, 
            message: 'Feedback submitted successfully! We appreciate your input.' 
        });
    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server error saving feedback.' });
    }
});

module.exports = router;