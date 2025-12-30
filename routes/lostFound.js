const express = require('express');
const router = express.Router();
const LostFound = require('../models/LostFound');

// POST: Student reports a LOST item
router.post('/report-lost', async (req, res) => {
    try {
        const { studentId, itemName, lastSeenLocation } = req.body;

        const newItem = new LostFound({
            studentId,
            itemName,
            location: lastSeenLocation,
            type: 'Lost', // Mark as Lost
            status: 'Pending'
        });

        await newItem.save();

        res.status(201).json({ 
            success: true, 
            message: 'Lost item report filed. Admin has been notified.' 
        });
    } catch (error) {
        console.error('Report Lost Error:', error);
        res.status(500).json({ success: false, message: 'Server error filing report.' });
    }
});

// GET: Fetch items that have been FOUND (to display in the table)
router.get('/found-items', async (req, res) => {
    try {
        // We only show items where type is 'Found' so students can see what has been recovered
        // Sort by newest first
        const foundItems = await LostFound.find({ type: 'Found' })
            .sort({ submissionDate: -1 });

        res.status(200).json({ 
            success: true, 
            foundItems 
        });
    } catch (error) {
        console.error('Fetch Found Items Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching items.' });
    }
});

// BONUS POST: (Optional) If you want to test adding a "Found" item to see it in the table
// NEW: Fetch ALL items (for Admin View)
router.get('/all-items', async (req, res) => {
    try {
        // Fetch all items, populate student details if available
        const items = await LostFound.find()
            .populate('studentId', 'name rollNumber')
            .sort({ submissionDate: -1 });

        res.status(200).json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching all items.' });
    }
});

// NEW: Admin marks an item as "Retrieved" or "Closed"
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const item = await LostFound.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, message: `Item marked as ${status}`, item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed.' });
    }
});

// NEW: Admin adds a FOUND item manually
router.post('/add-found', async (req, res) => {
    try {
        const { itemName, location } = req.body;
        const newItem = new LostFound({
            itemName,
            location,
            type: 'Found',
            status: 'Pending'
        });
        await newItem.save();
        res.status(201).json({ success: true, message: 'Found item recorded!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to record item.' });
    }
});

module.exports = router;
