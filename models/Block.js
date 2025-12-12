const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockName: { type: String, required: true },
    blockKey: { type: String, required: true, unique: true },
    blockTheme: { type: String, required: true },
    
    blockCapacity: { type: Number, required: true, default: 0 }, // Max Students Capacity
    // --- NEW FIELD FOR ROOM LIMIT ---
    maxRooms: { type: Number, required: true, default: 0 },

    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room' 
    }]
  },
  { timestamps: true }
);

const Block = mongoose.model("Block", blockSchema);
module.exports = Block;