import { prisma } from "../db.config.js";
import { UserWithDetails } from "../dtos/user.dto.js";

/** 사용자 정보 수집 repository */ 
export const updateConsent = async (
  userId: number,
  data: {
    age: number;
    department: string;
    grade: string;
    category: string[];
    employmentStatus: string;
    employCategory: string;
  }
) => {

  if (data.age < 18 && data.age > 36) {
    throw new Error("18세 미만, 36세 이상은 가입 불가능합니다.");
  }

  // 먼저 기존 UserCategory 관계를 삭제 (중복 방지)
  await prisma.userCategory.deleteMany({
    where: { userId },
  });

  // 새로운 카테고리를 UserCategory에 추가
  const categoryRecords = await prisma.category.findMany({
    where: { name: { in: data.category } },
  });

  const userCategories = categoryRecords.map((category) => ({
    userId,
    categoryId: category.id,
  }));

  await prisma.userCategory.createMany({
    data: userCategories,
  });

  // 사용자 정보 업데이트
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      age: data.age,
      department: data.department,
      grade: data.grade,
      employmentStatus: data.employmentStatus,
      employCategory: data.employCategory,
    },
  });
};

/** 유사 사용자 시험 추천 repository */
export class SuggestionRepository {
  static async getUserInfo(userEmail: string) {
    return prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        age: true,
        employmentStatus: true,
        users: {
          select: {
            category: { 
              select: { 
                id: true,
                name: true 
              },
            },
          },    
        },
        exams: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  static async getAllUsersWithCategories() {
    return prisma.user.findMany({
      select: {
        id: true,
        age: true,
        employmentStatus: true,
        users: {
          select: {
            category: { 
              select: { 
                id: true,
                name: true 
              } 
            },
          },
        },
        exams: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // 사용자 캘린더의 시험을 기반으로 Certification에 등록되어있는 자격증만 최대 3개 조회
  static async getCertificationsByExamTitles(examTitles: string[]): Promise<{ id: number; name: string; category: string }[]> {
    if (examTitles.length === 0) return [];
    return prisma.certification.findMany({
      where: {
        name: { in: examTitles },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      take: 3,
    });
  }


  // 신규 사용자와 일치하는 사용자가 없다면, 랜덤으로 certification에서 자동 3개 추천
  static async findDefaultCertificationsByCategory(categoryNames: string[]) {
    return prisma.certification.findMany({
      where: { 
        category: { in: categoryNames },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
      take: 3,
      orderBy: { category: 'asc' },
    });
  }
}