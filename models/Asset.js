// models/Asset.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // No two assets can have the same name (e.g., "Chair")
        trim: true
    },
    type: {
        type: String,
        required: true, // "Chair", "Table", "Other", etc.
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String // Path to the uploaded image, e.g., /uploads/asset-123.jpg
    }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);