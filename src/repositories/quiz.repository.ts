import Quiz from "../models/QuizQuestion.js";
import AttemptedQuiz from "../models/AttemptedQuiz.js";

const SUBJECT_OPTIONAL_CERTIFICATIONS = ["TOEIC", "한국사능력검정시험 심화", "한국사능력검정시험 기본"];

export class QuizRepository {
  // 특정 자격증, 퀴즈 유형, 과목에 맞는 퀴즈 조회 (중복 방지 포함)
  async findQuizzesByCertification(
    certificationNames: string[],
    quizTypes: string[],
    subjects: string[],
    userId: number
  ) {
    try {
      let quizzes: any[] = [];

      for (const certName of certificationNames) {
        for (const quizType of quizTypes) {
          const isSubjectOptional = SUBJECT_OPTIONAL_CERTIFICATIONS.includes(certName);

          const filter: any = {
            certification_name: certName,
            quiz_type: quizType,
            question_id: { $gte: "1001" } // ✅ 문자열 비교 가능하도록 유지
          };

          // ✅ 특정 과목 제한된 자격증은 무조건 "1과목"으로 강제 설정
          if (isSubjectOptional) {
            filter.subject = "1과목";
          } else if (subjects.length > 0) {
            filter.subject = { $in: subjects }; // ✅ 사용자가 선택한 과목 리스트 반영
          }

          console.log(`🔍 필터링 조건:`, filter); // 디버깅용 로그 추가

          const docs = await Quiz.find(filter).exec();
          quizzes.push(...docs);
        }
      }

      if (quizzes.length === 0) {
        console.log(`❌ 검색된 데이터 없음 → 자격증: ${certificationNames}, 퀴즈 유형: ${quizTypes}, 과목: ${subjects}`);
        return [];
      }

      // ✅ 사용자가 이미 푼 퀴즈 ID 가져오기 (최적화된 쿼리 사용)
      const attemptedQuizIds = await this.getUserAttemptedQuizzes(userId, certificationNames, quizTypes);

      // ✅ 중복되지 않은 퀴즈 필터링
      const newQuizzes = quizzes.filter(quiz => !attemptedQuizIds.includes(quiz.question_id));

      return newQuizzes;
    } catch (error) {
      console.error("❌ MongoDB에서 퀴즈 가져오기 실패:", error);
      throw new Error("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }


  // ✅ 사용자가 푼 퀴즈 ID 조회 (쿼리 최적화)
  async getUserAttemptedQuizzes(userId: number, certificationNames: string[], quizTypes: string[]) {
    try {
      const docs = await AttemptedQuiz.find(
        { 
          userId, 
          certification_name: { $in: certificationNames },
          quiz_type: { $in: quizTypes } 
        },
        { quizIds: 1, _id: 0 } // ✅ `quizIds` 필드만 가져오도록 최적화
      ).exec();

      // 🔹 여러 문서에서 `quizIds` 필드를 가져와 하나의 배열로 합치기
      return docs.flatMap(doc => doc.quizIds || []);
    } catch (error) {
      console.error("❌ 사용자의 푼 퀴즈 조회 중 오류 발생:", error);
      return [];
    }
  }

  // ✅ 사용자가 푼 퀴즈를 MongoDB에 저장
  async saveUserAttemptedQuiz(userId: number, certificationName: string, quizType: string, quizId: string) {
    try {
      await AttemptedQuiz.updateOne(
        { userId, certification_name: certificationName, quiz_type: quizType },
        { $addToSet: { quizIds: quizId } }, // ✅ 중복 방지
        { upsert: true }
      );
      console.log(`✅ 사용자의 푼 퀴즈 저장 완료 → userId: ${userId}, 퀴즈ID: ${quizId}`);
    } catch (error) {
      console.error("❌ 푼 퀴즈 저장 실패:", error);
    }
  }

  // ✅ 특정 퀴즈 ID의 정답 조회
  async getQuizById(certification: string, quizType: string, quizId: number) {
    try {
      const quiz = await Quiz.findOne({
        certification_name: certification,
        quiz_type: quizType,
        question_id: String(quizId) // 🔹 문제 ID를 문자열로 변환 후 조회
      }).exec();

      if (!quiz) {
        console.log(`❌ 퀴즈 ${quizId}를 찾을 수 없음`);
        return null;
      }
      return quiz;
    } catch (error) {
      console.error("❌ MongoDB에서 퀴즈 데이터 가져오기 실패:", error);
      throw new Error("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }
}
