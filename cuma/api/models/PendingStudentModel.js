import mongoose from 'mongoose';

const pendingStudentSchema = new mongoose.Schema({
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
  major: {
    type: String,
    required: true,
  },
  proofOfEnrollment: {
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

const PendingStudent = mongoose.model('PendingStudent', pendingStudentSchema);

export default PendingStudent;