const express = require('express');
const router = express.Router();
const multer = require('multer'); // <-- ADD THIS
const path = require('path'); // <-- ADD THIS

// Import all your models
const Event = require('../models/Event');
const Club = require('../models/Club');
const Member = require('../models/Member');
const Head = require('../models/Head');
const Candidate = require('../models/Candidate');
const Setting = require('../models/Setting');

// --- SET UP FILE STORAGE ---
// This tells multer to save files in your 'public/uploads' folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We save to 'public/uploads'. The '../' goes up from 'routes' folder
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        // We give the file a unique name (timestamp + original name)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// ----------------------------


// --- Helper function for CRUD (No changes here) ---
const createCrudEndpoints = (model, modelName) => {
    // ... your existing GET and DELETE routes are fine ...
    // ... just copy/paste them here ...
    
    // GET all
    router.get(`/${modelName}s`, async (req, res) => {
        try {
            const items = await model.find();
            res.json({ success: true, data: items });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });
    // DELETE
    router.delete(`/${modelName}s/:id`, async (req, res) => {
        try {
            await model.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: `${modelName} deleted` });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });
};
createCrudEndpoints(Event, 'event');
createCrudEndpoints(Member, 'member');
createCrudEndpoints(Club, 'club');
createCrudEndpoints(Head, 'head');
createCrudEndpoints(Candidate, 'candidate');


// --- IMPORTANT: UPDATE YOUR 'POST' ROUTES ---
// We must change all POST routes that upload images.
// Here is the new 'events' POST route.

// OLD: router.post('/events', async (req, res) => { ... })
// NEW:
router.post('/events', upload.single('imageUrl'), async (req, res) => {
    try {
        // req.body has the text fields (name, dateTag, etc.)
        const { name, dateTag, description } = req.body;

        // req.file has the image info
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        // This is the new path we will save to the database
        const imageUrlPath = '/uploads/' + req.file.filename;

        const newItem = new Event({
            name,
            dateTag,
            description,
            imageUrl: imageUrlPath // Save the path, not a full URL
        });

        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// DO THE SAME FOR YOUR OTHER POST ROUTES:
router.post('/members', upload.single('imageUrl'), async (req, res) => {
    try {
        const { name, position, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const imageUrlPath = '/uploads/' + req.file.filename;
        const newItem = new Member({ name, position, description, imageUrl: imageUrlPath });
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/heads', upload.single('imageUrl'), async (req, res) => {
    try {
        const { name, position, council } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const imageUrlPath = '/uploads/' + req.file.filename;
        const newItem = new Head({ name, position, council, imageUrl: imageUrlPath });
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/candidates', upload.single('imageUrl'), async (req, res) => {
    try {
        const { name, position, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const imageUrlPath = '/uploads/' + req.file.filename;
        const newItem = new Candidate({ name, position, description, imageUrl: imageUrlPath });
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// This route does not have an image, so it stays the same
router.post('/clubs', async (req, res) => {
    try {
        const newItem = new Club(req.body);
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// ... (Your other routes for dashboard-stats, settings, public-data are fine) ...
// ... (Paste them here) ...

// Dashboard Stats Endpoint
router.get("/dashboard-stats", async (req, res) => {
    try {
        const [eventCount, memberCount, clubCount, headCount] = await Promise.all([
            Event.countDocuments(),
            Member.countDocuments(),
            Club.countDocuments(),
            Head.countDocuments()
        ]);
        res.json({
            success: true,
            data: { eventCount, memberCount, clubCount, headCount }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Settings Endpoints
router.get("/settings", async (req, res) => {
    try {
        const settings = await Setting.find();
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
        res.json({ success: true, data: settingsMap });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post("/settings", async (req, res) => {
    try {
        const { key, value } = req.body;
        await Setting.findOneAndUpdate(
            { key: key },
            { value: value },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Settings saved" });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Public Data Endpoint
router.get("/public-data", async (req, res) => {
    try {
        const [events, members, clubs, heads, candidates, settings] = await Promise.all([
            Event.find(),
            Member.find(),
            Club.find(),
            Head.find(),
            Candidate.find(),
            Setting.find()
        ]);
        
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        res.json({
            success: true,
            data: { events, members, clubs, heads, candidates, settings: settingsMap }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// At the very end, export the router
module.exports = router;