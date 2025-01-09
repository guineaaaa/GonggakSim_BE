import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.config.js";

dotenv.config();

export const googleStrategy = new GoogleStrategy(
    {
      clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/oauth2/callback/google",
      scope: ["email", "profile"],
      state: true,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try{
        const user = await googleVerify(profile);
        cb(null, user);
      } catch (err) {
        cb(err);
      }
    }
  );
  
const googleVerify = async (profile: {
  id: string; emails?: { value: string }[]; displayName: string; }) => {
  // 이메일 주소 추출
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error(`profile.email was not found: ${profile}`);
  }
    
  const user = await prisma.user.findFirst({ where: { email } });

  if (user) {
    return { id: user.id, email: user.email, name: user.name };
  }
    
  const created = await prisma.user.create({
    data: {
      email,
      name: profile.displayName || "Unknown User",
      oauthProvider: "google", // 기본값
      oauthToken: profile.id,  // Google 프로필의 ID를 토큰으로 저장
      userCategory: "general", // 기본값
      employmentStatus: "unemployed", // 기본값
    },
  });
    
  return { id: created.id, email: created.email, name: created.name };
};