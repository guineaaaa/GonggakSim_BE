import { prisma } from "../db.config.js"

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
        where: { userId }
    });

    // 새로운 카테고리를 UserCategory에 추가
    const categoryRecords = await prisma.category.findMany({
        where: { name: { in: data.category } },
    });

    const userCategories = categoryRecords.map(category => ({
        userId,
        categoryId: category.id,
    }));

    await prisma.userCategory.createMany({
        data: userCategories,
    });

    // 사용자 정보 업데이트
    return prisma.user.update({
        where: {
            id: userId
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
export class SuggestionRepository {
    // 사용자 정보와 연결된 카테고리 이름 가져오기
    static async getUserInfo(userEmail: string) {
      return prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          age: true,
          department: true,
          users: {
            select: {
              category: { // userCategory 모델의 category 조회
                select: {
                  name: true, // Category 모델의 name 가져오기
                },
              },
            },
          },
        },
      });
    }
  
    // 1순위: 완벽히 일치하는 사용자
    static async findMatchingUsersCertifications(params: {
        age: number | null;
        department: string | null;
        categoryNames: string[];
      }) {
        const { age, department, categoryNames } = params;
    
        // Find exams from users with similar characteristics
        const similarUsersExams = await prisma.exam.groupBy({
          by: ['title'],
          where: {
            user: {
              age: age,
              department: department,
              users: {
                some: {
                  category: {
                    name: { in: categoryNames },
                  },
                },
              },
            },
          },
          _count: {
            title: true,
          },
          orderBy: {
            _count: {
              title: 'desc',
            },
          },
        });
    
        // Get corresponding certifications
        return await Promise.all(
          similarUsersExams.map(async (exam) => {
            const certification = await prisma.certification.findFirst({
              where: {
                name: exam.title,
              },
              select: {
                id: true,
                name: true,
                category: true,
              },
            });
    
            return {
              id: certification?.id ?? 0,
              name: certification?.name ?? exam.title,
              category: certification?.category ?? 'Unknown',
            };
          })
        );
      }
  
    // 2순위: 부분적으로 일치하는 사용자
    static async findPartiallyMatchingUsersCertifications(params: {
        age: number | null;
        department: string | null;
        categoryNames: string[];
      }) {
        const { age, department, categoryNames } = params;
        
        const ageRange = age ? {
          gte: age - 2,
          lte: age + 2,
        } : undefined;
    
        const similarUsersExams = await prisma.exam.groupBy({
          by: ['title'],
          where: {
            user: {
              OR: [
                { age: ageRange },
                { department: department },
                {
                  users: {
                    some: {
                      category: {
                        name: { in: categoryNames },
                      },
                    },
                  },
                },
              ],
            },
          },
          _count: {
            title: true,
          },
          orderBy: {
            _count: {
              title: 'desc',
            },
          },
        });
    
        return await Promise.all(
          similarUsersExams.map(async (exam) => {
            const certification = await prisma.certification.findFirst({
              where: {
                name: exam.title,
              },
              select: {
                id: true,
                name: true,
                category: true,
              },
            });
    
            return {
              id: certification?.id ?? 0,
              name: certification?.name ?? exam.title,
              category: certification?.category ?? 'Unknown',
            };
          })
        );
      }
  
    // 기본 추천 자격증
    static async findDefaultCertificationsByCategory(categoryNames: string[]) {
      return prisma.certification.findMany({
        where: { category: { in: categoryNames } }, // Certification의 category가 Category의 name과 일치
        select: {
          id: true,
          name: true,
          category: true,
        },
        orderBy: { category: 'asc' },
      });
    }
}