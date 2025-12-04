const mongoose = require('mongoose');

const electionPostSchema = new mongoose.Schema({
    position: { type: String, required: true, unique: true }, // e.g., CVR: Hall Secretary
    block: { type: String, required: true }, // e.g., CVR Hall
    nominationDate: { type: Date, required: true }, // Nomination deadline
    
    // You might want to track if an election is active/finished
    isActive: { type: Boolean, default: true }, 
    
    // Store the ID of the winning candidate once declared
    winnerCandidateId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        default: null
    }
});

module.exports = mongoose.model("ElectionPost", electionPostSchema);