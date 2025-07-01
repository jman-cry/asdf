const express = require("express");
const router = express.Router();
const User = require("../models/User");
const TeacherProfile = require("../models/Teacher");
const TeacherReview = require("../models/TeacherReview");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all teachers with basic info
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { subject, sortBy = 'rating', search } = req.query;
    
    let query = { isActive: true };
    
    // Filter by subject if provided
    if (subject) {
      query.subjects = { $regex: subject, $options: 'i' };
    }
    
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'ratings.average': -1, 'ratings.totalReviews': -1 };
        break;
      case 'experience':
        sortOptions = { experience: -1 };
        break;
      case 'name':
        sortOptions = { 'user.username': 1 };
        break;
      default:
        sortOptions = { 'ratings.average': -1 };
    }

    let teachers = await TeacherProfile.find(query)
      .populate('user', 'username email')
      .sort(sortOptions)
      .lean();

    // Filter by name if search provided
    if (search) {
      teachers = teachers.filter(teacher => 
        teacher.user.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Format response
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.user._id,
      name: teacher.user.username,
      email: teacher.user.email,
      subjects: teacher.subjects,
      experience: teacher.experience,
      rating: teacher.ratings.average,
      totalReviews: teacher.ratings.totalReviews,
      bio: teacher.bio ? teacher.bio.substring(0, 100) + (teacher.bio.length > 100 ? '...' : '') : '',
      isActive: teacher.isActive
    }));

    res.json(formattedTeachers);
  } catch (error) {
    console.error("Teachers fetch error:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// Get teacher details by ID
router.get("/:teacherId", [
  authMiddleware,
  param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const teacher = await User.findOne({ 
      _id: teacherId, 
      role: 'teacher' 
    }).select('username email createdAt');
    
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const profile = await TeacherProfile.findOne({ user: teacherId });
    
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    // Get recent reviews
    const reviews = await TeacherReview.find({ teacher: teacherId })
      .populate('student', 'username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedReviews = reviews.map(review => ({
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      studentName: review.isAnonymous ? 'Anonymous' : review.student.username,
      callType: review.callType,
      date: review.createdAt
    }));

    const teacherDetails = {
      id: teacher._id,
      name: teacher.username,
      email: teacher.email,
      joinedDate: teacher.createdAt,
      subjects: profile.subjects,
      bio: profile.bio,
      qualifications: profile.qualifications,
      experience: profile.experience,
      specializations: profile.specializations,
      availability: profile.availability,
      contactInfo: profile.contactInfo,
      ratings: profile.ratings,
      recentReviews: formattedReviews,
      isActive: profile.isActive
    };

    res.json(teacherDetails);
  } catch (error) {
    console.error("Teacher details fetch error:", error);
    res.status(500).json({ message: "Failed to fetch teacher details" });
  }
});

// Get available subjects
router.get("/subjects/list", authMiddleware, async (req, res) => {
  try {
    const subjects = await TeacherProfile.distinct('subjects', { isActive: true });
    res.json(subjects.sort());
  } catch (error) {
    console.error("Subjects fetch error:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// Create/Update teacher profile (Teachers only)
router.post("/profile", [
  authMiddleware,
  roleMiddleware(["teacher"]),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      subjects,
      bio,
      qualifications,
      experience,
      specializations,
      availability,
      contactInfo
    } = req.body;

    let profile = await TeacherProfile.findOne({ user: req.user.id });
    
    if (profile) {
      // Update existing profile
      profile.subjects = subjects;
      profile.bio = bio;
      profile.qualifications = qualifications || [];
      profile.experience = experience || 0;
      profile.specializations = specializations || [];
      profile.availability = availability || {};
      profile.contactInfo = contactInfo || {};
      
      await profile.save();
    } else {
      // Create new profile
      profile = new TeacherProfile({
        user: req.user.id,
        subjects,
        bio,
        qualifications: qualifications || [],
        experience: experience || 0,
        specializations: specializations || [],
        availability: availability || {},
        contactInfo: contactInfo || {}
      });
      
      await profile.save();
    }

    console.log(`Teacher profile updated for user ${req.user.id}`);
    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Teacher profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Add teacher review (Students only)
router.post("/:teacherId/review", [
  authMiddleware,
  roleMiddleware(["student"]),
  param('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters'),
  body('callType').isIn(['one-to-one', 'group']).withMessage('Invalid call type'),
  body('isAnonymous').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { rating, comment, callType, isAnonymous = false } = req.body;

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if review already exists
    const existingReview = await TeacherReview.findOne({
      teacher: teacherId,
      student: req.user.id
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.callType = callType;
      existingReview.isAnonymous = isAnonymous;
      await existingReview.save();
    } else {
      // Create new review
      const review = new TeacherReview({
        teacher: teacherId,
        student: req.user.id,
        rating,
        comment,
        callType,
        isAnonymous
      });
      await review.save();
    }

    // Update teacher's average rating
    const reviews = await TeacherReview.find({ teacher: teacherId });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await TeacherProfile.findOneAndUpdate(
      { user: teacherId },
      {
        'ratings.average': Math.round(averageRating * 10) / 10,
        'ratings.totalReviews': reviews.length
      }
    );

    console.log(`Review ${existingReview ? 'updated' : 'added'} for teacher ${teacherId} by student ${req.user.id}`);
    res.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Teacher review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

module.exports = router;