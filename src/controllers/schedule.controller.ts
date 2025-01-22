import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { recommendScheduleService } from "../services/schedule.service.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";
import { prisma } from "../db.config.js";

export const handleRecommendSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("AI 시험 일정 추천 함수 호출");
  console.log("body: ", req.body);

  try {
    // 요청 본문을 DTO로 변환
    const dto = recommendScheduleDto(req.body);

    // Service를 호출하여 추천된 일정 가져오기
    const recommendedSchedule = await recommendScheduleService(dto);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "successfully recommended",
      data: recommendedSchedule,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message:
        error.message || "Failed to recommend certification exam schedule",
    });
  }
};

// 특정 월의 시험 일정 조회
export const getSchedulesByMonth = async (
  req: Request,
  res: Response
): Promise<void> => {
  const certificationId = Number(req.params.certificationId);
  const month = Number(req.params.month);
  const currentYear = new Date().getFullYear();

  if (!certificationId || isNaN(month) || month < 1 || month > 12) {
    res.status(400).json({ message: "유효한 자격증 ID와 월 정보를 제공해주세요." });
    return;
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        certificationId,
        examDate: {
          gte: new Date(`${currentYear}-${month}-01`),
          lt: new Date(`${currentYear}-${month + 1}-01`),
        },
      },
      select: {
        id: true,
        examDate: true,
        registrationStart: true,
        registrationEnd: true,
        examLink: true,
      },
      orderBy: { examDate: "asc" },
    });

    if (schedules.length === 0) {
      res.status(404).json({ message: "해당 월의 시험 일정이 없습니다." });
      return;
    }

    res.status(200).json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules by month:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};