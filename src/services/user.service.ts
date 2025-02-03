import { Certification } from "@prisma/client";
import { prisma } from "../db.config.js";
import {
  updateConsent,
  SuggestionRepository,
} from "../repositories/user.repository.js";
import { SuggestInfoDto, UserSimilarityInfo, UserWithDetails } from "../dtos/user.dto.js";

// 사용자 정보수집 service
export const userConsent = async (accessEmail: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { email: accessEmail } });
  if (!user) {
    throw new Error("유효하지 않은 사용자입니다.");
  }

  const savedDate = await updateConsent(user.id, data);
  return savedDate;
};

// 유사 사용자 추천 service
export class SuggestionService {
  static async getSuggestions(userEmail: string): Promise<SuggestInfoDto[]> {
    try {
      const userInfo = await SuggestionRepository.getUserInfo(userEmail);

      if (!userInfo) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const { users } = userInfo;

      if (!users || users.length < 1) {
        console.log("사용자가 카테고리를 선택하지 않았습니다.");
        return await this.getDefaultRecommendations(userInfo);
      }

      const similarUsers = await this.findSimilarUsers(userInfo);

      if (similarUsers.length > 0) {
        const recommendedCertifications = await SuggestionRepository.findSimilarUsersCertifications(userInfo);
        return this.mapToDto(recommendedCertifications);
      }

      return await this.getDefaultRecommendations(userInfo);
    } catch (error) {
      console.error('추천 생성 중 오류:', error);
      throw error;
    }
  }

  private static async findSimilarUsers(userInfo: UserWithDetails): Promise<UserSimilarityInfo[]> {
    const allUsers = await SuggestionRepository.getAllUsersWithCategories();

    return allUsers
      .map((candidate) => ({
        user: candidate,
        similarity: this.calculateSimilarity(userInfo, candidate)
      }))
      .filter(({ similarity }) => similarity >= 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  private static calculateSimilarity(user: UserWithDetails, candidate: UserWithDetails): number {
    let score = 0;

    // 나이 점수 (가중치 30%)
    if (user.age && candidate.age) {
      const ageDiff = Math.abs(user.age - candidate.age);
      const ageScore = ageDiff <= 5 ? 1 : 0;
      score += ageScore * 0.3;
    }

    // 관심 카테고리 점수 (가중치 50%)
    const userCategories = new Set(user.users.map((uc) => uc.category.name));
    const candidateCategories = new Set(candidate.users.map((uc) => uc.category.name));
    const commonCategories = [...userCategories].filter((c) => candidateCategories.has(c)).length;
    const categoryScore = userCategories.size > 0 
      ? (commonCategories / userCategories.size) * 100 
      : 0;
    score += (categoryScore / 100) * 0.5;

    // 고용 상태 점수 (가중치 20%)
    const employmentScore = user.employmentStatus === candidate.employmentStatus ? 1 : 0;
    score += employmentScore * 0.2;

    return score;
  }

  private static async getDefaultRecommendations(userInfo: UserWithDetails): Promise<SuggestInfoDto[]> {
    const categoryNames = userInfo.users.map((uc) => uc.category.name);
    const defaultRecommendations = await SuggestionRepository.findDefaultCertificationsByCategory(categoryNames);
    return this.mapToDto(defaultRecommendations);
  }

  private static mapToDto(certifications: Array<Certification>): SuggestInfoDto[] {
    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      category: cert.category,
    })).slice(0, 3);
  }
}

// 마이페이지 조회
export const getClosestExams = async (userId: number): Promise<any[]> => {
  const currentDate = new Date();
  const exams = await prisma.exam.findMany({
    where: { userId, examStart: { gte: currentDate } },
    orderBy: { examStart: "asc" },
    take: 2,
  });

  return exams.map((exam) => ({
    name: exam.title,
    date: exam.examStart,
    dDay: Math.ceil(
      (exam.examStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));
};
