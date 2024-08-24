import mongoose from 'mongoose';

const pendingStudentSchema = new mongoose.Schema({
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
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true,
  },
  studentID: {
    type: String,
    required: [true, 'Student ID is required'],
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

pendingStudentSchema.index({ studentID: 1, university: 1 }, { unique: true });

pendingStudentSchema.index({ email: 1 }, { unique: true });

const PendingStudent = mongoose.model('PendingStudent', pendingStudentSchema);

export default PendingStudent;