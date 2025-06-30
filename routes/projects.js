const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Section = require("../models/Section");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Project (Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    try {
      const project = new Project({ title, createdBy: req.user.id });
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Add Section (Admin only)
router.post(
  "/:projectId/sections",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    const { projectId } = req.params;
    try {
      const project = await Project.findById(projectId);
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const pdf = req.files?.pdf;
      if (!pdf) return res.status(400).json({ message: "PDF required" });

      const pdfPath = `/uploads/pdfs/${Date.now()}_${pdf.name}`;
      pdf.mv(`.${pdfPath}`, (err) => {
        if (err) throw err;
      });

      const section = new Section({
        title,
        pdfUrl: pdfPath,
        project: projectId,
      });
      await section.save();
      project.sections.push(section._id);
      await project.save();
      res.status(201).json(section);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get Projects (Students only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    const projects = await Project.find({
      _id: { $in: user.enrolledCourses },
    }).populate("sections");
    res.json(projects);
  }
);

// Enroll in Project (Students only)
router.post(
  "/enroll/:projectId",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const { projectId } = req.params;
    try {
      const user = await User.findById(req.user.id);
      if (user.enrolledCourses.includes(projectId)) {
        return res.status(400).json({ message: "Already enrolled" });
      }
      user.enrolledCourses.push(projectId);
      await user.save();
      res.json({ message: "Enrolled successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// CRUD for Projects and Sections (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { title } = req.body;
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { title },
        { new: true }
      );
      res.json(project);
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
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  }
);

module.exports = router;
