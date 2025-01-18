export const getDayOfWeek = (date: string): string => {
  const daysOfWeek = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  const dayIndex = new Date(date).getDay();
  return daysOfWeek[dayIndex];
};
