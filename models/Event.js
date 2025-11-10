const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: String,
    dateTag: String,
    description: String,
    imageUrl: String,
});

module.exports = mongoose.model("Event", eventSchema);