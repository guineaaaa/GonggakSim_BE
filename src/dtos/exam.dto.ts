export const bodyToExam = (body: any) => {
  return {
    id: body.id,
    title: body.title,
    examDate: new Date(body.examDate),
    examRange: body.examRange,
    memo: body.memo,
    status: body.status,
    userId: body.userId,
  };
};

export const responseFromExam = (exam: any) => {
  return {
    id: exam.id,
    title: exam.title,
    examDate: exam.examDate.toISOString(),
    examRange: exam.examRange,
    memo: exam.memo,
    status: exam.status,
    userId: exam.userId,
  };
};
