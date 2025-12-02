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
// Handles fetching data for the table and the "View Details" modal
router.get('/', async (req, res) => {
    try {
        // Fetch all requests, and populate student details
        const requests = await VisitorRequest.find()
            .populate({
                path: 'studentId',
                select: 'name room', 
                populate: {
                    path: 'room',
                    select: 'roomNumber' 
                }
            })
            .sort({ submissionDate: -1 }); 

        // Map the data to send everything the frontend needs
        const formattedLogs = requests.map(req => ({
            id: req._id,
            visitorName: req.visitorName,
            studentName: req.studentId?.name || 'Unknown Student',
            roomNumber: req.studentId?.room?.roomNumber || 'N/A',
            
            // Format dates for display
            startDate: new Date(req.startDate).toLocaleDateString(),
            endDate: new Date(req.endDate).toLocaleDateString(),
            rawDate: req.startDate, // Useful for sorting if needed

            // Include reason for the Details Modal
            reason: req.reason,

            // Handle Timestamps (Show 'N/A' if not set, otherwise format time)
            timeIn: req.checkInTime ? new Date(req.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            timeOut: req.checkOutTime ? new Date(req.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            
            status: req.status
        }));
        
        res.status(200).json({ 
            success: true, 
            logs: formattedLogs 
        });
    } catch (error) {
        console.error("Error fetching all visitor requests:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. PATCH: Update Visitor Status (Approve, Reject, Check In, Check Out)
// This handles the Admin Actions
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const requestId = req.params.id;
        
        // Prepare the update object
        let updateData = { status };
        
        // Logic: If checking in/out, automatically capture the current server time
        if (status === 'Checked In') {
            updateData.checkInTime = new Date();
        } else if (status === 'Checked Out') {
            updateData.checkOutTime = new Date();
        }

        // Find and update
        const updatedRequest = await VisitorRequest.findByIdAndUpdate(
            requestId, 
            updateData, 
            { new: true } // Return the updated document
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Visitor request not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: `Visitor marked as ${status}`, 
            request: updatedRequest 
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. GET: Fetch visitor history for a specific student (for Student Page)
router.get('/history/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
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