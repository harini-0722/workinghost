const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    
    // Link to the ElectionPost it is running for
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ElectionPost', 
        required: true 
    },
    
    rollno: { type: String },
    manifesto: { type: String },
    imageUrl: { type: String },

    // We'll track votes in a separate collection, but keep a counter here for simplicity in this model
    voteCount: { type: Number, default: 0 } 
});

module.exports = mongoose.model("Candidate", candidateSchema);