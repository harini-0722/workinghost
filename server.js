const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const open = require("open");
const cron = require('node-cron');
const multer = require('multer');
const path = require('path'); // DECLARED ONCE at the top
const fs = require('fs');

// --- IMPORT ROUTES ---
const gymkhanaRoutes = require('./routes/gymkhana');

// --- IMPORT MODELS ---
const Room = require('./models/Room');
const Block = require('./models/Block');
const Student = require('./models/Student');
const ClubActivity = require('./models/ClubActivity');
const Attendance = require('./models/Attendance');
const Asset = require('./models/Asset');
const User = require('./models/user'); // Assuming your User model is in 'models/user.js'

const app = express();
const PORT = 5000;

// --- MIDDLEWARE (Order is very important) ---
// 1. CORS
app.use(cors());
// 2. JSON/Body Parser
app.use(bodyParser.json());
// 3. Static Files (This fixes your 404 error)
// This line serves ALL files from your 'public' folder (like .html, .js, .css)
app.use(express.static(path.join(__dirname, 'public')));
// This line makes the 'uploads' folder accessible via the URL /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- API ROUTES ---
// 4. Gymkhana API Routes
app.use('/api/gymkhana', gymkhanaRoutes);
// ----------------------------------------------------

// --- Multer Configuration ---
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// ------------------------------------------

// ✅ MongoDB Connection
mongoose
    .connect("mongodb+srv://admin:admin123@cluster0.h4bbmg7.mongodb.net/hostelDB?retryWrites=true&w=majority")
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- User Login & Admin ---
const createDefaultAdmin = async () => {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
        await User.create({ username: "admin", password: "admin123", role: "admin" });
        console.log("👑 Default admin created: admin / admin123");
    }
};
createDefaultAdmin();

app.post("/login", async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let redirect = "";
        if (role === "admin") {
            const user = await User.findOne({ username, password });
            if (!user) {
                return res.status(401).json({ message: "Invalid Admin credentials" });
            }
            // --- FIX: Point to the correct admin page ---
            redirect = "/admin.html"; // Or whatever your main admin page is
            res.json({ message: "Login successful", redirect });
        } else if (role === "student") {
            const student = await Student.findOne({ username, password });
            if (!student) {
                return res.status(401).json({ message: "Invalid Student credentials" });
            }
            redirect = "/student.html";
            res.json({ message: "Login successful", redirect, studentId: student._id });
        } else {
            return res.status(400).json({ message: "Invalid role selected" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// -------------------------------------------------
// --- HOSTEL: ASSET INVENTORY API ROUTES ---
// -------------------------------------------------
app.get('/api/assets', async (req, res) => {
    try {
        const assets = await Asset.find({}).sort({ name: 'asc' });
        res.json({ success: true, assets });
    } catch (error) {
        console.error("❌ Error fetching assets:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/api/assets', upload.single('assetImage'), async (req, res) => {
    try {
        const { type, name, quantity, description } = req.body;
        const assetName = (type === 'Other') ? name : type;
        const qty = parseInt(quantity, 10);

        if (!assetName || !qty || qty <= 0) {
            return res.status(400).json({ success: false, message: "Invalid asset name or quantity" });
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        const existingAsset = await Asset.findOne({ name: assetName });
        if (existingAsset) {
            existingAsset.quantity += qty;
            await existingAsset.save();
            res.json({ success: true, message: "Asset quantity updated", asset: existingAsset });
        } else {
            const newAsset = new Asset({
                name: assetName,
                type: type,
                quantity: qty,
                description: description,
                imageUrl: imageUrl
            });
            await newAsset.save();
            res.status(201).json({ success: true, message: "Asset added to inventory", asset: newAsset });
        }
    } catch (error) {
        console.error("❌ Error saving asset:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('/api/assets/:id', async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }
        await Asset.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Asset deleted from inventory" });
    } catch (error) {
        console.error("❌ Error deleting asset:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

async function returnAssetsToStock(assetsArray) {
    if (!assetsArray || assetsArray.length === 0) return;
    try {
        for (const item of assetsArray) {
            await Asset.updateOne(
                { name: item.name },
                { $inc: { quantity: item.quantity } }
            );
        }
        console.log("✅ Assets returned to stock:", assetsArray);
    } catch (error) {
        console.error("❌ Error returning assets to stock:", error);
    }
}

// ------------------------------------------
// --- HOSTEL: BLOCK & ROOM API ROUTES ---
// ------------------------------------------
app.get("/api/blocks", async (req, res) => {
    try {
        const blocks = await Block.find({})
            .populate({
                path: 'rooms',
                populate: {
                    path: 'students'
                }
            })
            .sort({ createdAt: 'desc' });
        res.json({ success: true, blocks });
    } catch (error) {
        console.error("❌ Error fetching blocks:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/api/blocks", async (req, res) => {
    try {
        const { blockName, blockKey, blockTheme } = req.body;
        if (!blockName || !blockKey || !blockTheme)
            return res.status(400).json({ success: false, message: "All fields are required" });

        const existing = await Block.findOne({ blockKey: blockKey });
        if (existing)
            return res.status(400).json({ success: false, message: "Block key already exists!" });

        const newBlock = new Block({
            blockName,
            blockKey: blockKey,
            blockTheme: blockTheme,
            rooms: []
        });
        await newBlock.save();
        res.status(201).json({ success: true, message: "✅ Block added successfully!", block: newBlock });
    } catch (error) {
        console.error("❌ Error adding block:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/api/blocks/:blockKey/rooms', upload.single('roomImage'), async (req, res) => {
    try {
        const { blockKey } = req.params;
        const { roomNumber, floor, capacity, assets } = req.body; 
        if (!roomNumber || !floor || !capacity) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        const parentBlock = await Block.findOne({ blockKey: blockKey });
        if (!parentBlock) {
            return res.status(404).json({ success: false, message: 'Block not found.' });
        }
        let assetsToAssign = [];
        if (assets) {
            assetsToAssign = JSON.parse(assets);
        }
        for (const item of assetsToAssign) {
            const stockAsset = await Asset.findOne({ name: item.name });
            if (!stockAsset || stockAsset.quantity < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}. Available: ${stockAsset?.quantity || 0}` });
            }
        }
        for (const item of assetsToAssign) {
            await Asset.updateOne(
                { name: item.name },
                { $inc: { quantity: -item.quantity } }
            );
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        const newRoom = new Room({
            roomNumber,
            floor,
            capacity,
            block: parentBlock._id,
            assets: assetsToAssign,
            imageUrl: imageUrl,
            students: []
        });
        await newRoom.save();
        parentBlock.rooms.push(newRoom._id);
        await parentBlock.save();
        res.status(201).json({ success: true, message: 'Room added successfully!', room: newRoom });
    } catch (error) {
        console.error("❌ Error adding room:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This room number already exists in this block.' });
        }
        res.status(500).json({ success: false, message: 'Error adding room' });
    }
});

app.delete('/api/blocks/:blockKey/rooms/:roomId', async (req, res) => {
    try {
        const { blockKey, roomId } = req.params;
        const roomToDelete = await Room.findById(roomId);
        if (!roomToDelete) {
            return res.status(404).json({ success: false, message: 'Room not found.' });
        }
        await returnAssetsToStock(roomToDelete.assets);
        const studentsInRoom = await Student.find({ room: roomId });
        for (const student of studentsInRoom) {
            await returnAssetsToStock(student.assets);
            await Student.findByIdAndDelete(student._id);
        }
        await Block.findOneAndUpdate({ blockKey: blockKey }, { $pull: { rooms: roomId } });
        await Room.findByIdAndDelete(roomId);
        res.json({ success: true, message: 'Room and associated students deleted successfully!' });
    } catch (error) {
        console.error("❌ Error deleting room:", error);
        res.status(500).json({ success: false, message: 'Error deleting room' });
    }
});

app.delete('/api/blocks/:id', async (req, res) => {
    try {
        const blockId = req.params.id;
        const blockToDelete = await Block.findById(blockId);
        if (!blockToDelete) {
            return res.status(404).json({ success: false, message: 'Block not found.' });
        }
        const roomIds = blockToDelete.rooms;
        if (roomIds && roomIds.length > 0) {
            const rooms = await Room.find({ _id: { $in: roomIds } });
            for (const room of rooms) {
                await returnAssetsToStock(room.assets);
            }
            const students = await Student.find({ room: { $in: roomIds } });
            for (const student of students) {
                await returnAssetsToStock(student.assets);
            }
            await Student.deleteMany({ room: { $in: roomIds } });
            await Room.deleteMany({ _id: { $in: roomIds } });
        }
        await Block.findByIdAndDelete(blockId);
        res.json({ success: true, message: 'Block, rooms, and students deleted successfully!' });
    } catch (error) {
        console.error("❌ Error deleting block:", error);
        res.status(500).json({ success: false, message: 'Error deleting block' });
    }
});


// ------------------------------------------
// --- HOSTEL: STUDENT API ROUTES ---
// ------------------------------------------
app.post('/api/students', upload.single('profileImage'), async (req, res) => {
    try {
        const {
            roomId, name, course, department, year, email, phone,
            feeStatus, paymentMethod, joiningDate, username, password,
            rollNumber, assets
        } = req.body;
        if (!roomId || !name || !username || !password || !rollNumber) {
            return res.status(400).json({ success: false, message: 'Room, Name, Roll Number, Username, and Password are required.' });
        }
        const parentRoom = await Room.findById(roomId);
        if (!parentRoom) {
            return res.status(404).json({ success: false, message: 'Room not found.' });
        }
        if (parentRoom.students.length >= parentRoom.capacity) {
            return res.status(400).json({ success: false, message: 'This room is already full.' });
        }
        const existingStudent = await Student.findOne({ $or: [{ username: username }, { rollNumber: rollNumber }] });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'This username or roll number is already taken.' });
        }
        let assetsToAssign = [];
        if (assets) {
            assetsToAssign = JSON.parse(assets);
        }
        for (const item of assetsToAssign) {
            const stockAsset = await Asset.findOne({ name: item.name });
            if (!stockAsset || stockAsset.quantity < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}. Available: ${stockAsset?.quantity || 0}` });
            }
        }
        for (const item of assetsToAssign) {
            await Asset.updateOne(
                { name: item.name },
                { $inc: { quantity: -item.quantity } }
            );
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        const newStudent = new Student({
            room: roomId, name, course, department, year, email, phone,
            feeStatus, paymentMethod, joiningDate, username, password,
            rollNumber: rollNumber,
            assets: assetsToAssign,
            profileImageUrl: imageUrl,
        });
        await newStudent.save();
        parentRoom.students.push(newStudent._id);
        await parentRoom.save();
        res.status(201).json({ success: true, message: 'Student added successfully!' });
    } catch (error) {
        console.error("❌ Error adding student:", error);
        res.status(500).json({ success: false, message: 'Error adding student' });
    }
});

app.get('/api/student/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        const room = await Room.findById(student.room);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found for student.' });
        }
        const block = await Block.findById(room.block);
        if (!block) {
            return res.status(404).json({ success: false, message: 'Block not found for room.' });
        }
        const roommates = await Student.find({
            room: room._id,
            _id: { $ne: studentId }
        });
        const realAttendance = await Attendance.find({ student: studentId })
            .sort({ date: -1 })
            .limit(30);
        const mockComplaints = [
            { _id: 'c1001', title: 'Leaky Faucet in Washroom', status: 'Pending', date: '2025-10-20' },
            { _id: 'c1002', title: 'Wi-Fi speed is very slow in the evening', status: 'Pending', date: '2025-10-18' },
            { _id: 'c1003', title: 'Study lamp bulb fused', status: 'Resolved', date: '2025-10-15' },
        ];
        res.json({
            success: true,
            student: student,
            room: room,
            blockName: block.blockName,
            roommates: roommates,
            attendance: realAttendance,
            complaints: mockComplaints,
            roomNumber: room.roomNumber 
        });
    } catch (error) {
        console.error("❌ Error fetching student profile:", error);
        res.status(500).json({ success: false, message: 'Error fetching student profile' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const studentToDelete = await Student.findById(studentId);
        if (!studentToDelete) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        await returnAssetsToStock(studentToDelete.assets);
        const roomId = studentToDelete.room;
        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { $pull: { students: studentId } });
        }
        await Student.findByIdAndDelete(studentId);
        res.json({ success: true, message: 'Student removed successfully!' });
    } catch (error) {
        console.error("❌ Error removing student:", error);
        res.status(500).json({ success: false, message: 'Error removing student' });
    }
});

// ------------------------------------------
// --- HOSTEL: CLUB ACTIVITY API ROUTES ---
// ------------------------------------------
app.get('/api/activities', async (req, res) => {
    try {
        const activities = await ClubActivity.find({}).sort({ createdAt: 'desc' });
        res.json({ success: true, activities });
    } catch (error) {
        console.error("❌ Error fetching activities:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/api/activities', upload.single('clubActivityImage'), async (req, res) => {
    try {
        const { title, type, date, description } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        if (!title || !type || !date) {
            return res.status(400).json({ success: false, message: "Title, Type, and Date are required" });
        }
        const newActivity = new ClubActivity({
            title, type, date, description,
            imageUrl: imageUrl
        });
        await newActivity.save();
        res.status(201).json({ success: true, message: "✅ Activity added successfully!", activity: newActivity });
    } catch (error) {
        console.error("❌ Error adding activity:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('/api/activities/:id', async (req, res) => {
    try {
        const activityId = req.params.id;
        const activity = await ClubActivity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }
        await ClubActivity.findByIdAndDelete(activityId);
        res.json({ success: true, message: 'Activity deleted successfully!' });
    } catch (error) {
        console.error("❌ Error deleting activity:", error);
        res.status(500).json({ success: false, message: 'Error deleting activity' });
    }
});


// ------------------------------------------
// --- HOSTEL: ATTENDANCE API ROUTES ---
// ------------------------------------------

function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

cron.schedule('59 23 * * *', async () => {
    console.log('🌙 Running nightly job: Marking absentees...');
    const todayStart = getTodayStart();
    try {
        const allStudents = await Student.find({}, '_id');
        let absentCount = 0;
        for (const student of allStudents) {
            const existingRecord = await Attendance.findOne({
                student: student._id,
                date: todayStart
            });
            if (!existingRecord) {
                await Attendance.create({
                    student: student._id,
                    date: todayStart,
                    status: 'Absent'
                });
                absentCount++;
            }
        }
        console.log(`🌙 Nightly job complete: ${absentCount} students marked as Absent.`);
    } catch (error) {
        console.error('❌ Error in nightly cron job:', error);
    }
}, {
    timezone: "Asia/Kolkata" // Use your correct timezone
});

app.get('/api/attendance/status/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const todayStart = getTodayStart();
        const latestRecord = await Attendance.findOne({
            student: studentId,
            date: todayStart
        });
        if (!latestRecord) {
            return res.json({ success: true, status: 'Checked Out', lastActionTime: null });
        }
        if (latestRecord.checkInTime && !latestRecord.checkOutTime) {
            return res.json({ success: true, status: 'Checked In', lastActionTime: latestRecord.checkInTime });
        } else {
            return res.json({ success: true, status: 'Checked Out', lastActionTime: latestRecord.checkOutTime });
        }
    } catch (error) {
        console.error("❌ Error fetching attendance status:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/attendance/toggle', async (req, res) => {
    try {
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required.' });
        }
        const todayStart = getTodayStart();
        const now = new Date();
        const existingRecord = await Attendance.findOne({
            student: studentId,
            date: todayStart
        });
        if (!existingRecord) {
            const newRecord = await Attendance.create({
                student: studentId,
                date: todayStart,
                status: 'Present',
                checkInTime: now
            });
            return res.json({
                success: true,
                newStatus: 'Checked In',
                lastActionTime: newRecord.checkInTime
            });
        }
        if (existingRecord.checkInTime && !existingRecord.checkOutTime) {
            existingRecord.checkOutTime = now;
            await existingRecord.save();
            return res.json({
                success: true,
                newStatus: 'Checked Out',
                lastActionTime: existingRecord.checkOutTime
            });
        } else {
            existingRecord.checkInTime = now;
            existingRecord.checkOutTime = null;
            existingRecord.status = 'Present';
            await existingRecord.save();
            return res.json({
                success: true,
                newStatus: 'Checked In',
                lastActionTime: existingRecord.checkInTime
            });
        }
    } catch (error) {
        console.error("❌ Error toggling attendance:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- Server Start ---

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    // await open(`http://localhost:${PORT}/login.html`);
});