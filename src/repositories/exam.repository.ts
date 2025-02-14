import { prisma } from "../db.config.js";
import { Exam } from "../dtos/exam.dto.js";

// 시험 추가
export const addExam = async (data: Exam): Promise<number> => {
  console.log("addExam 호출: ", data);

  const createdExam = await prisma.exam.create({
    data: {
      userId: data.userId,
      title: data.title,
      examStart: new Date(data.examStart),
      examEnd: data.examEnd ? new Date(data.examEnd) : undefined,
      remindState: data.remindState,
    },
  });

  return createdExam.id;
};

// 시험 조회 (시험 별)
export const getExam = async (examId: number): Promise<any> => {
  const exam = await prisma.exam.findFirst({ where: { id: examId } });
  return exam;
};

// 시험 조회 (사용자별)
export const getExamsByUserId = async (userId: number) => {
  const exams = await prisma.exam.findMany({
    where: { userId },
  });
  return exams;
};

// 시험 삭제
export const deleteExam = async (examId: number, userId: number) => {
  const deletedExam = await prisma.exam.delete({
    where: {
      id: examId,
      userId: userId, // 사용자의 시험인지 확인
    },
  });
  return deletedExam;
};

// 새로운 시험 추가 (기존 addExam 재사용)
export const addExamWithSchedule = async (
  userId: number,
  certificationId: number,
  scheduleId: number
): Promise<number> => {
  console.log("addExamWithSchedule 호출:", {
    userId,
    certificationId,
    scheduleId,
  });

  // Certification에서 name 가져오기
  const certification = await prisma.certification.findUnique({
    where: { id: certificationId },
    select: { name: true },
  });

  if (!certification) {
    throw new Error("해당 certification을 찾을 수 없습니다.");
  }

  // Schedule에서 examStart, examEnd 가져오기
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { examStart: true, examEnd: true },
  });

  if (!schedule) {
    throw new Error("해당 schedule을 찾을 수 없습니다.");
  }

  // Exam 테이블에 추가
  const createdExam = await prisma.exam.create({
    data: {
      userId,
      title: certification.name, // Certification의 name 사용
      examStart: schedule.examStart ? new Date(schedule.examStart) : new Date(), // null 방지
      examEnd: schedule.examEnd ? new Date(schedule.examEnd) : null, // null 허용
      remindState: false, // 기본값 false
    },
  });

  return createdExam.id;
};
