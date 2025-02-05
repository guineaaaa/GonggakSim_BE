import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { recommendScheduleService } from "../services/schedule.service.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";
import { prisma } from "../db.config.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import dayjs from "dayjs";

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

export const handleCheckScheduleRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificationId = Number(req.params.certificationId);
    const scheduleId = Number(req.params.scheduleId);
    const today = dayjs(); // 현재 날짜

    // 필수 값 확인
    if (!certificationId || !scheduleId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "유효한 certificationId 및 scheduleId가 필요합니다.",
      });
      return;
    }

    // 스케줄 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId, certificationId },
      select: {
        registrationStart: true,
        registrationEnd: true,
        lateRegistrationStart: true,
        lateRegistrationEnd: true,
        examLink: true,
      },
    });

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "해당 일정(scheduleId)을 찾을 수 없습니다.",
      });
      return;
    }

    const {
      registrationStart,
      registrationEnd,
      lateRegistrationStart,
      lateRegistrationEnd,
      examLink,
    } = schedule;

    // **📌 현재 접수기간인지 확인 (isBetween 없이 직접 비교)**
    const isRegistrationOpen =
      (registrationStart &&
        registrationEnd &&
        (today.isAfter(registrationStart) || today.isSame(registrationStart)) &&
        (today.isBefore(registrationEnd) || today.isSame(registrationEnd))) ||
      (lateRegistrationStart &&
        lateRegistrationEnd &&
        (today.isAfter(lateRegistrationStart) ||
          today.isSame(lateRegistrationStart)) &&
        (today.isBefore(lateRegistrationEnd) ||
          today.isSame(lateRegistrationEnd)));

    if (isRegistrationOpen) {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "현재 접수기간입니다.",
        examLink,
      });
      return;
    }

    // **📌 접수기간이 미래인지 확인**
    if (registrationStart && today.isBefore(registrationStart)) {
      res.status(StatusCodes.OK).json({
        success: true,
        message: `아직 접수기간이 아닙니다. 해당 시험의 접수기간은 ${dayjs(
          registrationStart
        ).format("YYYY-MM-DD")} ~ ${dayjs(registrationEnd).format(
          "YYYY-MM-DD"
        )} 입니다.`,
      });
      return;
    }

    // **📌 접수기간이 종료된 경우**
    res.status(StatusCodes.OK).json({
      success: true,
      message: "접수기간이 종료된 시험입니다. 다른 날짜의 시험을 선택하시기 바랍니다.",
    });
  } catch (error) {
    console.error("시험 접수 확인 중 오류 발생:", error);
    next(error);
  }
};