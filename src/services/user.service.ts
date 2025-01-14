import { User } from "@prisma/client";
import { InvaliDataError } from "../errors.js";
import { updateConsent, findUserByToken } from "../repositories/user.repository.js"

export const userConsent = async (oauthAccessToken: any, data: any) => {
    const user = await findUserByToken(oauthAccessToken);
    if(!user) {
        throw new InvaliDataError("유효하지 않은 사용자입니다.", oauthAccessToken);
    }

    const savedDate = await updateConsent(user.id, data);
    return savedDate;
}