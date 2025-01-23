export enum Day {
  일 = "일",
  월 = "월",
  화 = "화",
  수 = "수",
  목 = "목",
  금 = "금",
  토 = "토",
}

export enum QuizType {
  OX = "개념 OX 퀴즈",
  기출 = "기출문제",
  받아쓰기 = "받아적기",
  알림만 = "알림만",
  사용안함 = "사용안함",
}

// 방해 금지 시간대 인터페이스
export interface DnDTime {
  days: Day[]; // 요일 배열
  startTime: string; // 시작 시간 ("HH:mm" 형식)
  endTime: string; // 종료 시간 ("HH:mm" 형식)
}

// 퀴즈 범위 인터페이스
export interface QuizRange {
  certificationId: number; // 자격증(시험) ID
  ranges: number[]; // 퀴즈 범위 ID 목록
}

// 알림 설정 요청 인터페이스
export interface NotificationRequest {
  userId: number; // 사용자 ID
  dndTimes: DnDTime[]; // 방해 금지 시간대 배열 (최대 7개)
  selectedExams: string[]; // 선택한 시험의 이름 목록
  quizTypes: QuizType[]; // 퀴즈 유형 배열
  quizRanges: QuizRange[]; // 퀴즈 범위 배열
}
