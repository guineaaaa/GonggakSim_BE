import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "../services/notification.service.js";
import { NotificationRequest } from "../dtos/notificationSettings.dto.js";

export const handleDnDNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      status: "success",
      message: "Notification settings saved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("에러 발생:", error);
    next(error);
  }
};
