const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  oneToOnePoints: { type: Number, default: 100 }, // Points for one-to-one calls
  groupPoints: { type: Number, default: 100 }, // Points for group calls
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
