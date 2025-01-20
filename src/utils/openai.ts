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
      // GPT에게 전달할 prompt 작성
      const prompt = `
        나는 특정 자격증 시험을 준비 중인 수험생입니다. 아래 조건에 맞는 학습 계획과 적절한 시험 일정을 추천해주세요:

        - 시험 이름: ${examName}
        - 시험 목표: ${examGoal}
        - 시험 관련 학습 경험 수준: ${studyExperience} (예: 노베이스, 기초, 중급, 상급, 전문가)
        - 시험에 투자 가능한 시간, 하루 학습 가능 시간: ${studyTimePerDay} (예: 0~1시간, 2~3시간, 3~4시간, 5~6시간, 6시간 이상)
        - 시험 공부 빈도: ${studyFrequency} (예: 매일 조금씩, 여유 있게, 주말에 집중적으로)
        - 제공된 시험 일정: 
          ${availableSchedules
            .map(
              (schedule) =>
                `- 날짜: ${dayjs(schedule.examDate).format("YYYY-MM-DD dddd")}`
            )
            .join("\n")}

        내가 기대하는 결과는 다음과 같습니다:
        1. 학습 경험, 하루 학습 가능 시간, 공부 빈도에 따라 현실적인 학습 기간을 계산해주세요.
        2. 제공된 시험 일정들 중, 목표를 달성하기 위해 가장 적합한 시험 날짜를 선택해주세요. 
        3. 추천 시험 날짜는 현재 날짜에서 "X주 후"와 일치하도록 설정해주세요.(시험 날짜 - 현재 날짜 간의 주차 차이)
        4. 결과는 JSON 형식으로 반환해주세요:

        반환 형식:
        {
          "recommendedPlan": "(현재 날짜와 추천 시험 날짜 간의 주차 차이)주 완성 학습 플랜",
          "examDate": "[추천 시험 날짜: YYYY-MM-DD]"
        }

        참고:
        - "매일 조금씩" 공부가 가능하면 학습 집중도를 반영해 평균 학습 기간을 단축하세요.
        - 시험 일정에서 현실적으로 목표를 달성할 수 있는 가장 빠른 날짜를 선택하세요.
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
