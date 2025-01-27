import { prisma } from "../db.config.js";
import { updateConsent, SuggestionRepository } from "../repositories/user.repository.js"
import { SuggestInfoDto } from '../dtos/user.dto.js'

// 사용자 정보수집 service
export const userConsent = async (accessEmail: string, data: any) => {
    const user = await prisma.user.findUnique({ where: { email: accessEmail }})
    if(!user) {
        throw new Error("유효하지 않은 사용자입니다.");
    }

    const savedDate = await updateConsent(user.id, data);
    return savedDate;
}

// 유사 사용자 추천 service
export class SuggestionService {
    static async getSuggestions(userEmail: string): Promise<SuggestInfoDto[]> {
      const userInfo = await SuggestionRepository.getUserInfo(userEmail);
  
      if (!userInfo) { throw new Error('사용자 정보를 찾을 수 없습니다.'); }
  
      const { age, department, users } = userInfo;
  
      if (!users || users.length < 2) {
        console.log('사용자가 최소 2개의 userCategory를 선택하지 않았습니다.');
        return [];
      }
  
      const categoryNames = users.map(uc => uc.category.name); // Category의 name 추출
  
      // 1순위: 완벽히 일치하는 사용자
      const firstPriority = await SuggestionRepository.findMatchingUsersCertifications({
        age,
        department,
        categoryNames,
      });
  
      if (firstPriority.length >= 3) {
        return this.mapToDto(firstPriority.slice(0, 3));
      }
  
      // 2순위: 부분적으로 일치하는 사용자
      const secondPriority = await SuggestionRepository.findPartiallyMatchingUsersCertifications({
        age,
        department,
        categoryNames,
      });
  
      if (secondPriority.length >= 3) {
        return this.mapToDto(secondPriority.slice(0, 3));
      }
  
      // 기본 추천 자격증
      const defaultRecommendations = await SuggestionRepository.findDefaultCertificationsByCategory(categoryNames);
  
      return this.mapToDto(defaultRecommendations.slice(0, 3));
    }
  
    private static mapToDto(exams: any[]): SuggestInfoDto[] {
      return exams.map((exam) => ({
        id: exam.id,
        name: exam.name,
        category: exam.category,
      }));
    }
}

// 마이페이지 조회
export const getClosestExams = async (userId: number): Promise<any[]> => {
  const currentDate = new Date();
  const exams = await prisma.exam.findMany({
    where: { userId, examDate: { gte: currentDate }},
    orderBy: { examDate: 'asc' },
    take: 2,
  });

  return exams.map((exam) => ({
    name: exam.title,
    date: exam.examDate,
    dDay: Math.ceil((exam.examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
  }));
};