import jwt from 'jsonwebtoken';
import { prisma } from "../db.config.js";

export const generateToken = (user: { id: number; email: string }) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' } // 토큰 만료시간
    );
};

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: { oauthRefreshToken: refreshToken }
        });

        if (!user) {
            throw new Error("잘못된 refreshToken입니다.");
        }

        const newAccessToken = generateToken({
            id: user.id,
            email: user.email
        });

        return {
            accessToken: newAccessToken,
            user: {
                id: user.id,
                email: user.email
            }
        };
    } catch (err) {
        throw new Error("토큰 갱신 실패");
    }
}