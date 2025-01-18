import OpenAI from "openai";
import dotenv from "dotenv";
import { getDayOfWeek } from "./dateUtils.js"; // 날짜 계산을 위한 유틸리티 함수
import dayjs from "dayjs"; // 날짜 비교 및 연산을 위한 라이브러리

dotenv.config();

class OpenAIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 사용자의 조건에 맞는 값들을 입력 받아 추천 계획을 생성
  async fetchRecommendedPlan({
    studyExperience,
    studyTimePerDay,
    preferredExamDays,
    availableSchedules,
  }: {
    studyExperience: string; // 학습 경험
    studyTimePerDay: string; // 하루 학습 가능 시간
    preferredExamDays: string[]; // 선호하는 시험 요일
    availableSchedules: any[]; // 현재 가능한 시험 날짜들
  }): Promise<{ recommendedPlan: string; examDate: string }> {
    try {
      // 학습 경험에 따른 예상 학습 기간(주 단위) 설정
      let weeksRequired = 0;
      switch (studyExperience.toLowerCase()) {
        case "초보":
          weeksRequired = 6; // 초보자는 6주 필요
          break;
        case "중급":
          weeksRequired = 4; // 중급자는 4주 필요
          break;
        case "고급":
          weeksRequired = 2; // 고급자는 2주 필요
          break;
        default:
          weeksRequired = 4; // 기본적으로 4주로 설정
          break;
      }

      // 하루 학습 가능 시간을 숫자로 변환
      const studyTimePerDayNumber = parseFloat(studyTimePerDay.split("~")[0]); // 시간대 범위에서 첫 번째 숫자 사용

      // 사용자의 하루 학습 시간과 학습 기간을 기반으로 필요한 학습 기간 계산
      const totalStudyHoursRequired = weeksRequired * 7 * 2; // 한 주에 2시간씩 공부한다고 가정 (기본적으로 2시간/일)
      const studyTimeNeeded = totalStudyHoursRequired / studyTimePerDayNumber; // 학습이 완료될 때까지 필요한 일수

      // 선호하는 요일을 기준으로 시험 날짜 필터링
      const filteredSchedules = availableSchedules.filter((schedule) => {
        const examDayOfWeek = getDayOfWeek(schedule.examDate); // 요일 추출
        return preferredExamDays.includes(examDayOfWeek); // 선호하는 요일에 해당하는 날짜만 필터링
      });

      if (filteredSchedules.length === 0) {
        throw new Error("선호하는 요일에 맞는 시험 날짜가 없습니다.");
      }

      // 적합한 시험 날짜 찾기
      let suitableExamDate: string | null = null;
      for (const schedule of filteredSchedules) {
        const examDate = dayjs(schedule.examDate);
        const diffInWeeks = examDate.diff(dayjs(), "week"); // 시험일까지 몇 주 남았는지 계산

        // 학습 시간과 학습 경험에 기반해 적합한 시험 날짜를 찾음
        if (diffInWeeks >= studyTimeNeeded) {
          suitableExamDate = schedule.examDate;
          break;
        }
      }

      // 적합한 시험 날짜가 없다면, 가장 가까운 날짜를 반환
      if (!suitableExamDate) {
        suitableExamDate = filteredSchedules[0].examDate;
      }

      // 학습 기간을 적절히 계산 (현재 날짜부터 적합한 시험 날짜까지)
      const suitableExamDateObj = dayjs(suitableExamDate);
      const weeksUntilExam = suitableExamDateObj.diff(dayjs(), "week");

      // 추천되는 학습 계획 (X주 완성 학습 플랜)
      const recommendedPlan = `${weeksUntilExam}주 완성 학습 플랜`;

      // 날짜 포맷을 'X월 X일 X요일' 형식으로 변경
      const formattedDate = suitableExamDateObj.format("M월 D일 dddd");

      return { recommendedPlan, examDate: formattedDate }; // 추천된 계획과 날짜 반환
    } catch (error: any) {
      console.error(
        "Error while fetching recommended plan:",
        error.response ? error.response.data : error.message
      );
      throw new Error("OpenAI로부터 추천 계획을 가져오는데 실패했습니다.");
    }
  }
}

export default new OpenAIProvider();
