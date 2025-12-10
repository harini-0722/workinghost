const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
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

// --- POST /api/staff (Add New Staff) ---
router.post('/', upload.single('profileImage'), async (req, res) => {
    try {
        const { name, username, password, role, place, phone, email, status, joiningDate } = req.body;
        const file = req.file; 

        // 1. Mandatory Fields Validation (Name, Role, Place required by form)
        if (!name || !role || !place) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields (Name, Role, Place)." 
            });
        }

        // 2. Uniqueness Check for Username (if provided)
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
        
        // 4. Create new Staff record (using undefined for optional fields if empty)
        const newStaff = new Staff({
            name, 
            username: username || undefined,
            password: password || undefined,
            role, 
            place, 
            phone, 
            email,
            status: status || 'Active',
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
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

// --- PUT /api/staff/:id (Update Existing Staff) ---
router.put('/:id', upload.single('profileImage'), async (req, res) => {
    try {
        const staffId = req.params.id;
        const updateData = req.body;
        const file = req.file;

        // 1. Mandatory Fields Check (Name, Role, Place required by form)
        if (!updateData.name || !updateData.role || !updateData.place) {
            return res.status(400).json({ success: false, message: "Name, Role, and Place are required fields." });
        }

        // 2. Image URL Handling (Replace if new file exists)
        if (file) {
            updateData.profileImageUrl = `/uploads/${file.filename}`;
        } else {
            // Remove the profileImage field from updateData if no new file was uploaded
            delete updateData.profileImage;
        }

        // 3. Handle making username/password explicitly undefined if cleared
        // This ensures MongoDB removes the value if the input field was submitted empty.
        if (updateData.username === '') updateData.username = null; // Use null to clear the field in mongo
        if (updateData.password === '') delete updateData.password; // Don't update password if input is blank

        // 4. Uniqueness Check for Username (if provided and changed)
        if (updateData.username) {
            const existingStaff = await Staff.findOne({ username: updateData.username });
            if (existingStaff && existingStaff._id.toString() !== staffId) {
                return res.status(400).json({ success: false, message: 'Username already exists for another staff member.' });
            }
        }
        
        // 5. Update Staff record
        // FindByIdAndUpdate is efficient for updates.
        const updatedStaff = await Staff.findByIdAndUpdate(staffId, updateData, { new: true, runValidators: true });

        if (!updatedStaff) {
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }

        res.json({ success: true, message: "✅ Staff member updated successfully!", staff: updatedStaff });

    } catch (error) {
        console.error("❌ Error updating staff:", error);
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Username already exists.' });
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: `Validation failed: ${error.message}` });
        res.status(500).json({ success: false, message: 'Error updating staff member' });
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