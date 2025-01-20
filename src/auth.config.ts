import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver";
import { prisma } from "./db.config.js";

dotenv.config();

// 1. 환경변수 검증
if (!process.env.PASSPORT_GOOGLE_CLIENT_ID || !process.env.PASSPORT_GOOGLE_CLIENT_SECRET){
  throw new Error("Google OAuth environment variables are missing");
}
if (!process.env.PASSPORT_KAKAO_CLIENT_ID || !process.env.PASSPORT_KAKAO_CLIENT_SECRET) {
  throw new Error("Kakao OAuth environment variables are missing");
}
if (!process.env.PASSPORT_NAVER_CLIENT_ID || !process.env.PASSPORT_NAVER_CLIENT_SECRET) {
  throw new Error("Naver OAuth environment variables are missing");
}

// 2. 구글 
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/oauth2/login/google/callback",
    scope: ["email", "profile"],
    state: true,
  }, // 타입 단언 사용
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
  let user = await prisma.user.findFirst({ where: { email, oauthProvider: "google" } });

  // 신규 사용자 여부 확인
  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email || "ggs_email",
        name: profile.displayName || "ggs_user",
        oauthProvider: "google",
        oauthRefreshToken: refreshToken,
      },
    });
  } else {
    await prisma.user.update({
      where: { email, oauthProvider: "google" },
      data: {
        oauthRefreshToken: refreshToken,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    accessToken,
    oauthProvider: user.oauthProvider,
    isNewUser,
  };
};

// 3. 카카오
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

  // 해당 이메일의 유저가 있는지 확인
  let user = await prisma.user.findFirst({ where: { email, oauthProvider: "kakao" }});

  // 신규 사용자 여부 확인
  const isNewUser = !user;

  if (!user) {
    // 신규 사용자라면 User테이블에 저장
    user = await prisma.user.create({
      data: {
        email: email || "ggs_email",
        name: profile.displayName || "ggs_user",
        oauthProvider: "kakao",
        oauthRefreshToken: refreshToken,
      },
    });
  } else {
    // 신규 사용자가 아니면 토큰 업데이트
    await prisma.user.update({
      where: { email, oauthProvider: "kakao" },
      data: {
        oauthRefreshToken: refreshToken,
      },
    });
  }

  return {
    id: user.id,
    email,
    accessToken,
    oauthProvider: user.oauthProvider,
    isNewUser
  };
};

// 4. 네이버
export const naverStrategy = new NaverStrategy(
  {
    clientID: process.env.PASSPORT_NAVER_CLIENT_ID,
    clientSecret: process.env.PASSPORT_NAVER_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/oauth2/login/naver/callback",
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await naverVerify(accessToken, refreshToken, profile);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  }
);

const naverVerify = async (
  accessToken: string,
  refreshToken: string,
  profile: {_json: { email: string, nickname: string, profile_image: string }}
) => {
  // 이메일 주소 추출
  const email = profile._json.email;

  // 해당 이메일의 유저가 있는지 확인
  let user = await prisma.user.findFirst({ where: { email, oauthProvider: "naver" }});

  // 신규 사용자 여부 확인
  const isNewUser = !user;

  if (!user) {
    // 신규 사용자라면 User테이블에 저장
    user = await prisma.user.create({
      data: {
        email: email || "ggs_email",
        name: profile._json.nickname || "ggs_user",
        profileImage: profile._json.profile_image || null,
        oauthProvider: "naver",
        oauthRefreshToken: refreshToken,
      },
    });
  } else {
    // 신규 사용자가 아니면 토큰 업데이트
    await prisma.user.update({
      where: { email, oauthProvider: "naver" },
      data: {
        oauthRefreshToken: refreshToken,
      },
    });
  }

  return {
    id: user.id,
    email,
    accessToken,
    oauthProvider: user.oauthProvider,
    isNewUser
  };
};