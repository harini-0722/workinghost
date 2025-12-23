// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    // Account Credentials
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Academic & Location Details
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    course: { type: String },
    department: { type: String },
    year: { type: String },
    joiningDate: { type: Date },
    
    // Contact Information
    email: { type: String },
    phone: { type: String },
    profileImageUrl: { type: String },
    
    // --- UPDATED FEE & FINANCIAL FIELDS ---
    feeStatus: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Partial', 'Paid'] 
    },
    totalFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { type: String },
    bankName: { type: String }, // Stores the bank app used (e.g., GPay, HDFC)
    transactionId: { type: String }, // Reference number for the latest payment
    feeReceiptUrl: { type: String }, // Path to the uploaded screenshot/receipt
    
    // --- TRANSACTION HISTORY ---
    // Stores a record of every individual payment made
    paymentHistory: [{
        amount: { type: Number },
        date: { type: Date, default: Date.now },
        transactionId: { type: String },
        method: { type: String },
        status: { type: String, default: 'Success' }
    }],
    
    // Inventory Management
    assets: [{
        name: { type: String },
        quantity: { type: Number }
    }],
    
    // Relationship with Complaints
    complaints: [{
        type: Schema.Types.ObjectId,
        ref: 'Complaint'
    }]
}, { 
    timestamps: true // Automatically creates createdAt and updatedAt fields
});

module.exports = mongoose.model('Student', studentSchema);