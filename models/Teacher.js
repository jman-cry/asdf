const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  subjects: [{
    type: String,
    required: true,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // years of experience
    min: 0,
    default: 0
  },
  specializations: [{
    type: String,
    trim: true
  }],
  availability: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // Format: "09:00"
      endTime: String    // Format: "17:00"
    }]
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    officeHours: {
      type: String,
      trim: true
    },
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'video-call'],
      default: 'email'
    }
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
teacherProfileSchema.index({ subjects: 1 });
teacherProfileSchema.index({ 'ratings.average': -1 });
teacherProfileSchema.index({ experience: -1 });
teacherProfileSchema.index({ isActive: 1 });

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);