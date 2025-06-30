const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Add Friend (Students only)
router.post(
  "/add/:friendId",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      const user = await User.findById(req.user.id);
      const friend = await User.findById(friendId);
      if (!friend || friend.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }
      if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: "Already friends" });
      }
      user.friends.push(friendId);
      friend.friends.push(req.user.id);
      await user.save();
      await friend.save();
      res.json({ message: "Friend added" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get Friends (Students only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "username email"
    );
    res.json(user.friends);
  }
);

module.exports = router;
