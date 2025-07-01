const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Section = require("../models/Section");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateProject, validateSection, validateObjectId } = require("../middleware/validation");
const path = require("path");
const fs = require("fs");

// File validation for PDFs
const validatePDF = (req, res, next) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const { pdf } = req.files;
  const pdfExt = path.extname(pdf.name).toLowerCase();
  
  if (pdfExt !== '.pdf') {
    return res.status(400).json({ message: "Invalid file format. Only PDF files allowed" });
  }
  
  if (pdf.size > 10 * 1024 * 1024) { // 10MB
    return res.status(400).json({ message: "PDF file too large. Maximum 10MB allowed" });
  }

  next();
};

// Create Project (Admin only)
router.post("/", authMiddleware, roleMiddleware(["admin"]), validateProject, async (req, res) => {
  const { title } = req.body;
  
  try {
    const project = new Project({ title, createdBy: req.user.id });
    await project.save();
    
    console.log(`Project created: ${title} by user ${req.user.id}`);
    res.status(201).json(project);
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Add Section (Admin only)
router.post("/:projectId/sections", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateSection,
  validatePDF
], async (req, res) => {
  const { title } = req.body;
  const { projectId } = req.params;
  
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { pdf } = req.files;
    
    // Generate unique filename
    const timestamp = Date.now();
    const pdfExt = path.extname(pdf.name);
    const pdfFilename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${pdfExt}`;
    const pdfPath = `/uploads/pdfs/${pdfFilename}`;

    try {
      await pdf.mv(`.${pdfPath}`);
    } catch (fileError) {
      console.error("File upload error:", fileError);
      return res.status(500).json({ message: "Failed to upload PDF" });
    }

    const section = new Section({
      title,
      pdfUrl: pdfPath,
      project: projectId,
    });

    await section.save();
    project.sections.push(section._id);
    await project.save();

    console.log(`Section added: ${title} to project ${projectId}`);
    res.status(201).json(section);
  } catch (error) {
    console.error("Section creation error:", error);
    res.status(500).json({ message: "Failed to add section" });
  }
});

// Get Projects (Students only)
router.get("/", authMiddleware, roleMiddleware(["student"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({
      _id: { $in: user.enrolledCourses }, // Note: Using enrolledCourses for projects too
    }).populate("sections");

    res.json(projects);
  } catch (error) {
    console.error("Projects fetch error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Get All Projects (Admin only)
router.get("/all", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const projects = await Project.find().populate("sections").populate("createdBy", "username");
    res.json(projects);
  } catch (error) {
    console.error("All projects fetch error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Enroll in Project (Students only)
router.post("/enroll/:projectId", [
  authMiddleware,
  roleMiddleware(["student"]),
  validateObjectId
], async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const user = await User.findById(req.user.id);
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (user.enrolledCourses.includes(projectId)) {
      return res.status(400).json({ message: "Already enrolled in this project" });
    }

    user.enrolledCourses.push(projectId);
    await user.save();

    console.log(`User ${req.user.id} enrolled in project ${projectId}`);
    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Project enrollment error:", error);
    res.status(500).json({ message: "Failed to enroll in project" });
  }
});

// Update Project (Admin only)
router.put("/:id", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateObjectId,
  validateProject
], async (req, res) => {
  const { title } = req.body;
  
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log(`Project updated: ${req.params.id}`);
    res.json(project);
  } catch (error) {
    console.error("Project update error:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete Project (Admin only)
router.delete("/:id", [
  authMiddleware,
  roleMiddleware(["admin"]),
  validateObjectId
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("sections");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete associated files
    for (const section of project.sections) {
      if (section.pdfUrl && fs.existsSync(`.${section.pdfUrl}`)) {
        fs.unlinkSync(`.${section.pdfUrl}`);
      }
      await Section.findByIdAndDelete(section._id);
    }

    await Project.findByIdAndDelete(req.params.id);

    // Remove from users' enrolled courses
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    console.log(`Project deleted: ${req.params.id}`);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Project deletion error:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;