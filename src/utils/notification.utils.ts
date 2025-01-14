// notification.utils.ts -> 무작위 알림 생성, 스케줄링
import cron from "node-cron";
import { sendFcmNotification } from "./fcm.utils.js";

/**
 * 시험 정보 데이터 구조 인터페이스
 */
interface Exam {
  id: number;
  title: string;
  examDate: Date;
  userId: number;
  remindState: boolean;
}

/**
 * 시험일을 기준으로 현재 시간과 시험일 사이에 무작위 D-day를 생성
 * @param examDate 시험 날짜
 * @param count 알림 횟수
 * @returns 무작위 D-day 배열
 */
export const generateRandomDays = (examDate: Date, count: number): Date[] => {
  const examTimestamp = examDate.getTime();
  const nowTimestamp = Date.now();
  const randomDays = new Set<number>();

  while (randomDays.size < count) {
    const randomTimestamp =
      nowTimestamp +
      Math.random() * (examTimestamp - nowTimestamp - 24 * 60 * 60 * 1000); // 최소 하루 전
    if (randomTimestamp < examTimestamp) {
      // 시험 일자 이전일 경우만
      randomDays.add(Math.floor(randomTimestamp));
    }
  }

  return Array.from(randomDays)
    .map((timestamp) => new Date(timestamp))
    .sort((a, b) => a.getTime() - b.getTime());
};

/**
 * 무작위 알림 스케줄링 함수
 * @param exam 시험 정보
 * @param count 알림 횟수
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const scheduleRandomNotifications = (
  exam: Exam,
  count: number
): void => {
  const randomDays = generateRandomDays(exam.examDate, count); //무작위 날짜 배열

  randomDays.forEach((date) => {
    const notificationTime = new Date(date);
    const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${
      notificationTime.getMonth() + 1
    } *`;

    cron.schedule(cronTime, () => {
      sendFcmNotification(
        exam.userId,
        `시험 알림: ${exam.title}`,
        `시험 D-day가 다가옵니다!`
      );
    });
  });
};

// 알림을 즉시 전송하는 함수
export const sendImmediateNotification = (exam: Exam): void => {
  console.log("즉시알림 호출");
  if (exam.remindState) {
    sendFcmNotification(
      exam.userId,
      `시험 알림: ${exam.title}`,
      `시험이 곧 시작됩니다! ${exam.examDate}`
    );
  }
};
