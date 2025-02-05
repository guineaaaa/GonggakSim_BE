import { QuizRepository } from "../repositories/quiz.repository.js";

const repository = new QuizRepository();

export class QuizService {
  async getQuizzesByCertificationAndType(certificationNames: string[], subjects: string[], quizTypes: string[], userId: number) {
    try {
      let quizzes = await repository.findQuizzesByCertification(certificationNames, quizTypes, subjects, userId);

      if (!quizzes || quizzes.length === 0) {
        console.log(`✅ 사용자가 모든 퀴즈를 푼 것으로 보임. 퀴즈 데이터 초기화 필요.`);
        return { message: "모든 퀴즈를 완료했습니다. 새로운 퀴즈를 추가하거나, 기록을 초기화해주세요." };
      }

      // ✅ 랜덤하게 하나의 퀴즈 선택
      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      // ✅ 해당 퀴즈 ID를 사용자의 푼 퀴즈 목록에 저장
      await repository.saveUserAttemptedQuiz(userId, certificationNames[0], quizTypes[0], randomQuiz.id);

      return randomQuiz;
    } catch (error) {
      console.error("❌ 퀴즈 서비스에서 오류 발생:", error);
      throw new Error("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }

  // 특정 퀴즈의 정답 조회
  async getQuizAnswer(certification: string, quizType: string, quizId: number) {
    try {
      const quizData = await repository.getQuizById(certification, quizType, quizId);
      return quizData ? quizData.answer : null;
    } catch (error) {
      console.error("❌ 퀴즈 정답 조회 중 오류 발생:", error);
      throw new Error("퀴즈 정답을 가져오는 중 오류가 발생했습니다.");
    }
  }
}
