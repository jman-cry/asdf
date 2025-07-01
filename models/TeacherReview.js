const mongoose = require("mongoose");

const teacherReviewSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  callType: {
    type: String,
    enum: ['one-to-one', 'group'],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per student per teacher
teacherReviewSchema.index({ teacher: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("TeacherReview", teacherReviewSchema);