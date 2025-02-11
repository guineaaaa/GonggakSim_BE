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

// 성능 개선 - DND 시간대를 제외한 allowed 분을 산술 연산으로 계산하는 함수
const getRandomAllowedMinute = (
  startMinutes: number,
  endMinutes: number
): number => {
  // 첫번째 구간: 0~startMinutes-1의 길이
  const interval1Length = startMinutes;
  // 두번째 구간: endMinutes+1~1439의 길이
  const interaVal2Length = 1440 - (endMinutes + 1);
  const totalAllowed = interval1Length + interaVal2Length;

  if (totalAllowed === 0) {
    return -1;
  }

  // 두 구간의 총 길이에서 무작위 인덱스 뽑기
  const randomIndex = Math.floor(Math.random() * totalAllowed);
  //인덱스가 첫번째 구간에 속하면 그대로 사용
  if (randomIndex < interval1Length) {
    return randomIndex;
  }
  // 두번째 구간이면 offset 추가해 계산
  return endMinutes + 1 + (randomIndex - interval1Length);
};

// 방해 금지 시간대 외에 알림 전송
// 요청된 요일마다 DND를 제외한 시간대 (allowed time slots)를 계산하고,
// 그중 한 시각 (분단위)를 랜덤으로 선택해 매주 해당 요일에 알림을 전송하도록 예약약
export const scheduleQuizNotifications = async (userId: number) => {
  // 기존 스케줄 취소 (사용자가 기존 알림 설정을 변경하면 기존 작업을 삭제)
  if (scheduledJobs.has(userId)) {
    const jobs = scheduledJobs.get(userId)!;
    jobs.forEach((job) => job.stop());
    scheduledJobs.delete(userId);
  }

  // 사용자 알림 설정 조회
  const notifications = await getNotificationSettingsByUserId(userId);
  const userJobs: cron.ScheduledTask[] = [];

  for (const notification of notifications) {
    const days = notification.days as Day[];
    const quizTypes = notification.quizTypes as QuizType[];

    for (const day of days) {
      const dayOfWeek = dayToCronFormat(day);
      const startMinutes = timeToMinutes(notification.startTime);
      const endMinutes = timeToMinutes(notification.endTime);

      // 산술 연산을 통해 allowed minute을 계산 (반복문 없는 O(1) 연산)
      const randomMinuteOfDay = getRandomAllowedMinute(
        startMinutes,
        endMinutes
      );

      if (randomMinuteOfDay === -1) {
        console.warn(`DND 설정으로 인해 ${day} 요일에 알림 예약 불가`);
        continue;
      }

      const hour = Math.floor(randomMinuteOfDay / 60);
      const minuteInHour = randomMinuteOfDay % 60;

      // 크론 표현식 생성: 매주 해당 요일, 선택된 시각에 실행
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
