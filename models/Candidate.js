const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: String,
    position: String, // e.g., "For President"
    description: String,
    imageUrl: String,
});

module.exports = mongoose.model("Candidate", candidateSchema);