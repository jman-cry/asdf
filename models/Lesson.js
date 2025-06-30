const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String }, // Path to locally stored MP4
  pdfUrl: { type: String }, // Path to locally stored PDF
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

module.exports = mongoose.model("Lesson", lessonSchema);
