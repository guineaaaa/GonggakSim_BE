import OpenAI from "openai";
import dotenv from "dotenv";
import { getDayOfWeek } from "./dateUtils.js"; // 날짜 계산을 위한 유틸리티 함수
import dayjs from "dayjs"; // 날짜 비교 및 연산을 위한 라이브러리
import { findSchedulesByExamName } from "../repositories/schedule.repository.js"; // repository에서 시험 일정 가져오는 함수

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
    userId,
    studyExperience,
    studyTimePerDay,
    preferredExamDays,
    availableSchedules,
  }: {
    userId: number; // 사용자 ID
    studyExperience: string; // 학습 경험
    studyTimePerDay: string; // 하루 학습 가능 시간
    preferredExamDays: string[]; // 선호하는 시험 요일
    availableSchedules: any[]; // 시험 일정 목록
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

      // GPT에게 전달할 prompt 작성
      const prompt = `
        사용자의 학습 경험은 '${studyExperience}', 하루 학습 가능 시간은 '${studyTimePerDay}'입니다.
        선호하는 시험 요일은 ${preferredExamDays.join(", ")}입니다.
        제공된 시험 일정은 다음과 같습니다:
        ${filteredSchedules
          .map(
            (schedule) =>
              `시험 일정: ${dayjs(schedule.examDate).format("YYYY-MM-DD dddd")}`
          )
          .join(", ")}.
        이 정보를 바탕으로 가장 적합한 시험 날짜를 추천해 주세요. 날짜는 'YYYY-MM-DD' 형식으로만 응답해주세요.
      `;

      // OpenAI API를 호출하여 GPT에게 추천 요청 (v1/chat/completions 엔드포인트 사용)
      const gptResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that recommends study plans.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
      });

      // 'choices'와 'message'가 null이 아닌지 체크
      if (
        gptResponse.choices &&
        gptResponse.choices.length > 0 &&
        gptResponse.choices[0].message &&
        gptResponse.choices[0].message.content
      ) {
        const gptSuggestedDate = gptResponse.choices[0].message.content.trim();

        if (!gptSuggestedDate) {
          throw new Error("GPT가 추천한 날짜가 없습니다.");
        }
        console.log("GPT가 추천한 날짜:", gptSuggestedDate);

        // 날짜 형식이 포함된 경우, 정규식을 사용하여 날짜 추출
        const dateRegex = /\d{4}-\d{2}-\d{2}/; // YYYY-MM-DD 형식의 날짜를 찾기 위한 정규식
        const match = gptSuggestedDate.match(dateRegex);

        if (!match) {
          // "2025년 03월 15일" 형식에서 날짜 추출
          const koreanDateRegex = /(\d{4})년 (\d{2})월 (\d{2})일/;
          const koreanMatch = gptSuggestedDate.match(koreanDateRegex);
          if (koreanMatch) {
            const [_, year, month, day] = koreanMatch;
            const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
            const suitableExamDateObj = dayjs(formattedDate, "YYYY-MM-DD");

            if (!suitableExamDateObj.isValid()) {
              throw new Error("GPT가 반환한 날짜가 유효하지 않습니다.");
            }

            const weeksUntilExam = suitableExamDateObj.diff(dayjs(), "week");
            const recommendedPlan = `${weeksUntilExam}주 완성 학습 플랜`;
            const formattedDateString =
              suitableExamDateObj.format("M월 D일 dddd");

            return { recommendedPlan, examDate: formattedDateString }; // 추천된 계획과 날짜 반환
          } else {
            throw new Error("GPT가 반환한 날짜 형식이 잘못되었습니다.");
          }
        }

        const suitableExamDateObj = dayjs(match[0], "YYYY-MM-DD");

        // 날짜가 유효한지 확인
        if (!suitableExamDateObj.isValid()) {
          throw new Error("GPT가 반환한 날짜가 유효하지 않습니다.");
        }

        const weeksUntilExam = suitableExamDateObj.diff(dayjs(), "week");

        // 추천 날짜와 현재 날짜 차이 계산
        const recommendedPlan = `${weeksUntilExam}주 완성 학습 플랜`;

        // 날짜 포맷을 'X월 X일 X요일' 형식으로 변경
        const formattedDate = suitableExamDateObj.format("M월 D일 dddd");

        return { recommendedPlan, examDate: formattedDate }; // 추천된 계획과 날짜 반환
      } else {
        throw new Error("GPT의 응답이 유효하지 않습니다.");
      }
    } catch (error: any) {
      console.error("Error while fetching recommended plan:", error.message);
      throw new Error("OpenAI로부터 추천 계획을 가져오는데 실패했습니다.");
    }
  }
}

export default new OpenAIProvider();
