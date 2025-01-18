import OpenAIProvider from "../utils/openai.js";
import { findSchedulesByExamName } from "../repositories/schedule.repository.js";
import { recommendScheduleDto } from "../dtos/schedule.dto.js";

export const recommendScheduleService = async (
  dto: ReturnType<typeof recommendScheduleDto>
) => {
  const { name, studyExperience, studyTimePerDay, preferredExamDays } = dto;

  // DB로부터 시험 일정들을 가져온다.
  const schedules = await findSchedulesByExamName(name);

  if (!schedules || schedules.length === 0) {
    throw new Error("No available schedules found for the specified exam.");
  }

  // AI를 통해 추천 일정을 받기
  const recommendedPlan = await OpenAIProvider.fetchRecommendedPlan({
    studyExperience,
    studyTimePerDay,
    preferredExamDays,
    availableSchedules: schedules,
  });

  // 추천 일정 반환
  return {
    userId: dto.userId,
    recommendedPlan: recommendedPlan.recommendedPlan,
    examDate: recommendedPlan.examDate,
  };
};
