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
    examGoal, // examGoal 추가
    availableSchedules,
  }: {
    userId: number; // 사용자 ID
    examName: string; // 시험 이름
    studyExperience: string; // 학습 경험
    studyTimePerDay: string; // 하루 학습 가능 시간
    studyFrequency: string; // 공부 빈도
    examGoal: string; // 시험 목표 (추가된 파라미터)
    availableSchedules: any[]; // 시험 일정 목록
  }): Promise<{ recommendedPlan: string; examDate: string }> {
    try {
      const today = dayjs(); // 현재 날짜
      const minimumWeeksToStudy = 1; // 기본 최소 학습 주차
      const maximumWeeksToStudy = 24; // 최대 학습 가능 주차 (6개월)

      // 학습 경험에 따른 보정값 설정
      const experienceMultiplier =
        {
          노베이스: 3.5,
          기초: 2.5,
          중급: 1.8,
          상급: 1.5,
          전문가: 1.0,
        }[studyExperience] || 2.5;

      // 공부 빈도에 따른 학습 기간 보정값 설정
      let frequencyMultiplier: number;
      switch (studyFrequency) {
        case "매일 조금씩":
          frequencyMultiplier = 0.8; // 학습 기간을 단축
          break;
        case "여유 있게":
          frequencyMultiplier = 1.0; // 기본 학습 기간
          break;
        case "주말에 집중적으로":
          frequencyMultiplier = 1.2; // 학습 기간을 늘림
          break;
        default:
          frequencyMultiplier = 1.0; // 기본값
      }

      // 하루 학습 시간에 따른 최소 학습 기간 조정
      const studyTimeRanges: { [key: string]: number } = {
        "0~1시간": 1.7,
        "1~2시간": 1.4,
        "2~3시간": 1.0,
        "3~4시간": 0.7,
        "4~5시간": 0.5,
        "5시간 이상": 0.3,
      };

      const timeMultiplier = studyTimeRanges[studyTimePerDay] || 1.0;

      // 최소 학습 기간 계산
      const adjustedMinimumWeeksToStudy = Math.max(
        Math.ceil(
          (minimumWeeksToStudy * timeMultiplier) / experienceMultiplier
        ),
        2
      );
      /** (최소학습주간 * 하루 학습 시간에 따른 기간 조정 비율)/학습 경험에 따라 조정
       * 학습 시간이 적을수록 학습 기간이 길어진다. 학습 경험이 많을수록 학습 기간이 짧아야한다.
       * 따라서 (minimumWeeksToStudy * timeMultiplier) / experienceMultiplier
       */

      // 유효한 시험 일정 필터링 (조정된 최소/최대 기간 적용)
      const validSchedules = availableSchedules.filter((schedule) => {
        const examDate = dayjs(schedule.examDate);
        const weeksUntilExam = examDate.diff(today, "week");
        return (
          weeksUntilExam >= adjustedMinimumWeeksToStudy * frequencyMultiplier &&
          weeksUntilExam <= maximumWeeksToStudy
        );
      });

      if (validSchedules.length === 0) {
        throw new Error("유효한 시험 일정이 없습니다.");
      }

      // GPT 프롬프트 작성 (examGoal 포함)
      const prompt = `
        나는 특정 자격증 시험을 준비 중인 수험생입니다. 아래 조건에 맞는 학습 계획과 적절한 시험 일정을 추천해주세요:

        - 시험 이름: ${examName}
        - 학습 경험 수준: ${studyExperience} (예: 노베이스, 기초, 중급, 상급, 전문가)
        - 하루 학습 가능 시간: ${studyTimePerDay}시간 (예: 0~1시간, 2~3시간, 3~4시간, 5~6시간, 6시간 이상)
        - 공부 빈도: ${studyFrequency} (매일 조금씩, 여유 있게, 주말에 집중적으로)
        - 시험 목표: ${examGoal} (예: 합격, 상위 점수 등, 만약 구체적인 숫자의 점수가 제공될 시 숫자가 클수록 학습 기간이 오래 걸립니다.)
        - 제공된 시험 일정 (최소 ${Math.ceil(
          adjustedMinimumWeeksToStudy * frequencyMultiplier
        )}주 ~ 최대 ${maximumWeeksToStudy}주 학습 가능 기간 포함):
          ${validSchedules
            .map(
              (schedule) =>
                `- 날짜: ${dayjs(schedule.examDate).format("YYYY-MM-DD dddd")}`
            )
            .join("\n")}

        내가 기대하는 결과는 다음과 같습니다:
        1. 제공된 시험 일정 중 학습 경험, 하루 학습 가능 시간, 공부 빈도, 목표에 맞는 최적의 시험 날짜를 추천하세요.
        2. 선택된 시험 날짜는 현재 날짜로부터 몇 주 후인지 계산해 설명하세요.
        3. 선택된 시험 날짜와 현재 날짜 간의 차이를 주 단위로 계산하여, "X주 완성 학습 플랜" 형식으로 반환하세요.

        결과는 JSON 형식으로 반환해주세요:
        {
          "recommendedPlan": "(시험까지의 주 차이)주 완성 학습 플랜",
          "examDate": "[선택된 시험 날짜: YYYY-MM-DD]"
        }
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

      // GPT 응답 데이터 처리
      const responseContent = gptResponse.choices?.[0]?.message?.content;

      if (!responseContent) {
        throw new Error("GPT가 유효한 응답을 반환하지 않았습니다.");
      }

      const responseData = JSON.parse(responseContent);

      if (!responseData.recommendedPlan || !responseData.examDate) {
        throw new Error("GPT의 응답에 필요한 데이터가 없습니다.");
      }

      // 추천된 시험 날짜 검증 및 주차 재계산
      const recommendedExamDate = dayjs(responseData.examDate);
      if (!recommendedExamDate.isValid()) {
        throw new Error("GPT가 잘못된 시험 날짜를 반환했습니다.");
      }

      // 주차 차이 계산
      const weeksUntilExam = Math.ceil(
        recommendedExamDate.diff(today, "day") / 7
      );

      if (
        weeksUntilExam <
          Math.ceil(adjustedMinimumWeeksToStudy * frequencyMultiplier) ||
        weeksUntilExam > maximumWeeksToStudy
      ) {
        throw new Error("GPT가 추천한 시험 날짜가 유효한 범위를 벗어났습니다.");
      }

      return {
        recommendedPlan: `${weeksUntilExam}주 완성 학습 플랜`,
        examDate: recommendedExamDate.format("YYYY-MM-DD"),
      };
    } catch (error: any) {
      console.error("Error while fetching recommended plan:", error.message);
      throw new Error("추천 계획을 가져오는데 실패했습니다.");
    }
  }
}

export default new OpenAIProvider();
