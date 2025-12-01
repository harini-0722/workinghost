const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const fs = require('fs'); // Changed to standard fs for existsSync check
const path = require('path');
const multer = require('multer'); // 1. IMPORT MULTER

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
// ✅ FIX: Added 'upload.single('profileImage')' middleware here
router.post('/', upload.single('profileImage'), async (req, res) => {
    try {
        // Now req.body will actually contain your text data
        const { name, username, password, role, place, phone, email, status, joiningDate } = req.body;
        const file = req.file; 

        // 1. Mandatory Fields Validation
        if (!name || !username || !password || !role || !place || !status || !joiningDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields (Name, Username, Password, Role, Place, Status, Joining Date)." 
            });
        }

        // 2. Uniqueness Check
        const existingStaff = await Staff.findOne({ username: username });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }

        // 3. Image URL Handling
        let profileImageUrl = '';
        if (file) {
            // Logic: standardizing on /uploads/filename
            profileImageUrl = `/uploads/${file.filename}`;
        }
        
        // 4. Create new Staff record
        const newStaff = new Staff({
            name, username, password, role, place, phone, email,
            status: status || 'Active',
            joiningDate: new Date(joiningDate), // Ensure Model has this field
            profileImageUrl: profileImageUrl,
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: "✅ Staff member added successfully!", staff: newStaff });

    } catch (error) {
        console.error("❌ Error adding staff:", error);
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Username already exists.' });
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: `Validation failed: ${error.message}` });
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