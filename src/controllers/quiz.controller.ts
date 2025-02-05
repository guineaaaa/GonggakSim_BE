import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { QuizService } from "../services/quiz.service.js";

const service = new QuizService();

export const handleGetQuizzesByCertificationAndType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("✅ 특정 자격증 & 퀴즈 유형 & 과목 조회 요청");

  try {
    const { certifications, subjects, quizTypes, userId } = req.body;

    // ✅ 필수 입력값 검증
    if (!certifications || !quizTypes || !subjects || !userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "certifications, subjects, quizTypes, userId가 필요합니다.",
      });
      return;
    }

    // ✅ 퀴즈 검색 후 제공
    const quiz = await service.getQuizzesByCertificationAndType(certifications, subjects, quizTypes, userId);

    if (!quiz || quiz.message) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: quiz.message || `No quizzes found for certifications: ${certifications}, subjects: ${subjects}, quizTypes: ${quizTypes}`,
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// 퀴즈 정답 검증 api
export const handleValidateQuizAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("✅ 퀴즈 정답 검증 요청");

    // 🔹 리퀘스트 바디 데이터 구조
    const { userId, certification, quizTypes, quizId, answer } = req.body;

    // 🔹 필수 입력값 검증
    if (!userId || !certification || !quizTypes || !quizId || answer === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId, certification, quizTypes, quizId, answer가 필요합니다.",
      });
      return;
    }

    // 🔹 데이터베이스에서 정답 조회
    const correctAnswer = await service.getQuizAnswer(certification, quizTypes, quizId);

    // 🔹 정답이 존재하는지 확인
    if (correctAnswer === null) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `퀴즈 ID ${quizId}에 대한 정답을 찾을 수 없습니다.`,
      });
      return;
    }

    // 🔹 데이터베이스 정답을 문자열로 변환 후 비교
    const correctAnswerStr = String(correctAnswer).trim().toLowerCase();
    const userAnswerStr = String(answer).trim().toLowerCase();

    const isCorrect = correctAnswerStr === userAnswerStr;

    // 🔹 응답 반환
    res.status(StatusCodes.OK).json({
      success: true,
      correct: isCorrect,
      message: isCorrect ? "정답입니다!" : "틀렸습니다.",
    });
  } catch (error) {
    console.error("❌ 퀴즈 정답 검증 중 오류 발생:", error);
    next(error);
  }
};