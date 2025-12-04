const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const path = require('path'); 
const mongoose = require('mongoose'); // Need this for aggregate functions

// Import ALL your models
const Event = require('../models/Event');
const Club = require('../models/Club');
const Member = require('../models/Member');
const Head = require('../models/Head');
// Election Models:
const ElectionPost = require('../models/ElectionPost');
const Candidate = require('../models/Candidate');
const Announcement = require('../models/Announcement');
const Vote = require('../models/Vote'); // Assuming you created this model
const Setting = require('../models/Setting');


// --- SET UP FILE STORAGE ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// ----------------------------


// --- Helper function for non-election CRUD (NO CHANGE) ---
const createCrudEndpoints = (model, modelName) => {
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
// We call ElectionPost directly below to handle complex POST logic
// We call Announcement directly below to handle complex POST logic


// -------------------------------------------------------------
//                GYMKHANA MODULE POST ROUTES
// -------------------------------------------------------------

router.post('/events', upload.single('imageUrl'), async (req, res) => {
    try {
        const { name, dateTag, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const imageUrlPath = '/uploads/' + req.file.filename;
        const newItem = new Event({ name, dateTag, description, imageUrl: imageUrlPath });
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

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

router.post('/clubs', async (req, res) => {
    try {
        const newItem = new Club(req.body);
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// -------------------------------------------------------------
//                   ELECTION MODULE ROUTES
// -------------------------------------------------------------

// --- ELECTION POSTS (Election Details Setup) ---
// --- ELECTION POSTS (Election Details Setup) ---
router.post('/elections/posts', async (req, res) => {
    try {
        const { position, block, nominationDate } = req.body;
        
        // 1. Basic Validation
        if (!position || !block || !nominationDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields: Position, Block, or Nomination Date.' });
        }
        
        // 2. Date conversion/validation
        const parsedDate = new Date(nominationDate);
        if (isNaN(parsedDate)) {
             return res.status(400).json({ success: false, message: 'Invalid nomination date format.' });
        }

        const newItem = new ElectionPost({ 
            position, 
            block, 
            nominationDate: parsedDate 
        });

        await newItem.save();
        
        res.status(201).json({ 
            success: true, 
            data: { 
                id: newItem._id, 
                position: newItem.position, 
                block: newItem.block, 
                nominationDate: newItem.nominationDate.toISOString().split('T')[0] 
            }
        });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ success: false, message: 'Error: Position name already exists.' });
        }
        console.error("Mongoose Error in POST /elections/posts:", e);
        res.status(500).json({ success: false, message: 'Server Error: Failed to save post. Details: ' + e.message });
    }
});

router.get('/elections/posts', async (req, res) => {
    try {
        const items = await ElectionPost.find({ isActive: true });
        // Format the date for the frontend:
        const formattedItems = items.map(item => ({
            id: item._id,
            position: item.position,
            block: item.block,
            nominationDate: item.nominationDate ? item.nominationDate.toISOString().split('T')[0] : 'N/A'
        }));
        res.json({ success: true, data: formattedItems });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// --- CANDIDATES ---
// Note: Frontend Candidate form needs to send 'postId' from the dropdown value.
router.post('/elections/candidates', upload.single('imageUrl'), async (req, res) => {
    try {
        const { post, name, rollno, manifesto } = req.body;
        
        // 'post' is the position name from the dropdown. We need the ID.
        const electionPost = await ElectionPost.findOne({ position: post });
        if (!electionPost) {
            return res.status(404).json({ success: false, message: 'Election post not found' });
        }
        
        // This is where you would validate 'rollno' against a 'users' collection
        
        const imageUrlPath = req.file ? '/uploads/' + req.file.filename : null;
        
        const newItem = new Candidate({
            postId: electionPost._id, // Save the actual ID
            name,
            rollno,
            manifesto,
            imageUrl: imageUrlPath,
            // Initial voteCount is 0
        });

        await newItem.save();
        res.status(201).json({ 
            success: true, 
            data: { ...newItem.toObject(), post: post } // Send back the position name for immediate rendering
        });
    } catch (e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
});

router.get('/elections/candidates', async (req, res) => {
    try {
        // Populate the postId to get the position name and block
        const items = await Candidate.find().populate('postId');
        const formattedItems = items.map(item => ({
            id: item._id,
            name: item.name,
            rollno: item.rollno,
            manifesto: item.manifesto,
            imageUrl: item.imageUrl,
            // Extract position name from the populated postId object
            post: item.postId ? item.postId.position : 'Unknown Post',
            block: item.postId ? item.postId.block : 'Unknown Block'
        }));
        res.json({ success: true, data: formattedItems });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// --- ANNOUNCEMENTS ---
router.post('/elections/announcements', upload.single('imageUrl'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const imageUrlPath = req.file ? '/uploads/' + req.file.filename : null;
        
        const newItem = new Announcement({
            title,
            content,
            imageUrl: imageUrlPath,
        });

        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
});

router.get('/elections/announcements', async (req, res) => {
    try {
        const items = await Announcement.find().sort({ published_at: -1 });
        res.json({ success: true, data: items });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// --- DECLARE WINNERS (CRUD for final results) ---
router.post('/elections/winners', async (req, res) => {
    try {
        // You'll need to update this logic to find the candidate by name/rollno
        const { position, candidate, votes } = req.body; 

        // 1. Find the Post ID
        const post = await ElectionPost.findOne({ position: position });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Position not found' });
        }
        
        // 2. Find the Candidate ID (The simplest way is to look up the candidate by name/post combination)
        const winningCandidate = await Candidate.findOne({ name: candidate, postId: post._id });
        if (!winningCandidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found for this position' });
        }

        // 3. Mark the winner in the Post collection
        post.winnerCandidateId = winningCandidate._id;
        await post.save();
        
        // 4. Optionally update the vote count on the Candidate model (if not doing real-time counting)
        winningCandidate.voteCount = votes;
        await winningCandidate.save();
        
        res.json({ 
            success: true, 
            data: { position, candidate, votes: votes, id: winningCandidate._id } 
        });
        
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/elections/winners', async (req, res) => {
    try {
        // Find all posts that have a declared winner
        const postsWithWinners = await ElectionPost.find({ winnerCandidateId: { $ne: null } })
            .populate('winnerCandidateId');

        const winners = postsWithWinners.map(post => {
            const candidate = post.winnerCandidateId;
            return {
                id: candidate._id,
                position: post.position,
                candidate: candidate.name,
                votes: candidate.voteCount // Using the manually entered or final counted votes
            };
        });

        res.json({ success: true, data: winners });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// --- VIEW RESULTS (Complex Aggregation Endpoint) ---
// --- VIEW RESULTS (Complex Aggregation Endpoint) ---
router.get('/elections/full-results', async (req, res) => {
    try {
        // 1. Calculate Candidate Vote Counts by Position/Block
        const results = await Candidate.aggregate([
            {
                $lookup: {
                    from: 'electionposts',
                    localField: 'postId',
                    foreignField: '_id',
                    as: 'postDetails'
                }
            },
            { $unwind: '$postDetails' },
            {
                $group: {
                    _id: {
                        postId: '$postId',
                        block: '$postDetails.block',
                        position: '$postDetails.position'
                    },
                    candidates: {
                        $push: {
                            id: '$_id',
                            name: '$name',
                            votes: '$voteCount'
                        }
                    },
                    winnerCandidateId: { $first: '$postDetails.winnerCandidateId' }
                }
            }
        ]);
        
        // 2. Calculate Overall Stats
        const totalVoters = 3000; 
        const totalVotes = await Candidate.aggregate([
            { $group: { _id: null, total: { $sum: '$voteCount' } } }
        ]);
        const votesCasted = totalVotes.length > 0 ? totalVotes[0].total : 0;
        const turnout = ((votesCasted / totalVoters) * 100).toFixed(2);
        
        const overallStats = {
            total_voters: totalVoters,
            votes_casted: votesCasted,
            turnout_percentage: `${turnout}%`
        };

        // 3. Transform data into the Frontend Structure
        const resultsByBlock = results.reduce((acc, group) => {
            const blockName = group._id.block;
            
            const candidates = group.candidates.map(c => ({
                name: c.name,
                votes: c.votes,
                status: group.winnerCandidateId && group.winnerCandidateId.equals(c.id) ? 'Winner' : ''
            }));
            
            if (!acc[blockName]) {
                acc[blockName] = [];
            }
            
            acc[blockName].push({
                position_name: group._id.position,
                candidates: candidates
            });

            return acc;
        }, {});
        
        // 4. Add Placeholder/Summary for "Other Hostels" (Static Data)
        resultsByBlock["Other Hostels Summary"] = [
            { hostel_name: "APJ Hostel", total_votes: 148, total_positions: 3 },
            { hostel_name: "HJB Hostel", total_votes: 226, total_positions: 4 }
        ];


        // 5. Send the final structured JSON, wrapped in 'data'
        res.json({
            success: true,
            data: { // <-- CRITICAL: Wrapped in 'data'
                overall_stats: overallStats,
                results_by_block: resultsByBlock
            }
        });

    } catch (e) {
        console.error("Aggregation Error:", e);
        res.status(500).json({ success: false, message: e.message });
    }
});
// -------------------------------------------------------------
//                   OTHER GENERAL ROUTES
// -------------------------------------------------------------

// Dashboard Stats Endpoint (NO CHANGE)
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

// Settings Endpoints (NO CHANGE)
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

// Public Data Endpoint (Updated to include new Election models)
router.get("/public-data", async (req, res) => {
    try {
        const [events, members, clubs, heads, candidates, posts, announcements, settings] = await Promise.all([
            Event.find(),
            Member.find(),
            Club.find(),
            Head.find(),
            Candidate.find(),
            ElectionPost.find(),
            Announcement.find().sort({ published_at: -1 }),
            Setting.find()
        ]);
        
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        res.json({
            success: true,
            data: { events, members, clubs, heads, candidates, posts, announcements, settings: settingsMap }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


// At the very end, export the router
module.exports = router;