const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff'); // Assuming Staff model is one directory up (../models/Staff)
const fs = require('fs').promises; // For image file operations
const path = require('path');

// Helper function to remove the 'uploads' part when checking the image file system path
const getFilePath = (url) => {
    return path.join(__dirname, '..', 'public', url);
};

// --- GET /api/staff ---
// Retrieve all staff members
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find({}).sort({ name: 'asc' });
        res.json({ success: true, staff });
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// --- POST /api/staff ---
// Add a new staff member
router.post('/', async (req, res) => {
    try {
        const { name, username, password, role, place, phone, email, imageDataURL, status } = req.body;

        if (!name || !username || !password || !role || !place) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const existingStaff = await Staff.findOne({ username: username });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }

        let imageUrl = '';
        if (imageDataURL) {
            // Save Base64 image
            const base64Data = imageDataURL.replace(/^data:image\/\w+;base64,/, "");
            const mimeType = imageDataURL.substring("data:".length, imageDataURL.indexOf(";base64"));
            const extension = mimeType.split('/')[1] || 'png';
            const filename = `staff-${Date.now()}.${extension}`;
            const filepath = path.join(__dirname, '..', 'public', 'uploads', filename);

            await fs.writeFile(filepath, base64Data, 'base64');
            imageUrl = `/uploads/${filename}`;
        }
        
        const newStaff = new Staff({
            name, username, password, role, place, phone, email,
            status: status || 'Active',
            profileImageUrl: imageUrl,
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "✅ Staff member added successfully!", staff: newStaff });
    } catch (error) {
        console.error("❌ Error adding staff:", error);
        if (error.code === 11000) {
             return res.status(400).json({ success: false, message: 'Username already exists.' });
        }
        res.status(500).json({ success: false, message: "Error saving staff data" });
    }
});

// --- DELETE /api/staff/:id ---
// Delete a staff member
router.delete('/:id', async (req, res) => {
    try {
        const staffId = req.params.id;
        const result = await Staff.findByIdAndDelete(staffId);
        
        if (!result) {
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }

        res.json({ success: true, message: 'Staff member removed successfully!' });
    } catch (error) {
        console.error("❌ Error deleting staff:", error);
        res.status(500).json({ success: false, message: 'Error deleting staff member' });
    }
});


module.exports = router;