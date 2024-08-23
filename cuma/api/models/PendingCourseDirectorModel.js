import mongoose from 'mongoose';

const pendingCourseDirectorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  university: {
    type: String,
    required: true,
  },
  professionalTitle: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  proofOfEmployment: {
    type: String,
    required: true,
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
  },
});

const PendingCourseDirector = mongoose.model('PendingCourseDirector', pendingCourseDirectorSchema);

export default PendingCourseDirector;