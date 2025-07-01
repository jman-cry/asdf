const express = require("express");
const router = express.Router();
const VideoCall = require("../models/VideoCall");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateVideoCall, validateGroupCall, validateObjectId } = require("../middleware/validation");
const { v4: uuidv4 } = require("uuid");

// Initiate One-to-One Call (Students only)
router.post("/one-to-one", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateVideoCall
], async (req, res) => {
  const { teacherId } = req.body;
  
  try {
    const student = await User.findById(req.user.id);
    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    if (student.oneToOnePoints < 10) {
      return res.status(400).json({ 
        message: "Insufficient one-to-one points. You need 10 points to initiate a call." 
      });
    }

    // Check for existing pending calls
    const existingCall = await VideoCall.findOne({
      initiator: req.user.id,
      participants: teacherId,
      status: "pending"
    });

    if (existingCall) {
      return res.status(400).json({ message: "You already have a pending call with this teacher" });
    }

    const callId = uuidv4();
    const videoCall = new VideoCall({
      type: "one-to-one",
      initiator: req.user.id,
      participants: [req.user.id, teacherId],
      callId,
      pointsCost: 10,
    });

    await videoCall.save();
    
    // Deduct points
    student.oneToOnePoints -= 10;
    await student.save();

    console.log(`One-to-one call initiated by ${req.user.id} with teacher ${teacherId}`);
    res.json(videoCall);
  } catch (error) {
    console.error("One-to-one call initiation error:", error);
    res.status(500).json({ message: "Failed to initiate call" });
  }
});

// Initiate Group Call (Students only)
router.post("/group", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateGroupCall
], async (req, res) => {
  const { teacherId, participantIds } = req.body;
  
  try {
    const student = await User.findById(req.user.id);
    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    if (participantIds.length > 4) {
      return res.status(400).json({ message: "Maximum 4 friends can join a group call" });
    }

    if (student.groupPoints < 20) {
      return res.status(400).json({ 
        message: "Insufficient group points. You need 20 points to initiate a group call." 
      });
    }

    // Validate all participant IDs are students and friends
    const participants = await User.find({
      _id: { $in: participantIds },
      role: "student"
    });

    if (participants.length !== participantIds.length) {
      return res.status(400).json({ message: "All participants must be valid students" });
    }

    // Check if all participants are friends
    const nonFriends = participantIds.filter(id => !student.friends.includes(id));
    if (nonFriends.length > 0) {
      return res.status(400).json({ message: "All participants must be your friends" });
    }

    // Check if all participants have enough points
    const insufficientPoints = participants.filter(p => p.groupPoints < 20);
    if (insufficientPoints.length > 0) {
      return res.status(400).json({ 
        message: "All participants must have at least 20 group points" 
      });
    }

    const callId = uuidv4();
    const videoCall = new VideoCall({
      type: "group",
      initiator: req.user.id,
      participants: [req.user.id, teacherId, ...participantIds],
      callId,
      pointsCost: 20,
    });

    await videoCall.save();

    // Deduct points from initiator
    student.groupPoints -= 20;
    await student.save();

    // Deduct points from invited students
    await User.updateMany(
      { _id: { $in: participantIds } },
      { $inc: { groupPoints: -20 } }
    );

    console.log(`Group call initiated by ${req.user.id} with teacher ${teacherId} and ${participantIds.length} friends`);
    res.json(videoCall);
  } catch (error) {
    console.error("Group call initiation error:", error);
    res.status(500).json({ message: "Failed to initiate group call" });
  }
});

// Get Call Requests (Teachers only)
router.get("/requests", authMiddleware, roleMiddleware(["teacher"]), async (req, res) => {
  try {
    const calls = await VideoCall.find({
      participants: req.user.id,
      status: "pending"
    }).populate("initiator", "username email");

    res.json(calls);
  } catch (error) {
    console.error("Call requests fetch error:", error);
    res.status(500).json({ message: "Failed to fetch call requests" });
  }
});

// Respond to Call (Teachers only)
router.post("/respond/:callId", [
  authMiddleware,
  roleMiddleware(["teacher"]),
  validateObjectId
], async (req, res) => {
  const { callId } = req.params;
  const { status } = req.body;
  
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
  }

  try {
    const videoCall = await VideoCall.findById(callId);
    
    if (!videoCall) {
      return res.status(404).json({ message: "Call not found" });
    }

    if (!videoCall.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized to respond to this call" });
    }

    if (videoCall.status !== "pending") {
      return res.status(400).json({ message: "Call has already been responded to" });
    }

    videoCall.status = status;
    await videoCall.save();

    if (status === "rejected") {
      // Refund points to initiator
      const initiator = await User.findById(videoCall.initiator);
      if (videoCall.type === "one-to-one") {
        initiator.oneToOnePoints += videoCall.pointsCost;
      } else {
        initiator.groupPoints += videoCall.pointsCost;
        
        // Refund points to invited students
        const participantIds = videoCall.participants.filter(
          id => id.toString() !== videoCall.initiator.toString() && id.toString() !== req.user.id.toString()
        );
        
        await User.updateMany(
          { _id: { $in: participantIds } },
          { $inc: { groupPoints: videoCall.pointsCost } }
        );
      }
      await initiator.save();
    }

    console.log(`Call ${callId} ${status} by teacher ${req.user.id}`);
    res.json({ message: `Call ${status} successfully`, call: videoCall });
  } catch (error) {
    console.error("Call response error:", error);
    res.status(500).json({ message: "Failed to respond to call" });
  }
});

// Get Call History
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const calls = await VideoCall.find({
      participants: req.user.id
    })
    .populate("initiator", "username")
    .populate("participants", "username")
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(calls);
  } catch (error) {
    console.error("Call history fetch error:", error);
    res.status(500).json({ message: "Failed to fetch call history" });
  }
});

module.exports = router;