const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: String,
    position: String,
    description: String,
    imageUrl: String,
});

module.exports = mongoose.model("Member", memberSchema);