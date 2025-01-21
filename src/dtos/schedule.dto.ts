// AI 시험 추천
export const recommendScheduleDto = (body: any) => {
  return {
    userId: body.userId, //사용자 ID
    name: body.name, // 자격증 시험 이름
    studyExperience: body.studyExperience, // 학습 경험 [노베이스, 기초, 중급, 상급, 전문가]
    studyFrequency: body.studyFrequency, // 시험일까지 어떤 빈도로 공부? [매일 조금씩, 여유 있게, 주말에 집중적으로로]
    studyTimePerDay: body.studyTimePerDay, // 하루에 공부할 수 있는 시간은? [0~1시간, 2~3시간, 3~4시간, 5~6시간,6~7시간, 7시간 이상]
    examGoal: body.examGoal, // 시험의 목표
  };
};
