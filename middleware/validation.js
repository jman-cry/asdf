const { body, param, validationResult } = require('express-validator');

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

const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role must be admin, teacher, or student'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateCourse = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Course title must be between 1 and 200 characters'),
  handleValidationErrors
];

const validateLesson = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Lesson title must be between 1 and 200 characters'),
  param('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  handleValidationErrors
];

const validateProject = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Project title must be between 1 and 200 characters'),
  handleValidationErrors
];

const validateSection = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Section title must be between 1 and 200 characters'),
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  handleValidationErrors
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validateFriendId = [
  param('friendId')
    .isMongoId()
    .withMessage('Invalid friend ID'),
  handleValidationErrors
];

const validateVideoCall = [
  body('teacherId')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  handleValidationErrors
];

const validateGroupCall = [
  body('teacherId')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  body('participantIds')
    .isArray({ min: 1, max: 4 })
    .withMessage('Participant IDs must be an array with 1-4 elements'),
  body('participantIds.*')
    .isMongoId()
    .withMessage('Each participant ID must be valid'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateCourse,
  validateLesson,
  validateProject,
  validateSection,
  validateObjectId,
  validateFriendId,
  validateVideoCall,
  validateGroupCall,
  handleValidationErrors
};