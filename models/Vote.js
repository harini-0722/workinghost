const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ElectionPost', 
        required: true 
    },
    candidateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Candidate', 
        required: true 
    },
    voterId: { type: String, required: true }, // Assuming a user/voter ID from another table/system
    voted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vote", voteSchema);