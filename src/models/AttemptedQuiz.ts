import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptedQuiz extends Document {
  userId: number;
  certification_name: string;
  quiz_type: string; // 추가된 필드
  quizIds: string[];
}

const AttemptedQuizSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  certification_name: { type: String, required: true },
  quiz_type: { type: String, required: true }, // 필드 추가
  quizIds: { type: [String], default: [] },
});

export default mongoose.model<IAttemptedQuiz>('AttemptedQuiz', AttemptedQuizSchema);
