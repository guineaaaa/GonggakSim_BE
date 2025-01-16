import { prisma } from "../db.config.js";
import { updateConsent } from "../repositories/user.repository.js"

export const userConsent = async (accessId: number, data: any) => {
    const user = await prisma.user.findUnique({ where: { id: accessId }})
    if(!user) {
        throw new Error("유효하지 않은 사용자입니다.");
    }

    const savedDate = await updateConsent(user.id, data);
    return savedDate;
}