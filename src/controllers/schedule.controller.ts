import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { recommendScheduleService } from "../services/schedule.service.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";
import { prisma } from "../db.config.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

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

// 특정 월의 모든 날짜를 반환하는 함수
export const getDatesByMonth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificationId = Number(req.params.certificationId);
    const month = Number(req.params.month);

    if (!certificationId || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ message: "유효한 자격증 ID와 월 정보를 제공해주세요." });
      return;
    }

    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0);

    const schedules = await prisma.schedule.findMany({
      where: {
        certificationId,
        OR: [
          { examStart: { lte: endOfMonth }, examEnd: { gte: startOfMonth } },
        ],
      },
      select: {
        id: true,
        examStart: true,
        examEnd: true,
      },
    });

    if (schedules.length === 0) {
      res.status(404).json({ message: "해당 월의 시험 일정이 없습니다." });
      return;
    }

    const dateScheduleMap: { date: string; scheduleId: number }[] = [];
    schedules.forEach((schedule) => {
      if (schedule.examStart && schedule.examEnd) {
        const currentDate = new Date(schedule.examStart);
        const endDate = new Date(schedule.examEnd);

        while (currentDate <= endDate) {
          if (
            currentDate.getFullYear() === startOfMonth.getFullYear() &&
            currentDate.getMonth() === startOfMonth.getMonth()
          ) {
            dateScheduleMap.push({
              date: currentDate.toISOString().split("T")[0],
              scheduleId: schedule.id,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    const uniqueSortedDateScheduleMap = Array.from(
      new Map(
        dateScheduleMap.map((item) => [`${item.date}-${item.scheduleId}`, item])
      ).values()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({ dates: uniqueSortedDateScheduleMap });
  } catch (error) {
    console.error("Error fetching dates by month:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
