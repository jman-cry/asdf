const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Course (Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    try {
      const course = new Course({ title, createdBy: req.user.id });
      await course.save();
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Add Lesson (Admin only)
router.post(
  "/:courseId/lessons",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    const { courseId } = req.params;
    try {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const video = req.files?.video;
      const pdf = req.files?.pdf;
      if (!video || !pdf)
        return res.status(400).json({ message: "Video and PDF required" });

      const videoPath = `/uploads/videos/${Date.now()}_${video.name}`;
      const pdfPath = `/uploads/pdfs/${Date.now()}_${pdf.name}`;
      video.mv(`.${videoPath}`, (err) => {
        if (err) throw err;
      });
      pdf.mv(`.${pdfPath}`, (err) => {
        if (err) throw err;
      });

      const lesson = new Lesson({
        title,
        videoUrl: videoPath,
        pdfUrl: pdfPath,
        course: courseId,
      });
      await lesson.save();
      course.lessons.push(lesson._id);
      await course.save();
      res.status(201).json(lesson);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get Courses (Students only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    const courses = await Course.find({
      _id: { $in: user.enrolledCourses },
    }).populate("lessons");
    res.json(courses);
  }
);

// Enroll in Course (Students only)
router.post(
  "/enroll/:courseId",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const { courseId } = req.params;
    try {
      const user = await User.findById(req.user.id);
      if (user.enrolledCourses.includes(courseId)) {
        return res.status(400).json({ message: "Already enrolled" });
      }
      user.enrolledCourses.push(courseId);
      await user.save();
      res.json({ message: "Enrolled successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// CRUD for Courses and Lessons (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { title },
        { new: true }
      );
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  }
);

module.exports = router;
