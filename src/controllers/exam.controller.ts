import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { bodyToExam } from "../dtos/exam.dto.js";
import {
  addExamService,
  getExamsService,
  deleteExamService,
} from "../services/exam.service.js";

// post
export const handleAddExam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("사용자 캘린더 시험 추가 요청");
  try {
    const examData = bodyToExam(req.body);
    const exam = await addExamService(examData);
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// get
export const handleGetExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("사용자 캘린더 시험 조회 요청");

  try {
    const userId = Number(req.query.userId); // 쿼리 파라미터에서 userId 추출
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const exams = await getExamsService(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// delete
export const handleDeleteExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("사용자 캘린더 시험 삭제 요청");

  try {
    const examId = Number(req.params.examId); // url 파라미터에서 시험 id 추출
    const userId = Number(req.query.userId); // query 파라미터에서 사용자 id추출

    if (!examId || !userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Exam ID and User ID are required",
      });
      return;
    }

    await deleteExamService(examId, userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
