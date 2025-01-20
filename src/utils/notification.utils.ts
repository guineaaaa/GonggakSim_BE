// notification.utils.ts -> 무작위 알림 생성, 스케줄링
import cron from "node-cron";
import { sendFcmNotification } from "./fcm.utils.js";

/**
 * 시험 정보 데이터 구조 인터페이스
 */
interface Exam {
  id: number; //시험id
  title: string; //시험 제목
  examDate: Date; // 시험 날짜 및 시간
  userId: number; // 사용자 ID
  remindState: boolean; //알림 상태 (true인 경우 알림 활성화)
  fcmToken?: string;
}

/**
 * 시험일을 기준으로 현재 시간과 시험일 사이에 무작위 D-day를 생성
 * @param examDate 시험 날짜
 * @param count 알림 횟수
 * @returns 무작위 D-day 배열
 */
export const generateRandomDays = (examDate: Date, count: number): Date[] => {
  const examTimestamp = examDate.getTime(); // 시험 날짜를 타임 스탬프로 변환
  const nowTimestamp = Date.now(); // 현재 시간을 타임 스탬프로 가져온다
  const randomDays = new Set<number>(); // 중복 방지를 위한 Set 객체

  // 지정된 횟수 (count) 만큼 무작위 날짜 생성
  while (randomDays.size < count) {
    const randomTimestamp =
      nowTimestamp +
      Math.random() * (examTimestamp - nowTimestamp - 24 * 60 * 60 * 1000);
    // 현재 시간과 시험일 사이에서 최소 하루 전 까지만 무작위 생성
    if (randomTimestamp < examTimestamp) {
      // 생성된 시간이 시험 일자 이전일 경우만
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

export const scheduleRandomNotifications = (
  exam: Exam, //스케줄링할 시험 정보
  count: number //생성할 알림 횟수
): void => {
  const randomDays = generateRandomDays(exam.examDate, count); //무작위 D-day 날짜 배열

  randomDays.forEach((date) => {
    const notificationTime = new Date(date); // 무작위 D-day를 Date 객체로 가져온다
    const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${
      notificationTime.getMonth() + 1
    } *`; // cron 형식으로 날짜 및 시간을 변환 (분, 시, 일, 월, 요일)
    console.log("!!알림 시간대 스케줄링!!");

    if (exam.fcmToken) {
      cron.schedule(cronTime, () => {
        sendFcmNotification(
          exam.fcmToken!,
          `시험 알림: ${exam.title}`,
          `시험 D-day가 다가옵니다!`
        );
      });
    } else {
      console.warn(
        `FCM 토큰이 없어 알림을 보낼 수 없습니다. 시험 ID: ${exam.id}`
      );
    }
  });
};
