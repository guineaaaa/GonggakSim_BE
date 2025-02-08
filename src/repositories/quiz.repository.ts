import { db } from "../firebase.js";

const SUBJECT_OPTIONAL_CERTIFICATIONS = ["TOEIC", "한국사능력검정시험 심화", "한국사능력검정시험 기본"];

export class QuizRepository {
  // 특정 자격증, 퀴즈 유형, 과목에 맞는 퀴즈 조회 (중복 방지 포함)
  async findQuizzesByCertification(
    certificationNames: string[],
    quizTypes: string[],
    subjects: string[],
    userId: number
  ) {
    let queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];

    try {
      for (let certName of certificationNames) {
        for (let quizType of quizTypes) {
          const isSubjectOptional = SUBJECT_OPTIONAL_CERTIFICATIONS.includes(certName);

          let query = db.collectionGroup(quizType)
            .where("certification_name", "==", certName)
            .where("question_id", ">=", 1001); // question_id가 1001 이상인 퀴즈만 가져옴

          if (!isSubjectOptional && subjects.length > 0) {
            query = query.where("subject", "in", subjects);
          }

          queries.push(query.get());
        }
      }

      const results = await Promise.all(queries);
      let quizzes: any[] = [];

      results.forEach(snapshot => {
        if (!snapshot.empty) {
          snapshot.docs.forEach(doc => {
            quizzes.push({ id: doc.id, ...doc.data() });
          });
        }
      });

      if (quizzes.length === 0) {
        console.log(`검색된 데이터 없음 → 자격증: ${certificationNames}, 퀴즈 유형: ${quizTypes}, 과목: ${subjects}`);
        return [];
      }

      // 사용자가 이미 푼 퀴즈 ID 가져오기
      const attemptedQuizIds = await this.getUserAttemptedQuizzes(userId, certificationNames, quizTypes);

      // 중복되지 않은 퀴즈 필터링
      const newQuizzes = quizzes.filter(quiz => !attemptedQuizIds.includes(quiz.id));

      return newQuizzes;
    } catch (error) {
      console.error("Firestore에서 퀴즈 가져오기 실패:", error);
      throw new Error("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }

  // 사용자가 푼 퀴즈 ID 조회
  async getUserAttemptedQuizzes(userId: number, certificationNames: string[], quizTypes: string[]) {
    let attemptedQuizIds: string[] = [];

    try {
      for (let certName of certificationNames) {
        for (let quizType of quizTypes) {
          const docRef = db.collection(`user/${userId}/attemptedQuizzes`).doc(`${certName}_${quizType}`);
          const docSnapshot = await docRef.get();

          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data && data.quizIds) {
              attemptedQuizIds = [...attemptedQuizIds, ...data.quizIds];
            }
          }
        }
      }
    } catch (error) {
      console.error("사용자의 푼 퀴즈 조회 중 오류 발생:", error);
    }

    return attemptedQuizIds;
  }

  // 사용자가 푼 퀴즈를 Firestore에 저장
  async saveUserAttemptedQuiz(userId: number, certificationName: string, quizType: string, quizId: string) {
    try {
      const docRef = db.collection(`user/${userId}/attemptedQuizzes`).doc(`${certificationName}_${quizType}`);

      // 기존 퀴즈 ID 리스트 가져오기
      const docSnapshot = await docRef.get();
      let existingQuizIds: string[] = [];

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        existingQuizIds = data?.quizIds || [];
      }

      // 퀴즈 ID 추가 후 업데이트
      existingQuizIds.push(quizId);

      await docRef.set({ quizIds: existingQuizIds }, { merge: true });

      console.log(`✅ 사용자의 푼 퀴즈 저장 완료 → userId: ${userId}, 퀴즈ID: ${quizId}`);
    } catch (error) {
      console.error("푼 퀴즈 저장 실패:", error);
    }
  }

  // 특정 퀴즈 ID의 정답 조회
  async getQuizById(certification: string, quizType: string, quizId: number) {
    try {
      const docRef = db
        .collection("quizzes")
        .doc(certification)
        .collection(quizType)
        .doc(String(quizId));

      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.log(`퀴즈 ${quizId}를 찾을 수 없음`);
        return null;
      }

      return docSnap.data();
    } catch (error) {
      console.error("Firestore에서 퀴즈 데이터 가져오기 실패:", error);
      throw new Error("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }
}