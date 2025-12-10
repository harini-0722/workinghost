const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this path exists in your project: public/uploads
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename: staff-timestamp-filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'staff-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- GET /api/staff ---
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
router.post('/', upload.single('profileImage'), async (req, res) => {
    try {
        // req.body contains all form fields, which can now be empty strings ('')
        const { name, username, password, role, place, phone, email, status, joiningDate } = req.body;
        const file = req.file; 

        // 1. MANDATORY FIELDS VALIDATION REMOVED
        // The check below has been completely removed to allow empty submissions:
        /*
        if (!name || !username || !password || !role || !place || !status || !joiningDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields (Name, Username, Password, Role, Place, Status, Joining Date)." 
            });
        }
        */

        // 2. Uniqueness Check (Only run if username is actually provided)
        if (username) {
            const existingStaff = await Staff.findOne({ username: username });
            if (existingStaff) {
                return res.status(400).json({ success: false, message: 'Username already exists.' });
            }
        }

        // 3. Image URL Handling
        let profileImageUrl = '';
        if (file) {
            profileImageUrl = `/uploads/${file.filename}`;
        }
        
        // 4. Create new Staff record
        // We use || '' to ensure the database receives an empty string instead of undefined/null 
        // if the form data was blank, which is safer.
        const newStaff = new Staff({
            name: name || '',
            username: username || '',
            password: password || '',
            role: role || '',
            place: place || '',
            phone: phone || '',
            email: email || '',
            status: status || 'Active', // Default to Active if status is not provided
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(), // Use current date if none provided
            profileImageUrl: profileImageUrl,
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "✅ Staff member added successfully!", staff: newStaff });

    } catch (error) {
        console.error("❌ Error adding staff:", error);
        
        // Handle database-specific errors
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Username already exists.' });
        
        // The Mongoose Validation Error (which still needs to be addressed in the Staff Model)
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: `Validation failed: ${error.message}. You must also update your Mongoose Staff Model to remove 'required: true' for all fields you want to be optional.` });
        
        res.status(500).json({ success: false, message: "Error saving staff data" });
    }
});

// --- DELETE /api/staff/:id ---
router.delete('/:id', async (req, res) => {
    try {
        const staffId = req.params.id;
        const result = await Staff.findByIdAndDelete(staffId);
        if (!result) return res.status(404).json({ success: false, message: 'Staff member not found.' });
        res.json({ success: true, message: 'Staff member removed successfully!' });
    } catch (error) {
        console.error("❌ Error deleting staff:", error);
        res.status(500).json({ success: false, message: 'Error deleting staff member' });
    }
});

module.exports = router;