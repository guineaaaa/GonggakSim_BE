import { prisma } from "../db.config.js";

// 사용자 정보 수집 repo
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


// 유사 사용자 시험 추천 repo

interface UserSimilarityInfo {
  user: UserWithDetails;
  similarity: number;
}

interface UserWithDetails {
  id: number;
  age: number | null;
  employmentStatus: string | null;
  users: { category: { id: number; name: string } }[];
  exams: { id: number; title: string }[];
}

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

  static async findSimilarUsersCertifications(userInfo: UserWithDetails) {
    const categoryNames = userInfo.users.map((uc) => uc.category.name);
    
    return prisma.certification.findMany({
      where: { 
        category: { in: categoryNames },
      },
      take: 3,
    });
  }

  static async findDefaultCertificationsByCategory(categoryNames: string[]) {
    return prisma.certification.findMany({
      where: { 
        category: { in: categoryNames },
      },
      take: 3,
      orderBy: { category: 'asc' },
    });
  }
}