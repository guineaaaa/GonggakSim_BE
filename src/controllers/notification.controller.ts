import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "../services/notification.service.js";
import { NotificationRequest } from "../dtos/notificationSettings.dto.js";

export const handleDnDNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("방해 금지 시간 알림 설정");

  const notificationService = new NotificationService();

  try {
    const data: NotificationRequest = req.body;

    if (!data.userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "유효한 사용자 ID가 필요합니다.",
      });
      return;
    }

    const result = await notificationService.updateNotificationSettings(data);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error("에러 발생:", error);
    next(error);
  }
};
