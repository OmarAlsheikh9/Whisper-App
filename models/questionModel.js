import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  // Optional relations you might need
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null handles anonymous questions
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 500
  },
  answer: {
    type: String,
    default: null,
    maxLength: 1000,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'ignored'],
    default: 'pending',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    required: true
  },
  answeredAt: {
    type: Date,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

QuestionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Add text index for keyword search on body and answer
QuestionSchema.index({ body: 'text', answer: 'text' });

const Question = mongoose.model('Question', QuestionSchema);
export default Question;