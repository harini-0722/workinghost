// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    course: String,
    department: String,
    year: String,
    email: String,
    phone: String,
    joiningDate: Date,
    
    // --- UPDATED FEE FIELDS ---
    feeStatus: { type: String, default: 'Pending' }, // "Pending", "Partial", "Paid"
    totalFee: Number,
    paidAmount: Number,
    paymentMethod: String,
    bankName: String,
    transactionId: String,
    feeReceiptUrl: String, // URL/Path to the uploaded receipt image
    
    profileImageUrl: String,
    assets: [{
        name: String,
        quantity: Number
    }],
    complaints: [{
        type: Schema.Types.ObjectId,
        ref: 'Complaint'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);