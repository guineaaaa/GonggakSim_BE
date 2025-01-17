import { prisma } from '../db.config.js';
import {refreshGoogleToken, refreshKakaoToken, refreshNaverToken } from '../utils/auth.utils.js';

export const refreshAccessToken = async (accessEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: accessEmail }
    });

    if (!user || !user.oauthRefreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
    }

    let newOAuthAccessToken;
    switch (user.oauthProvider) {
        case 'google':
            newOAuthAccessToken = await refreshGoogleToken(user.oauthRefreshToken);
            break;
        case 'kakao':
            newOAuthAccessToken = await refreshKakaoToken(user.oauthRefreshToken);
            break;
        case 'naver':
            newOAuthAccessToken = await refreshNaverToken(user.oauthRefreshToken);
            break;
        default:
            throw new Error("지원하지 않는 OAuth 제공자입니다.");
    }
    return newOAuthAccessToken;
}