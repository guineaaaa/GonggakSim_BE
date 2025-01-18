import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { recommendScheduleService } from "../services/schedule.service.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";

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
