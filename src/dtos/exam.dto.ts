export interface Exam {
  id?: number;
  title: string;
  examStart: string | Date;
  examEnd: string | Date | null;
  remindState: boolean;
  fcmToken?: string | null;
  userId: number;
}

export const bodyToExam = (body: any): Exam => {
  return {
    userId: Number(body.userId),
    title: body.title,
    examStart: new Date(body.examStart),
    examEnd: body.examEnd ? new Date(body.examEnd) : null, // null 처리
    remindState: Boolean(body.remindState),
    fcmToken: body.fcmToken,
  };
};

export const responseFromExam = (exam: Exam) => {
  return {
    title: exam.title,
    examStart:
      exam.examStart instanceof Date
        ? exam.examStart.toISOString()
        : new Date(exam.examStart).toISOString(),
    examEnd: exam.examEnd
      ? exam.examEnd instanceof Date
        ? exam.examEnd.toISOString()
        : new Date(exam.examEnd).toISOString()
      : null,
    remindState: exam.remindState,
    fcmToken: exam.fcmToken,
  };
};

export const responseFromExams = (exams: any[]) => {
  return exams.map(responseFromExam);
};
