import { prisma } from "../db.config.js";

// 시험 추가
export const addExam = async (data: any) => {
  const createdExam = await prisma.exam.create({
    data: {
      id: data.id,
      title: data.title,
      examDate: data.examDate,
      examRange: data.examRange,
      memo: data.memo,
      status: data.status,
      userId: data.userId,
    },
  });

  return createdExam.id;
};

// 시험 조회
export const getExam = async (examId: number) => {
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
  const deletedExam = await prisma.exam.deleteMany({
    where: {
      id: examId,
      userId: userId, // 사용자의 시험인지 확인
    },
  });
  return deletedExam.count > 0; // 삭제된 레코드가 있는지 확인
};
