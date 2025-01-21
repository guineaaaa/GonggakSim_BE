import OpenAI from "openai";
import dotenv from "dotenv";
import dayjs from "dayjs"; // 날짜 비교 및 연산을 위한 라이브러리

dotenv.config();

class OpenAIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 사용자의 조건과 시험 정보를 기반으로 추천 계획을 생성
  async fetchRecommendedPlan({
    userId,
    examName,
    studyExperience,
    studyTimePerDay,
    studyFrequency,
    examGoal,
    availableSchedules,
  }: {
    userId: number; // 사용자 ID
    examName: string; // 시험 이름
    studyExperience: string; // 학습 경험
    studyTimePerDay: string; // 하루 학습 가능 시간
    studyFrequency: string; // 공부 빈도
    examGoal: string; // 시험 목표
    availableSchedules: any[]; // 시험 일정 목록
  }): Promise<{ recommendedPlan: string; examDate: string }> {
    try {
      let adjustedPlanFactor = 1; // 학습 기간 조정 계수

      // 공부 빈도에 따라 학습 기간 조정
      switch (studyFrequency) {
        case "매일 조금씩":
          adjustedPlanFactor *= 0.8; // 학습 기간 단축
          break;
        case "여유 있게":
          adjustedPlanFactor *= 1.0; // 기본 학습 기간
          break;
        case "주말에 집중적으로":
          adjustedPlanFactor *= 1.2; // 학습 기간 연장
          break;
        default:
          adjustedPlanFactor *= 1.0; // 기본 값
          break;
      }

      // 학습 경험에 따른 학습 기간 조정
      switch (studyExperience) {
        case "노베이스":
          adjustedPlanFactor *= 1.5; // 긴 학습 기간 필요
          break;
        case "기초":
          adjustedPlanFactor *= 1.2; // 보통의 학습 기간 필요
          break;
        case "중급":
          adjustedPlanFactor *= 1.0; // 기본 학습 기간
          break;
        case "상급":
          adjustedPlanFactor *= 0.8; // 빠른 학습 기간 가능
          break;
        case "전문가":
          adjustedPlanFactor *= 0.6; // 매우 빠른 학습 기간 가능
          break;
        default:
          adjustedPlanFactor *= 1.0; // 기본 값
          break;
      }

      // 하루 학습 가능 시간에 따른 학습 기간 조정
      switch (studyTimePerDay) {
        case "0~1시간":
          adjustedPlanFactor *= 1.5; // 긴 학습 기간 필요
          break;
        case "2~3시간":
          adjustedPlanFactor *= 1.2; // 보통의 학습 기간 필요
          break;
        case "3~4시간":
          adjustedPlanFactor *= 1.0; // 기본 학습 기간
          break;
        case "5~6시간":
          adjustedPlanFactor *= 0.8; // 빠른 학습 기간 가능
          break;
        case "6시간 이상":
          adjustedPlanFactor *= 0.6; // 매우 빠른 학습 기간 가능
          break;
        default:
          adjustedPlanFactor *= 1.0; // 기본 값
          break;
      }

      // 총 학습 기간 계산 (일수로 계산 후 주차로 변환)
      const studyDurationDays = Math.ceil(adjustedPlanFactor * 30); // 1개월 기준으로 계산 (30일 기준)
      const studyDurationWeeks = Math.ceil(studyDurationDays / 7); // 일수를 주차로 변환

      // 현재 날짜와 가장 적합한 시험 날짜 계산
      const today = dayjs();
      let recommendedExamDate = null;
      for (let schedule of availableSchedules) {
        const examDate = dayjs(schedule.examDate);
        const weeksDifference = examDate.diff(today, "week");

        if (weeksDifference >= studyDurationWeeks) {
          recommendedExamDate = examDate;
          break;
        }
      }

      if (!recommendedExamDate) {
        throw new Error("적합한 시험 날짜를 찾을 수 없습니다.");
      }

      // GPT에게 전달할 prompt 작성
      const prompt = `
      나는 특정 자격증 시험을 준비 중인 수험생입니다. 아래 조건에 맞는 학습 계획과 적절한 시험 일정을 추천해주세요:

      - 시험 이름: ${examName}
      - 시험 목표: ${examGoal}
      - 시험 관련 학습 경험 수준: ${studyExperience} 
      - 하루 학습 가능 시간: ${studyTimePerDay} 
      - 시험 공부 빈도: ${studyFrequency} 
      - 제공된 시험 일정: 
        ${availableSchedules
          .map(
            (schedule) =>
              `- 날짜: ${dayjs(schedule.examDate).format("YYYY-MM-DD dddd")}`
          )
          .join("\n")}

      내가 기대하는 결과는 다음과 같습니다:
      1. 시험 특성, 학습 경험, 하루 학습 가능 시간, 공부 빈도에 따라 현실적인 학습 기간을 계산해주세요. 이때, 학습 경험은 초기 상태에서 더 많은 시간이 소요되며, 하루 학습 가능 시간이 많을수록 학습 기간이 짧아질 것입니다.
      2. 제공된 시험 일정들 중, 목표를 달성하기 위해 가장 적합한 시험 날짜를 선택해주세요.
      3. 추천 시험 날짜는 현재 날짜에서 "X주 후"와 일치하도록 설정해주세요. X는 추천된 학습 기간에 맞춰 계산됩니다. (시험 날짜 - 현재 날짜 간의 주차 차이)
      4. 결과는 JSON 형식으로 반환해주세요. 반환 형식은 다음과 같습니다:

      반환 형식:
      {
        "recommendedPlan":  "(현재 날짜와 추천 시험 날짜 간의 주차 차이)주 완성 학습 플랜",
        "examDate": "[추천된 시험 날짜: YYYY-MM-DD]"
      }

      참고:
      - "매일 조금씩" 공부가 가능하면 학습 집중도를 반영해 평균 학습 기간을 단축하세요.
      - 시험 일정에서 현실적으로 목표를 달성할 수 있는 가장 빠른 날짜를 선택하세요.
      - 학습 경험 수준에 따라 예상 학습 기간을 조정해주세요: 노베이스일수록 길고, 전문가일수록 짧습니다.
      - 하루 학습 가능 시간에 따라 기간을 조정해 주세요: 6시간 이상 공부할 수 있으면 학습 기간을 단축할 수 있습니다.
      `;

      // OpenAI API 호출
      const gptResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that recommends tailored and realistic study plans for exams based on user inputs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
      });

      // 응답 데이터 처리
      const responseContent = gptResponse.choices?.[0]?.message?.content;

      if (!responseContent) {
        throw new Error("GPT가 유효한 응답을 반환하지 않았습니다.");
      }

      const responseData = JSON.parse(responseContent);

      if (!responseData.recommendedPlan || !responseData.examDate) {
        throw new Error("GPT의 응답에 필요한 데이터가 없습니다.");
      }

      return {
        recommendedPlan: responseData.recommendedPlan,
        examDate: responseData.examDate,
      };
    } catch (error: any) {
      console.error("Error while fetching recommended plan:", error.message);
      throw new Error("OpenAI로부터 추천 계획을 가져오는데 실패했습니다.");
    }
  }
}

export default new OpenAIProvider();
