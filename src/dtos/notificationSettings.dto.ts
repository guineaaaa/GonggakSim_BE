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
  startTime: string; // "HH:mm" 형식
  endTime: string; // "HH:mm" 형식
}

// 사용자가 선택한 퀴즈 범위 인터페이스

export interface QuizRangeItem {
  quizRangeId: number;
  rangeTitle: string;
  rangeDetails: string;
}

export interface QuizRange {
  certificationId: number; // 자격증(시험) ID
  quizRange: QuizRangeItem[]; // 선택한 퀴즈 범위 목록 (객체 배열)
}

// 알림 설정 요청 인터페이스
export interface NotificationRequest {
  userId: number; // 사용자 ID
  fcmToken?: string | null; // FCM 토큰
  dndTimes: DnDTime[]; // 방해 금지 시간대 배열 (최대 7개)
  selectedExams: string[]; // 선택한 시험(자격증) 이름 목록
  quizTypes: QuizType[]; // 퀴즈 유형 배열
  quizRanges?: QuizRange[]; // (옵션) 퀴즈 범위 선택 배열
}
