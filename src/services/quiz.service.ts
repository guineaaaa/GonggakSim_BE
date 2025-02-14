import { QuizRepository } from "../repositories/quiz.repository.js";

const repository = new QuizRepository();
const SUBJECT_OPTIONAL_CERTIFICATIONS = ["TOEIC", "한국사능력검정시험 심화", "한국사능력검정시험 기본", "정보처리기사 필기"];

export class QuizService {
  async getQuizzesByCertificationAndType(
    certificationNames: string[],
    subjects: string[],
    quizTypes: string[],
    userId: number
  ) {
    try {
      // ✅ "알림만"이 포함된 경우, MongoDB 조회 없이 즉시 응답 반환
      if (quizTypes.includes("알림만")) {
        console.log(`✅ '알림만' 선택 → 시험 일정 알림 제공`);
        return {
          isNotification: true,
          certificationName: certificationNames[0], // ✅ 응시하는 자격증 이름 반환
          message: "시험이 얼마 남지 않았어요!",
        };
      }

      // ✅ 특정 자격증이면 subjects를 강제로 "1과목"으로 변경
      if (certificationNames.some(cert => SUBJECT_OPTIONAL_CERTIFICATIONS.includes(cert))) {
        console.log(`🔹 ${certificationNames}는 특정 자격증이므로 "1과목"으로 변경`);
        subjects = ["1과목"];
      }

      // ✅ 랜덤 선택된 `selectedQuizType`으로 퀴즈 조회
      const selectedQuizType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
      let quizzes = await repository.findQuizzesByCertification(
        certificationNames,
        [selectedQuizType], // ✅ 단일 퀴즈 유형만 검색
        subjects,
        userId
      );

      // ✅ 퀴즈가 없을 경우
      if (!quizzes || quizzes.length === 0) {
        console.log(`❌ 선택된 퀴즈 유형 (${selectedQuizType})에 대한 퀴즈 없음`);
        return {
          success: false,
          message: `출제할 퀴즈가 없습니다. 선택된 유형: ${selectedQuizType}`,
        };
      }

      // ✅ 랜덤하게 하나의 퀴즈 선택
      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      // ✅ 해당 퀴즈 ID를 사용자의 푼 퀴즈 목록에 저장
      await repository.saveUserAttemptedQuiz(userId, certificationNames[0], selectedQuizType, randomQuiz.id);

      return {
        success: true,
        data: randomQuiz
      };
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
