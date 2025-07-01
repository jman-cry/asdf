const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["one-to-one", "group"], 
    required: true 
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  }],
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending",
  },
  callId: { 
    type: String, 
    required: true,
    unique: true
  },
  pointsCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    min: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
videoCallSchema.index({ participants: 1 });
videoCallSchema.index({ status: 1 });
videoCallSchema.index({ createdAt: -1 });

// Calculate duration when call ends
videoCallSchema.methods.calculateDuration = function() {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
  }
};

module.exports = mongoose.model("VideoCall", videoCallSchema);