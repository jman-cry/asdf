const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateCourse, validateLesson, validateObjectId } = require("../middleware/validation");
const path = require("path");
const fs = require("fs");

// File validation helper
const validateFiles = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const { video, pdf } = req.files;
  
  if (video) {
    const allowedVideoTypes = ['.mp4', '.avi', '.mov', '.wmv'];
    const videoExt = path.extname(video.name).toLowerCase();
    if (!allowedVideoTypes.includes(videoExt)) {
      return res.status(400).json({ message: "Invalid video format. Only MP4, AVI, MOV, WMV allowed" });
    }
    if (video.size > 100 * 1024 * 1024) { // 100MB
      return res.status(400).json({ message: "Video file too large. Maximum 100MB allowed" });
    }
  }

  if (pdf) {
    const pdfExt = path.extname(pdf.name).toLowerCase();
    if (pdfExt !== '.pdf') {
      return res.status(400).json({ message: "Invalid PDF format" });
    }
    if (pdf.size > 10 * 1024 * 1024) { // 10MB
      return res.status(400).json({ message: "PDF file too large. Maximum 10MB allowed" });
    }
  }

  next();
};

// Create Course (Admin only)
router.post("/", authMiddleware, roleMiddleware(["admin"]), validateCourse, async (req, res) => {
  const { title } = req.body;
  
  try {
    const course = new Course({ title, createdBy: req.user.id });
    await course.save();
    
    console.log(`Course created: ${title} by user ${req.user.id}`);
    res.status(201).json(course);
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
});

// Add Lesson (Admin only)
router.post("/:courseId/lessons", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateLesson,
  validateFiles
], async (req, res) => {
  const { title } = req.body;
  const { courseId } = req.params;
  
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { video, pdf } = req.files;
    if (!video || !pdf) {
      return res.status(400).json({ message: "Both video and PDF files are required" });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const videoExt = path.extname(video.name);
    const pdfExt = path.extname(pdf.name);
    
    const videoFilename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${videoExt}`;
    const pdfFilename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${pdfExt}`;
    
    const videoPath = `/uploads/videos/${videoFilename}`;
    const pdfPath = `/uploads/pdfs/${pdfFilename}`;

    // Move files with error handling
    try {
      await video.mv(`.${videoPath}`);
      await pdf.mv(`.${pdfPath}`);
    } catch (fileError) {
      console.error("File upload error:", fileError);
      return res.status(500).json({ message: "Failed to upload files" });
    }

    const lesson = new Lesson({
      title,
      videoUrl: videoPath,
      pdfUrl: pdfPath,
      course: courseId,
    });

    await lesson.save();
    course.lessons.push(lesson._id);
    await course.save();

    console.log(`Lesson added: ${title} to course ${courseId}`);
    res.status(201).json(lesson);
  } catch (error) {
    console.error("Lesson creation error:", error);
    res.status(500).json({ message: "Failed to add lesson" });
  }
});

// Get Courses (Students only)
router.get("/", authMiddleware, roleMiddleware(["student"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courses = await Course.find({
      _id: { $in: user.enrolledCourses },
    }).populate("lessons");

    res.json(courses);
  } catch (error) {
    console.error("Courses fetch error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Get All Courses (Admin only)
router.get("/all", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const courses = await Course.find().populate("lessons").populate("createdBy", "username");
    res.json(courses);
  } catch (error) {
    console.error("All courses fetch error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Enroll in Course (Students only)
router.post("/enroll/:courseId", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateObjectId
], async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    user.enrolledCourses.push(courseId);
    await user.save();

    console.log(`User ${req.user.id} enrolled in course ${courseId}`);
    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Course enrollment error:", error);
    res.status(500).json({ message: "Failed to enroll in course" });
  }
});

// Update Course (Admin only)
router.put("/:id", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateObjectId,
  validateCourse
], async (req, res) => {
  const { title } = req.body;
  
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log(`Course updated: ${req.params.id}`);
    res.json(course);
  } catch (error) {
    console.error("Course update error:", error);
    res.status(500).json({ message: "Failed to update course" });
  }
});

// Delete Course (Admin only)
router.delete("/:id", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateObjectId
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("lessons");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete associated files
    for (const lesson of course.lessons) {
      if (lesson.videoUrl && fs.existsSync(`.${lesson.videoUrl}`)) {
        fs.unlinkSync(`.${lesson.videoUrl}`);
      }
      if (lesson.pdfUrl && fs.existsSync(`.${lesson.pdfUrl}`)) {
        fs.unlinkSync(`.${lesson.pdfUrl}`);
      }
      await Lesson.findByIdAndDelete(lesson._id);
    }

    await Course.findByIdAndDelete(req.params.id);

    // Remove from users' enrolled courses
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    console.log(`Course deleted: ${req.params.id}`);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Course deletion error:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

module.exports = router;