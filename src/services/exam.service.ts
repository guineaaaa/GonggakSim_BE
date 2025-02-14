import { prisma } from "../db.config.js";
import {
  getExamsByUserId,
  addExam,
  getExam,
  deleteExam,
  addExamWithSchedule,
} from "../repositories/exam.repository.js";
import { Exam, responseFromExams } from "../dtos/exam.dto.js";
import { sendImmediateNotification } from "../utils/notification.utils.js";
import { getUserFcmToken } from "../utils/fcm.utils.js";
import { InvalidDataError } from "../errors.js";

export const addExamService = async (data: Exam) => {
  // FCM 토큰 처리
  if (!data.fcmToken) {
    // data.fcmToken = await getUserFcmToken(data.userId);
    const fetchedToken = await getUserFcmToken(data.userId);

    // FCM 토큰 업데이트 (기존과 다를때만)
    if (fetchedToken) {
      data.fcmToken = fetchedToken;

      await prisma.user.update({
        where: { id: data.userId },
        data: { fcmToken: fetchedToken },
      });
    }
  }
  if (data.fcmToken == null) {
    data.fcmToken = undefined;
  }

  // 시험 데이터 추가
  const addedExamId = await addExam(data);

  // 추가된 시험 정보 조회
  const exam = await getExam(addedExamId);

  if (!exam) {
    throw new InvalidDataError("시험 추가 후 Exam 조회 실패", data);
  }

  // 알림 처리
  if (exam && exam.remindState) {
    await sendImmediateNotification(exam);
  } else {
    console.error("알림을 스케줄링할 수 없습니다.");
  }

  return exam;
};

// 캘린더 사용자 시험 조회
export const getExamsService = async (userId: number) => {
  const exams = await getExamsByUserId(userId);

  if (!exams || exams.length === 0) {
    throw new InvalidDataError("사용자에 대한 Exam이 없습니다.", { userId });
  }
  return responseFromExams(exams);
};

// 캘린더 사용자 시험 삭제
export const deleteExamService = async (examId: number, userId: number) => {
  return await deleteExam(examId, userId);
};

export const addExamByCertificationSchedule = async (
  userId: number,
  certificationId: number,
  scheduleId: number
) => {
  // exam 테이블에 데이터 추가
  const addedExamId = await addExamWithSchedule(
    userId,
    certificationId,
    scheduleId
  );

  // 추가된 시험 정보 조회
  const exam = await getExam(addedExamId);

  return exam;
};
