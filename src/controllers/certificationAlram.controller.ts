import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createCertificationAlarm } from "../services/certificationAlram.service.js";

export const handleCreateCertificationAlarm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificationId = Number(req.params.certificationId);
    const { scheduleId } = req.body;

    if (!certificationId || !scheduleId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "유효한 certificationId 및 scheduleId가 필요합니다.",
      });
      return;
    }

    const createdAlarm = await createCertificationAlarm(certificationId, scheduleId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "알림 설정이 성공적으로 등록되었습니다.",
      data: createdAlarm,
    });
  } catch (error) {
    console.error("Certification Alarm 생성 중 오류 발생:", error);
    next(error); 
  }
};
