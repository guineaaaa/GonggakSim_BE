import cron from "node-cron";
import { getUserFcmToken, sendFcmNotification } from "./fcm.utils.js";
import { Exam } from "../dtos/exam.dto.js";
import { Day, QuizType } from "../dtos/notificationSettings.dto.js";
import { getNotificationSettingsByUserId } from "../repositories/notification.repository.js";

// 요일 Enum을 Cron 형식의 숫자로 변환
const dayToCronFormat = (day: Day): number => {
  const dayMap: { [key in Day]: number } = {
    [Day.일]: 0,
    [Day.월]: 1,
    [Day.화]: 2,
    [Day.수]: 3,
    [Day.목]: 4,
    [Day.금]: 5,
    [Day.토]: 6,
  };
  return dayMap[day];
};

// Cron 작업을 관리하기 위한 Map
const scheduledJobs = new Map<number, cron.ScheduledTask[]>();

// 방해 금지 시간대 외에 알림 전송
export const scheduleQuizNotifications = async (userId: number) => {
  // 기존 스케줄 취소 (사용자가 기존 알림을 변경하면 기존 크론 작업을 삭제해야한다)
  if (scheduledJobs.has(userId)) { 
    const jobs = scheduledJobs.get(userId)!;
    jobs.forEach((job) => job.stop());
    scheduledJobs.delete(userId);
  }

  // 사용자 알림 설정 조회
  const notifications = await getNotificationSettingsByUserId(userId);

  // 새로운 cron 작업을 저장할 배열열
  const userJobs: cron.ScheduledTask[] = [];

  for (const notification of notifications) {
    // 사용자의 알림 설정에서 알림 받을 요일, 퀴즈 유형을 가져온다다
    const days = notification.days as Day[];
    const quizTypes = notification.quizTypes as QuizType[];

    for (const day of days) {
      // 요일을 크론 형식으로 변환함
      // DnD의 startTime, endTime을 분 단위로 변환환
      const dayOfWeek = dayToCronFormat(day);
      const startMinutes = timeToMinutes(notification.startTime);
      const endMinutes = timeToMinutes(notification.endTime);

      // 하루의 모든 시간(분 단위)을 순회
      for (let minute = 0; minute < 24 * 60; minute += 60) {
        // 방해 금지 시간대인지 확인
        if (minute >= startMinutes && minute <= endMinutes) {
          continue; // 방해 금지 시간대면 스킵
        }

        const hour = Math.floor(minute / 60);
        const minuteInHour = minute % 60;
        const cronExpression = `${minuteInHour} ${hour} * * ${dayOfWeek}`;

        const job = cron.schedule(cronExpression, async () => {
          const fcmToken = await getUserFcmToken(userId);
          if (fcmToken) {
            await sendFcmNotification(
              fcmToken,
              `퀴즈 알림`,
              `지금 퀴즈를 풀어보세요! (${quizTypes.join(", ")})`
            );
          }
        });

        userJobs.push(job);
      }
    }
  }

  scheduledJobs.set(userId, userJobs);
};

// 시간 문자열을 분 단위로 변환하는 함수
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 시험 리마인더를 위한 함수 (즉시 알림, 테스트용)
export const sendImmediateNotification = async (exam: any): Promise<void> => {
  const fcmToken = await getUserFcmToken(exam.userId);
  if (fcmToken) {
    await sendFcmNotification(
      fcmToken,
      `시험 알림: ${exam.title}`,
      `시험이 곧 시작됩니다!`
    );
  } else {
    console.warn(`사용자 ${exam.userId}의 FCM 토큰이 없습니다.`);
  }
};

// 랜덤 날짜 배열 생성 함수
const generateRandomDates = (
  startDate: Date,
  endDate: Date,
  count: number
): Date[] => {
  const uniqueDates = new Set<number>();
  while (uniqueDates.size < count) {
    const randomTime =
      startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime());
    uniqueDates.add(randomTime);
  }
  return Array.from(uniqueDates)
    .sort((a, b) => a - b)
    .map((timestamp) => new Date(timestamp));
};

// 랜덤 리마인드 알림 스케줄링
export const scheduleRandomNotifications = (
  exam: Exam,
  count: number
): void => {
  const now = new Date();
  const examDate = new Date(exam.examStart);

  if (now >= examDate) {
    console.warn(
      "시험일이 이미 지났거나 오늘입니다. 랜덤 알림을 스케쥴링하지 않습니다."
    );
    return;
  }

  const randomDates = generateRandomDates(now, examDate, count);
  randomDates.forEach((date) => {
    const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
      date.getMonth() + 1
    } *`;

    cron.schedule(cronExpression, async () => {
      const fcmToken = await getUserFcmToken(exam.userId);
      if (fcmToken) {
        await sendFcmNotification(
          fcmToken,
          `시험 알림: ${exam.title}`,
          `시험이 다가오고 있습니다! 준비하세요.`
        );
      }
    });
  });

  console.log(`${count}개의 랜덤 알림이 스케쥴링되었습니다.`);
};
