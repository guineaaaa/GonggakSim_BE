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

export const addExamService = async (data: Exam) => {
  try {
    // FCM 토큰 처리
    if (!data.fcmToken) {
      data.fcmToken = await getUserFcmToken(data.userId);
    }
    if (data.fcmToken == null) {
      data.fcmToken = undefined;
    }

    // FCM 토큰 업데이트
    if (data.fcmToken) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { fcmToken: data.fcmToken },
      });
    }

    // 시험 데이터 추가
    const addedExamId = await addExam(data);

    // 추가된 시험 정보 조회
    const exam = await getExam(addedExamId);

    // 알림 처리
    if (exam && exam.remindState) {
      await sendImmediateNotification(exam);
    } else {
      console.error("알림을 스케쥴링할 수 없습니다.");
    }

    return exam;
  } catch (error) {
    console.error("시험 추가 중 오류 발생:", error);
    throw error;
  }
};

// 캘린더 사용자 시험 조회
export const getExamsService = async (userId: number) => {
  const exams = await getExamsByUserId(userId);
  return responseFromExams(exams);
};

// 캘린더 사용자 시험 삭제
export const deleteExamService = async (examId: number, userId: number) => {
  return await deleteExam(examId, userId);
};

export const addExamByCertificationSchedule = async (userId: number, certificationId: number, scheduleId: number) => {
  try {
    // exam 테이블에 데이터 추가
    const addedExamId = await addExamWithSchedule(userId, certificationId, scheduleId);

    // 추가된 시험 정보 조회
    const exam = await getExam(addedExamId);
    
    return exam;
  } catch (error) {
    console.error("시험 추가 중 오류 발생:", error);
    throw error;
  }
};
