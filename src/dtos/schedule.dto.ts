// AI 시험 추천
export const recommendScheduleDto = (body: any) => {
  return {
    userId: body.userId, //사용자 ID
    name: body.name, // 자격증 시험 이름
    studyExperience: body.studyExperience, // 학습 경험
    studyTimePerDay: body.studyTimePerDay, // 하루에 공부할 수 있는 시간
    examGoal: body.examGoal, // 시험의 목표
    preferredExamDays: body.preferredExamDays, // 시험 응시 선호 요일
  };
};
