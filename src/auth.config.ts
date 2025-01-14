import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { prisma } from "./db.config.js";

dotenv.config();

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/oauth2/login/google/callback",
    scope: ["email", "profile"],
    state: true,
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await googleVerify(accessToken, refreshToken, profile);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  }
);

const googleVerify = async (
  accessToken: string,
  refreshToken: string,
  profile: { emails?: { value: string }[]; displayName: string }
) => {
  // 이메일 주소 추출
  const email = profile.emails?.[0]?.value;

  let user = await prisma.user.findFirst({ where: { email } });

  // 신규 사용자 여부 확인
  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email || "general",
        name: profile.displayName || "Unknown User",
        oauthProvider: "google",
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
      },
    });
  } else {
    await prisma.user.update({
      where: { email },
      data: {
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isNewUser,
  };
};

export const kakaoStrategy = new KakaoStrategy(
  {
    clientID: process.env.PASSPORT_KAKAO_CLIENT_ID,
    clientSecret: process.env.PASSPORT_KAKAO_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/oauth2/login/kakao/callback",
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await kakaoVerify(accessToken, refreshToken, profile);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  }
);

const kakaoVerify = async (
  accessToken: string,
  refreshToken: string,
  profile: { _json: { kakao_account: { email: string } }; displayName: string }
) => {
  // 이메일 주소 추출
  const email = profile._json.kakao_account.email;

  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    // 새 사용자 생성
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName || "Unknown User",
        oauthProvider: "kakao",
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
      },
    });
  } else {
    // 토큰 업데이트
    await prisma.user.update({
      where: { email },
      data: {
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};
