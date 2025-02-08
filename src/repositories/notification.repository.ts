import {
  DnDTime,
  NotificationRequest,
  QuizRange,
} from "../dtos/notificationSettings.dto.js";
import { prisma } from "../db.config.js";
import { timeToMinutes } from "../utils/notification.utils.js";

/**
 * 방해 금지 시간대 중첩 검사 함수
 */
const isOverlapping = (dndTimes: DnDTime[]): boolean => {
  const allTimes = dndTimes.flatMap((dnd) =>
    dnd.days.map((day) => ({
      day,
      start: timeToMinutes(dnd.startTime),
      end: timeToMinutes(dnd.endTime),
    }))
  );

  // 요일별 정렬 (같은 요일이면 시작 시간 순으로)
  allTimes.sort((a, b) => {
    if (a.day === b.day) return a.start - b.start;
    return a.day.localeCompare(b.day);
  });

  for (let i = 0; i < allTimes.length - 1; i++) {
    if (
      allTimes[i].day === allTimes[i + 1].day &&
      allTimes[i].end > allTimes[i + 1].start
    ) {
      return true; // 중첩 발생
    }
  }
  return false;
};

/**
 * 알림 설정 저장 함수
 * - 기존 설정을 삭제한 후, 새로운 Notification을 생성한다.
 * - 각 Notification에 선택한 퀴즈 범위 정보를 JSON 필드(selectedQuizRanges)로 저장한다.
 *   여기서는 요청된 quizRanges 배열 내의 모든 quizRange 객체의 rangeTitle만 추출하여 저장한다.
 */
export const saveNotificationSettings = async (data: NotificationRequest) => {
  const { userId, dndTimes, selectedExams, quizTypes, quizRanges } = data;

  // 방해 금지 시간대 중첩 여부 검사
  if (isOverlapping(dndTimes)) {
    throw new Error("방해 금지 시간대가 중복됩니다.");
  }

  // 시험 이름으로 Certification ID 조회
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
  await prisma.notification.deleteMany({ where: { userId } });

  // 새로운 알림 설정 저장
  for (const dnd of dndTimes) {
    for (const examTitle of selectedExams) {
      const certificationId = examMap.get(examTitle)!;

      // quizRanges에서 해당 certificationId에 해당하는 데이터만 필터링하여 rangeTitle 추출
      const selectedRange = quizRanges?.find(
        (qr) => qr.certificationId === certificationId
      );

      const selectedQuizRangesValue = selectedRange
        ? selectedRange.quizRange.map((item) => item.rangeTitle)
        : [];

      await prisma.notification.create({
        data: {
          userId,
          days: dnd.days, // 요일 배열 (JSON으로 저장)
          startTime: dnd.startTime,
          endTime: dnd.endTime,
          quizTypes: quizTypes, // 퀴즈 유형 배열 (JSON으로 저장)
          certificationId,
          selectedQuizRanges: selectedQuizRangesValue, // rangeTitle 배열 저장
          isActive: true,
        },
      });
    }
  }
};

/**
 * 사용자별 알림 설정 조회 함수
 */
export const getNotificationSettingsByUserId = async (userId: number) => {
  return await prisma.notification.findMany({
    where: { userId, isActive: true },
    include: { certification: { select: { id: true, name: true } } },
  });
};
