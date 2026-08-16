import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  questions: string[];
  answers: string[];
  scores: {
    overall: number;
    relevance: number;
    fluency: number;
    confidence: number;
  };
  feedback: string;
  strengths?: string;
  improvements?: string;
  finalFeedback?: string;
  createdAt: Date;
  status: 'in_progress' | 'completed';
  currentStage: 'intro' | 'experience' | 'project' | 'skills' | 'technical' | 'advanced' | 'closing';
  messages: {
    role: 'system' | 'user' | 'model';
    content: string;
    timestamp: Date;
  }[];
  startTime?: Date;
  durationSeconds?: number;
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      required: true,
    },
    questions: [{ type: String }],
    answers: [{ type: String }],
    scores: {
      overall: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      fluency: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    feedback: { type: String, default: '' },
    strengths: { type: String },
    improvements: { type: String },
    finalFeedback: { type: String },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    currentStage: {
      type: String,
      enum: ['intro', 'experience', 'project', 'skills', 'technical', 'advanced', 'closing'],
      default: 'intro',
    },
    messages: [
      {
        role: { type: String, enum: ['system', 'user', 'model'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    startTime: { type: Date },
    durationSeconds: { type: Number, default: 120 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
