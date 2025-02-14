import { findSchedulesByExamName } from "../repositories/schedule.repository.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";
import { InvalidDataError } from "../errors.js";
import OpenAIProvider from "../utils/openai.js";

// 추천 일정 서비스 함수
export const recommendScheduleService = async (
  dto: ReturnType<typeof recommendScheduleDto>
) => {
  const {
    name,
    userId,
    studyExperience,
    studyTimePerDay,
    studyFrequency,
    examGoal,
  } = dto;

  // DB로부터 시험 일정들을 가져온다.
  const schedules = await findSchedulesByExamName(name);

  // 만약 시험 일정이 없다면 에러 처리
  if (!schedules || schedules.length === 0) {
    throw new InvalidDataError("데이터베이스에 시험 일정이 없습니다.", dto);
  }

  // AI를 통해 추천 일정을 받기
  const recommendedPlan = await OpenAIProvider.fetchRecommendedPlan({
    userId,
    examName: name,
    studyExperience,
    studyTimePerDay,
    studyFrequency,
    examGoal,
    availableSchedules: schedules, // DB로부터 가져온 시험 일정들
  });

  // 추천 일정 반환
  return {
    userId,
    recommendedPlan: recommendedPlan.recommendedPlan,
    examDate: recommendedPlan.examDate,
  };
};
