import {
  DnDTime,
  Day,
  QuizRange,
  NotificationRequest,
  QuizType,
} from "../dtos/notificationSettings.dto.js";
import { prisma } from "../db.config.js";

// 방해 금지 시간대 중첩 검사 함수
const isOverlapping = (dndTimes: DnDTime[]): boolean => {
  // 요일별로 시간대 정리
  const dayTimeMap: { [key in Day]?: { start: number; end: number }[] } = {};

  for (const dnd of dndTimes) {
    for (const day of dnd.days) {
      if (!dayTimeMap[day]) {
        dayTimeMap[day] = [];
      }
      const startMinutes = timeToMinutes(dnd.startTime);
      const endMinutes = timeToMinutes(dnd.endTime);

      dayTimeMap[day]?.push({ start: startMinutes, end: endMinutes });
    }
  }

  // 각 요일별로 시간대 중첩 여부 검사
  for (const times of Object.values(dayTimeMap)) {
    times!.sort((a, b) => a.start - b.start);
    for (let i = 0; i < times!.length - 1; i++) {
      if (times![i].end > times![i + 1].start) {
        return true; // 중첩 발생
      }
    }
  }
  return false; // 중첩 없음
};

// 시간 문자열을 분 단위로 변환하는 함수
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 알림 설정 저장 함수
export const saveNotificationSettings = async (data: NotificationRequest) => {
  const { userId, dndTimes, selectedExams, quizTypes, quizRanges } = data;

  // 방해 금지 시간대 중첩 여부 검사
  if (isOverlapping(dndTimes)) {
    throw new Error("방해 금지 시간대가 중복됩니다.");
  }

  // 시험 이름으로 시험 ID 조회
  const exams = await prisma.certification.findMany({
    where: { name: { in: selectedExams } },
    select: { id: true, name: true },
  });

  // 시험 이름과 ID 매핑
  const examMap = new Map<string, number>();
  exams.forEach((exam) => {
    examMap.set(exam.name, exam.id);
  });

  // 매핑되지 않은 시험 이름 검증
  selectedExams.forEach((exam) => {
    if (!examMap.has(exam)) {
      throw new Error(`해당 시험을 찾을 수 없습니다: ${exam}`);
    }
  });

  // 기존 알림 설정 삭제
  await prisma.notification.deleteMany({
    where: { userId },
  });

  // 새로운 알림 설정 저장
  for (const dnd of dndTimes) {
    for (const examTitle of selectedExams) {
      const certificationId = examMap.get(examTitle)!;

      await prisma.notification.create({
        data: {
          userId,
          days: dnd.days, // 요일 배열 저장
          startTime: dnd.startTime,
          endTime: dnd.endTime,
          quizTypes: quizTypes, // 퀴즈 유형 배열 저장
          certificationId,
          isActive: true,
        },
      });
    }
  }
};

// 사용자별 알림 설정 조회 함수
export const getNotificationSettingsByUserId = async (userId: number) => {
  return await prisma.notification.findMany({
    where: { userId, isActive: true },
  });
};
