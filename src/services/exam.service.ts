import { addExam, getExam } from "../repositories/exam.repository.js";
import { responseFromExam } from "../dtos/exam.dto.js";

export const addExamService = async (data: any) => {
  const addedExamId = await addExam({
    id: data.id,
    title: data.title,
    examDate: data.examDate,
    examRange: data.examRange,
    memo: data.memo,
    status: data.status,
    userId: data.userId,
  });

  const exam = await getExam(addedExamId);
  return exam;
};
