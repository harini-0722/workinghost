const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockName: { type: String, required: true },
    blockKey: { type: String, required: true, unique: true },
    blockTheme: { type: String, required: true },
    
    blockCapacity: { type: Number, required: true, default: 0 }, // Correctly defined

    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room' 
    }]
  },
  { timestamps: true }
);

const Block = mongoose.model("Block", blockSchema);
module.exports = Block;