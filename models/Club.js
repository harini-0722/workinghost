const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    council: { type: String, required: true }, // 'scitech', 'cultural', 'sports', 'academic'
    // REPLACED: icon (String) with imageUrl (String)
    imageUrl: { type: String, required: true }, // Path to the uploaded image
});

module.exports = mongoose.model("Club", clubSchema);