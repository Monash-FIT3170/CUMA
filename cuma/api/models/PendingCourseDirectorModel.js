import mongoose from 'mongoose';

const pendingCourseDirectorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true,
  },
  professionalTitle: {
    type: String,
    required: [true, 'Professional title is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true,
  },
  staffID: {
    type: String,
    required: [true, 'Staff ID is required'],
    trim: true,
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
});

pendingCourseDirectorSchema.index({ staffID: 1, university: 1 }, { unique: true });

pendingCourseDirectorSchema.index({ email: 1 }, { unique: true });

const PendingCourseDirector = mongoose.model('PendingCourseDirector', pendingCourseDirectorSchema);

export default PendingCourseDirector;