const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateFriendId } = require("../middleware/validation");

// Add Friend (Students only)
router.post("/add/:friendId", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateFriendId
], async (req, res) => {
  const { friendId } = req.params;
  
  try {
    if (friendId === req.user.id) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (friend.role !== "student") {
      return res.status(400).json({ message: "You can only add students as friends" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    // Add bidirectional friendship
    user.friends.push(friendId);
    friend.friends.push(req.user.id);

    await user.save();
    await friend.save();

    console.log(`Friendship created between ${req.user.id} and ${friendId}`);
    res.json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ message: "Failed to add friend" });
  }
});

// Remove Friend (Students only)
router.delete("/remove/:friendId", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateFriendId
], async (req, res) => {
  const { friendId } = req.params;
  
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    // Remove bidirectional friendship
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.id);

    await user.save();
    await friend.save();

    console.log(`Friendship removed between ${req.user.id} and ${friendId}`);
    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ message: "Failed to remove friend" });
  }
});

// Get Friends (Students only)
router.get("/", authMiddleware, roleMiddleware(["student"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "username email _id"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.friends);
  } catch (error) {
    console.error("Friends fetch error:", error);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// Search Users (Students only)
router.get("/search", authMiddleware, roleMiddleware(["student"]), async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ message: "Search query must be at least 2 characters" });
  }

  try {
    const users = await User.find({
      role: "student",
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    })
    .select("username email _id")
    .limit(20);

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
});

module.exports = router;