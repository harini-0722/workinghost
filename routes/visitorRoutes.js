const express = require('express');
const router = express.Router();
const VisitorRequest = require('../models/VisitorRequest'); 
const Student = require('../models/Student'); // Needed for population

// 1. POST: Submit a new visitor request (for Student Dashboard)
router.post('/', async (req, res) => {
    try {
        const { studentId, visitorName, startDate, endDate, reason } = req.body;

        const newRequest = new VisitorRequest({
            studentId,
            visitorName,
            startDate,
            endDate,
            reason,
            status: 'Pending' // Default status
        });

        await newRequest.save();

        res.status(201).json({ 
            success: true, 
            message: 'Visitor request saved successfully', 
            request: newRequest 
        });
    } catch (error) {
        console.error("Error creating visitor request:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET: Fetch ALL visitor requests (for Admin Dashboard)
// This handles the GET /api/visitor-request call from the frontend.
router.get('/', async (req, res) => {
    try {
        // Fetch all requests, and populate student details to display name/room in admin panel
        const requests = await VisitorRequest.find()
                                           .populate({
                                                path: 'studentId',
                                                select: 'name room', // Select student name and room ID
                                                populate: {
                                                    path: 'room',
                                                    select: 'roomNumber' // Select room number from the room document
                                                }
                                           })
                                           .sort({ submissionDate: -1 }); 

        // Map the data into the structure the frontend expects to display in the table
        const formattedLogs = requests.map(req => ({
            id: req._id,
            visitorName: req.visitorName,
            // Assuming the frontend structure expects these fields:
            studentName: req.studentId?.name || 'Unknown Student',
            roomNumber: req.studentId?.room?.roomNumber || 'N/A',
            date: new Date(req.startDate).toISOString().split('T')[0], // Use start date as log date
            timeIn: 'N/A', // Assuming log check-in/out is tracked separately or handled in a different status flow
            timeOut: 'N/A',
            status: req.status
        }));
        
        res.status(200).json({ 
            success: true, 
            logs: formattedLogs // The frontend (script.js) looks for data.logs
        });
    } catch (error) {
        console.error("Error fetching all visitor requests:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 4. GET: Fetch visitor history for a specific student (for Student Page)
router.get('/history/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        // Fetch requests matching the studentId, sorted by newest first (_id contains timestamp)
        const requests = await VisitorRequest.find({ studentId: studentId })
                                             .sort({ _id: -1 });
        
        res.status(200).json({ 
            success: true, 
            visitorRequests: requests 
        });
    } catch (error) {
        console.error("Error fetching visitor history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;