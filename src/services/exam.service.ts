import { prisma } from "../db.config.js";
import {
  getExamsByUserId,
  addExam,
  getExam,
  deleteExam,
} from "../repositories/exam.repository.js";
import { responseFromExams } from "../dtos/exam.dto.js";
import {
  sendImmediateNotification,
  scheduleRandomNotifications,
} from "../utils/notification.utils.js";
import { getUserFcmToken } from "../utils/fcm.utils.js";

// 캘린더 사용자 시험 추가
export const addExamService = async (data: any) => {
  try {
    // FCM 토큰이 없으면 데이터베이스에서 조회
    if (!data.fcmToken) {
      data.fcmToken = await getUserFcmToken(data.userId);
    }

    // FCM 토큰 업데이트 (User테이블)
    if (data.fcmToken) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { fcmToken: data.fcmToken },
      });
    }

    // 시험 데이터 추가
    const addedExamId = await addExam({
      id: data.id,
      title: data.title,
      examDate: data.examDate,
      examRange: data.examRange,
      memo: data.memo,
      status: data.status,
      userId: data.userId,
      remindState: data.remindState,
    });

    // 추가된 시험 정보 조회
    const exam = await getExam(addedExamId);

    // 알림 처리
    if (exam && exam.remindState && exam.fcmToken) {
      sendImmediateNotification(exam);
      console.log("즉시 알림 테스트");
      // scheduleRandomNotifications(exam, 3); // 알림 스케줄 생성
    } else {
      console.error(
        "시험 정보가 없거나 FCM 토큰이 없어 알림을 스케줄링할 수 없습니다."
      );
    }

    return exam;
  } catch (error) {
    console.error("시험 추가 중 오류 발생:", error);
    throw error; // 에러를 호출한 쪽으로 전달
  }
};

// 캘린더 사용자 시험 조회
export const getExamsService = async (userId: number) => {
  const exams = await getExamsByUserId(userId);
  return responseFromExams(exams);
};

// 캘린더 사용자 시험 삭제
export const deleteExamService = async (examId: number, userId: number) => {
  const isDeleted = await deleteExam(examId, userId);
  return isDeleted;
};
