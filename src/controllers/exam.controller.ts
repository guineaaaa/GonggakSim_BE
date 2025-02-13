import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { bodyToExam } from "../dtos/exam.dto.js";
import {
  addExamService,
  getExamsService,
  deleteExamService,
  addExamByCertificationSchedule,
} from "../services/exam.service.js";
import { prisma } from "../db.config.js";

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

export const handleAddExamByCertificationSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, scheduleId } = req.body;
    const certificationId = Number(req.params.certification_id);

    if (!userId || !scheduleId || !certificationId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "유효한 userId, scheduleId 및 certification_id가 필요합니다.",
      });
      return;
    }

    // 자격증 조회와 일정 조회를 병렬로 실행
    const [certification, schedule] = await Promise.all([
      prisma.certification.findUnique({
        where: { id: certificationId },
        select: { name: true },
      }),
      prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: { examStart: true, examEnd: true },
      }),
    ]);

    if (!certification) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "해당 자격증을 찾을 수 없습니다.",
      });
      return;
    }
    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "해당 일정(scheduleId)을 찾을 수 없습니다.",
      });
      return;
    }

    const existingExam = await prisma.exam.findFirst({
      where: {
        userId,
        title: certification.name,
        examStart: schedule.examStart ? new Date(schedule.examStart) : new Date(),
      },
    });

    if (existingExam) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "이미 추가된 일정입니다.",
      });
      return;
    }

    // Exam 생성
    const createdExam = await prisma.exam.create({
      data: {
        userId,
        title: certification.name,
        examStart: schedule.examStart ? new Date(schedule.examStart) : new Date(),
        examEnd: schedule.examEnd ? new Date(schedule.examEnd) : null,
        remindState: false,
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "시험 일정이 성공적으로 추가되었습니다.",
    });
  } catch (error) {
    console.error("시험 추가 중 오류 발생:", error);
    next(error);
  }
};