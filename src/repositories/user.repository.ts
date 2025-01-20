import { prisma } from "../db.config.js"

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
