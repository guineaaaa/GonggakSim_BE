import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  quizRangeId: { type: Number, required: true }, // Prisma QuizRange의 ID
  question: { type: String, required: true },    // 문제 내용
  options: [{ type: String }],                  // 선택지 배열
  correctAnswer: { type: String, required: true }, // 정답
  explanation: { type: String },                // 해설
  createdAt: { type: Date, default: Date.now },
});

// 모델 생성성
const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

// 모델 내보내기
export default QuizQuestion;