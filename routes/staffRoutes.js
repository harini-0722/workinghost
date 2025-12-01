const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff'); // Assuming Staff model is one directory up (../models/Staff)
const fs = require('fs').promises; 
const path = require('path');

// Helper function to remove the 'uploads' part when checking the image file system path
const getFilePath = (url) => {
    // NOTE: This helper is now largely redundant for the POST route fix, 
    // but kept for compatibility with other GET/DELETE handlers if they use it.
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

// ----------------------------------------------------------------------
// ✅ FIX: UPDATING POST ROUTE FOR MULTER/FORMDATA COMPATIBILITY
// ----------------------------------------------------------------------
// --- POST /api/staff ---
// Add a new staff member (Expects data via FormData, file via req.file)
router.post('/', async (req, res) => {
    try {
        // All non-file fields come via req.body after Multer processes the request.
        // We include 'joiningDate' as this was likely the missing required field.
        const { name, username, password, role, place, phone, email, status, joiningDate } = req.body;
        
        // Multer handles the file upload, info is in req.file.
        const file = req.file; 

        // 1. Mandatory Fields Validation (The cause of the 400 error)
        if (!name || !username || !password || !role || !place || !status || !joiningDate) {
            // Include all required fields in validation check.
            return res.status(400).json({ success: false, message: "Missing required fields (Name, Username, Password, Role, Place, Status, Joining Date)." });
        }

        // 2. Uniqueness Check
        const existingStaff = await Staff.findOne({ username: username });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }

        // 3. Image URL Handling (Using req.file from Multer)
        let profileImageUrl = '';
        if (file) {
            // The file path is /uploads/filename after Multer finishes
            profileImageUrl = `/uploads/${file.filename}`;
        }
        
        // 4. Create new Staff record
        const newStaff = new Staff({
            name, username, password, role, place, phone, email,
            status: status || 'Active', // Status should be guaranteed by frontend
            joiningDate: new Date(joiningDate), // Convert string to Date object
            profileImageUrl: profileImageUrl,
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "✅ Staff member added successfully!", staff: newStaff });
    } catch (error) {
        console.error("❌ Error adding staff:", error);
        
        // Handle MongoDB duplicate key error (if username is unique)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }
        
        // Catch Mongoose validation errors (if other fields are missing or wrong type)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: `Validation failed: ${error.message}` });
        }
        
        res.status(500).json({ success: false, message: "Error saving staff data" });
    }
});
// ----------------------------------------------------------------------

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