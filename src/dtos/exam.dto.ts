export interface Exam {
  id?: number;
  title: string;
  examStart: Date;
  examEnd: Date;
  remindState: boolean;
  fcmToken?: string | null;
  userId: number;
}

export const bodyToExam = (body: any): Exam => {
  return {
    userId: Number(body.userId),
    title: body.title,
    examStart: new Date(body.examStart),
    examEnd: new Date(body.examEnd),
    remindState: Boolean(body.remindState),
    fcmToken: body.fcmToken,
  };
};

export const responseFromExam = (exam: Exam) => {
  return {
    title: exam.title,
    examStart: exam.examStart.toISOString(),
    examEnd: exam.examEnd.toISOString(),
    remindState: exam.remindState,
    fcmToken: exam.fcmToken,
  };
};

export const responseFromExams = (exams: any[]) => {
  return exams.map(responseFromExam);
};
