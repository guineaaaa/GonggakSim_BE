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

// 캘린더 사용자 시험 추가
export const addExamService = async (data: any) => {
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

  const exam = await getExam(addedExamId);

  if (data.remindState) {
    /*sendImmediateNotification(exam);
    console.log("시험 테스트 알림 전송 테스트");*/
    scheduleRandomNotifications(exam, 3);
    console.log("시험 알림 전송 테스트");
  } else {
    console.error("Exam not found for scheduling notifications");
  }
  return exam;
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
