import { prisma } from "../db.config.js"

export const findUserByToken = async (oauthAccessToken: string) => {
    const user = await prisma.user.findFirst({where: {oauthAccessToken: oauthAccessToken} });
    return user;
};

export const updateConsent = async (
    userId: number,
    data: {
        age: number;
        department: string;
        grade: string;
        category: string;
        employmentStatus: string;
    }
) => {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: {
          age: data.age,
          department: data.department,
          grade: data.grade,
          userCategory: data.category,
          employmentStatus: data.employmentStatus,
        },
    });
};

