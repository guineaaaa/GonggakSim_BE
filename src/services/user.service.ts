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
        return await this.getNoCategoryRecommend(userInfo);
      }

      const similarUsers = await this.findSimilarUsers(userInfo);

      if (Array.isArray(similarUsers) && similarUsers.length > 0) {
        // 유사 사용자들의 exam 제목 추출 (중복 제거)
        const examTitlesSet = new Set<string>();
        similarUsers.forEach(({ user }) => {
          user.exams.forEach((exam) => {
            examTitlesSet.add(exam.title);
          });
        });

        const examTitles = Array.from(examTitlesSet);

        // 만약 추출된 exam 제목이 없으면 기본 추천 호출
        if (examTitles.length === 0) {
          return await this.getDefaultRecommendations(userInfo);
        }

        // exam 제목과 Certification.name이 일치하는 자격증 조회
        const recommendedCertifications = await SuggestionRepository.getCertificationsByExamTitles(examTitles);

        // 만약 추천된 자격증이 없으면 기본 추천 호출
        if (!recommendedCertifications || recommendedCertifications.length === 0) {
          return await this.getDefaultRecommendations(userInfo);
        }

        return this.mapToDto(recommendedCertifications);
      }

      // 유사 사용자가 없는 경우 기본 추천 실행
      return await this.getDefaultRecommendations(userInfo);

    } catch (error) {
      console.error("추천 생성 중 오류:", error);
      throw error;
    }
  }



  // 유사 사용자 찾기: 전체 사용자 중에서 현재 사용자와의 유사도 계산
  private static async findSimilarUsers(userInfo: UserWithDetails): Promise<UserSimilarityInfo[]> {
    const allUsers = await SuggestionRepository.getAllUsersWithCategories();
  
    return allUsers
      .map((candidate) => ({
        user: candidate,
        similarity: this.calculateSimilarity(userInfo, candidate),
      }))
      .filter(({ similarity }) => similarity >= 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }
  
  // 유사도 계산 함수
  private static calculateSimilarity(user: UserWithDetails, candidate: UserWithDetails): number {
    let score = 0;
  
    // 나이 점수 (가중치 30%)
    if (user.age !== null && candidate.age !== null) {
      const ageDiff = Math.abs(user.age - candidate.age);
      const ageScore = ageDiff <= 5 ? 1 : 0;
      score += ageScore * 0.3;
    }
  
    // 관심 카테고리 점수 (가중치 50%)
    const userCategories = new Set(user.users.map((uc) => uc.category.name));
    const candidateCategories = new Set(candidate.users.map((uc) => uc.category.name));
    const commonCategoriesCount = [...userCategories].filter((cat) => candidateCategories.has(cat)).length;
    const categoryScore = userCategories.size > 0 ? (commonCategoriesCount / userCategories.size) * 100 : 0;
    score += (categoryScore / 100) * 0.5;
  
    // 고용 상태 점수 (가중치 20%)
    const employmentScore = user.employmentStatus === candidate.employmentStatus ? 1 : 0;
    score += employmentScore * 0.2;
  
    return score;
  }
  
  // 유사 사용자 없는 경우: 사용자의 관심 카테고리에 기반한 자격증 추천
  private static async getDefaultRecommendations(userInfo: UserWithDetails): Promise<SuggestInfoDto[]> {
    const categoryNames = userInfo.users.map((uc) => uc.category.name);
    const defaultCertifications = await SuggestionRepository.findDefaultCertificationsByCategory(categoryNames);
    return this.mapToDto(defaultCertifications);
  }
  
  private static mapToDto(certifications: { id: number; name: string; category: string }[]): SuggestInfoDto[] {
    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      category: cert.category,
    })).slice(0, 3);
  }

  // 카테고리 없는 경우
  private static async getNoCategoryRecommend(userInfo: UserWithDetails): Promise<SuggestInfoDto[]> {
    // 지정된 자격증 ID 목록
    const defaultCertificationIds = [1, 8, 27]; // TOEIC, 컴퓨터활용능력 1급 필기, 테셋
  
    const defaultCertifications = await prisma.certification.findMany({
      where: { 
        id: { in: defaultCertificationIds },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: { id: 'asc' },
    });
  
    return this.mapToDto(defaultCertifications);
  }
}

/** 가장 임박한 시험 최대 3개 조회 */
export const getClosestExams = async (userId: number): Promise<any[]> => {
  const currentDate = new Date();
  const exams = await prisma.exam.findMany({
    where: { userId, examStart: { gte: currentDate } },
    orderBy: { examStart: "asc" },
    take: 3,
  });

  return exams.map((exam) => ({
    name: exam.title,
    date: exam.examStart,
    dDay: Math.ceil(
      (exam.examStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));
};


/** 사용자 닉네임 수정/저장 */
const isValidNickname = (nickname: string): boolean => {
  const nicknameRegex = /^[가-힣a-zA-Z]{2,10}$/; // 한글/영문 (2~10자)
  return nicknameRegex.test(nickname);
};

export const updateNickname = async (userEmail: string, nickname: string) => {
  if (!isValidNickname(nickname)) {
    return null;
  }

  return await prisma.user.update({
    where: { email: userEmail },
    data: { nickname },
  });
};