import mongoose from 'mongoose';

// 퀴즈 모델 정의
const quizSchema = new mongoose.Schema({
  certification_name: String,
  quiz_type: String,
  question_id: { type: String, unique: true },
  question: String,
  answer: String,
  options: [String],  // 선택지가 있는 경우
  subject: String,
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;