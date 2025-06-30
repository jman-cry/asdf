const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema({
  type: { type: String, enum: ["one-to-one", "group"], required: true },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  callId: { type: String, required: true }, // Unique call ID for WebRTC
  pointsCost: { type: Number, required: true }, // Points deducted for the call
});

module.exports = mongoose.model("VideoCall", videoCallSchema);
