const express = require("express");
const router = express.Router();
const VideoCall = require("../models/VideoCall");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { v4: uuidv4 } = require("uuid");

// Initiate One-to-One Call (Students only)
router.post(
  "/one-to-one",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const { teacherId } = req.body;
    try {
      const student = await User.findById(req.user.id);
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ message: "Invalid teacher" });
      }
      if (student.oneToOnePoints < 10) {
        return res
          .status(400)
          .json({ message: "Insufficient one-to-one points" });
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
      student.oneToOnePoints -= 10;
      await student.save();
      res.json(videoCall);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Initiate Group Call (Students only)
router.post(
  "/group",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const { teacherId, participantIds } = req.body; // participantIds: array of student IDs
    try {
      const student = await User.findById(req.user.id);
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ message: "Invalid teacher" });
      }
      if (participantIds.length > 4) {
        return res
          .status(400)
          .json({ message: "Max 5 students in group call" });
      }
      if (student.groupPoints < 20) {
        return res.status(400).json({ message: "Insufficient group points" });
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
      student.groupPoints -= 20;
      await student.save();

      // Deduct points from invited students
      for (const id of participantIds) {
        const invitedStudent = await User.findById(id);
        if (invitedStudent && invitedStudent.groupPoints >= 20) {
          invitedStudent.groupPoints -= 20;
          await invitedStudent.save();
        }
      }

      res.json(videoCall);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Respond to Call (Teachers only)
router.post(
  "/respond/:callId",
  authMiddleware,
  roleMiddleware(["teacher"]),
  async (req, res) => {
    const { callId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    try {
      const videoCall = await VideoCall.findById(callId);
      if (!videoCall || !videoCall.participants.includes(req.user.id)) {
        return res
          .status(400)
          .json({ message: "Invalid call or unauthorized" });
      }
      if (videoCall.status !== "pending") {
        return res.status(400).json({ message: "Call already responded" });
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
          for (const id of videoCall.participants) {
            if (
              id.toString() !== videoCall.initiator.toString() &&
              id.toString() !== req.user.id.toString()
            ) {
              const invitedStudent = await User.findById(id);
              invitedStudent.groupPoints += videoCall.pointsCost;
              await invitedStudent.save();
            }
          }
        }
        await initiator.save();
      }
      res.json(videoCall);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
