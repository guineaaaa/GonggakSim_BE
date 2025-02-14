import { saveNotificationSettings } from "../repositories/notification.repository.js";
import { scheduleQuizNotifications } from "../utils/notification.utils.js";
import { NotificationRequest } from "../dtos/notificationSettings.dto.js";
import { getUserFcmToken } from "../utils/fcm.utils.js";
import { InvalidDataError } from "../errors.js";

export class NotificationService {
  // 알림 설정 저장 및 스케줄링
  async updateNotificationSettings(data: NotificationRequest) {
    // 방해 금지 시간대가 최대 7개 이하인지 확인
    if (data.dndTimes.length > 7) {
      throw new InvalidDataError(
        "방해 금지 시간대는 최대 7개까지 설정 가능합니다.",
        data
      );
    }

    if (!data.fcmToken) {
      data.fcmToken = await getUserFcmToken(data.userId);
    }

    if (data.fcmToken == null) {
      data.fcmToken = undefined;
    }

    // 방해 금지 시간대 및 퀴즈 설정 저장
    await saveNotificationSettings(data);

    // 알림을 방해 금지 시간대 외에 전송하도록 스케줄링
    await scheduleQuizNotifications(data.userId);

    // return { message: "알림 설정이 완료되었습니다." };
    return data;
  }
}
