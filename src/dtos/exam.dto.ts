export interface Exam {
  id?: number;
  title: string;
  examDate: Date;
  examRange: string;
  memo: string;
  status: string;
  userId: number;
  remindState: boolean;
  fcmToken?: string | null;
}

export const bodyToExam = (body: any): Exam => {
  return {
    title: body.title,
    examDate: new Date(body.examDate),
    examRange: body.examRange,
    memo: body.memo,
    status: body.status,
    userId: Number(body.userId),
    remindState: Boolean(body.remindState),
    fcmToken: body.fcmToken,
  };
};

export const responseFromExam = (exam: Exam) => {
  return {
    title: exam.title,
    examDate: exam.examDate.toISOString(),
    examRange: exam.examRange,
    memo: exam.memo,
    status: exam.status,
    userId: exam.userId,
    remindState: exam.remindState,
    fcmToken: exam.fcmToken,
  };
};

export const responseFromExams = (exams: any[]) => {
  return exams.map(responseFromExam);
};
