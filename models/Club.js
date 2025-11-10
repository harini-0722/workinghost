const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: String,
    council: String, // 'scitech', 'cultural', 'sports', 'academic'
    icon: String, // e.g., 'fas fa-robot'
});

module.exports = mongoose.model("Club", clubSchema);