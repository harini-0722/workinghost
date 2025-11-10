const mongoose = require('mongoose');

const headSchema = new mongoose.Schema({
    name: String,
    position: String,
    council: String, // 'scitech', 'cultural', 'sports', 'academic'
    imageUrl: String,
});

module.exports = mongoose.model("Head", headSchema);