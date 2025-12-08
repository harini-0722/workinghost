// routes/reportFeedbackRoutes.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const LostFound = require('../models/LostFound');
const Student = require('../models/Student'); // To fetch student name/ID

// ==========================================================
// --- FEEDBACK ROUTES ---
// ==========================================================

// POST: Submit new feedback
router.post('/feedback', async (req, res) => {
    try {
        const { studentId, category, description, isAnonymous } = req.body;

        if (!studentId || !category || !description) {
            return res.status(400).json({ success: false, message: 'Student ID, Category, and Description are required.' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // Determine the name based on the anonymous checkbox
        const studentName = isAnonymous ? 'Anonymous' : student.name;

        const newFeedback = new Feedback({
            student: studentId,
            studentName: studentName,
            category,
            description,
            isAnonymous: !!isAnonymous,
        });

        await newFeedback.save();
        res.status(201).json({ success: true, message: '✅ Feedback submitted successfully!', feedback: newFeedback });

    } catch (error) {
        console.error("❌ Error submitting feedback:", error);
        res.status(500).json({ success: false, message: 'Server error while submitting feedback.' });
    }
});

// GET: Fetch student's own feedback history
router.get('/feedback/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const feedbackHistory = await Feedback.find({ student: studentId })
            .sort({ submissionDate: -1 })
            .limit(20);

        res.json({ success: true, feedback: feedbackHistory });

    } catch (error) {
        console.error("❌ Error fetching feedback history:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching feedback history.' });
    }
});


// ==========================================================
// --- LOST & FOUND ROUTES (Student submits 'Lost' report) ---
// ==========================================================

// POST: Report a lost item
router.post('/lost-found/report-lost', async (req, res) => {
    try {
        const { studentId, itemName, lastSeenLocation } = req.body;

        if (!studentId || !itemName) {
            return res.status(400).json({ success: false, message: 'Student ID and Item Name are required.' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const newLostReport = new LostFound({
            reporterStudent: studentId,
            reporterName: student.name,
            itemType: 'Lost', // Fixed type for student submission
            itemName,
            lastSeenLocation: lastSeenLocation || 'N/A',
            status: 'Pending',
        });

        await newLostReport.save();
        res.status(201).json({ success: true, message: '✅ Lost item reported successfully!', report: newLostReport });

    } catch (error) {
        console.error("❌ Error reporting lost item:", error);
        res.status(500).json({ success: false, message: 'Server error while reporting lost item.' });
    }
});

// GET: Fetch all found items (for student to check against their lost item)
router.get('/lost-found/found-items', async (req, res) => {
    try {
        // Only show items reported as 'Found' by administration/staff
        const foundItems = await LostFound.find({ itemType: 'Found', status: { $in: ['Pending', 'Retrieved'] } })
            .sort({ submissionDate: -1 })
            .limit(30);

        res.json({ success: true, foundItems });

    } catch (error) {
        console.error("❌ Error fetching found items:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching found items.' });
    }
});

module.exports = router;