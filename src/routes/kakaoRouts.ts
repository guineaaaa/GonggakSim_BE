import express from "express";
import passport from "passport";
import { refreshToken } from '../controllers/auth.controller.js';
import { kakaoStrategy } from "../auth.config.js";

const router = express.Router();

passport.use(kakaoStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>(
  (user, done) => done(null, user)
);

// 카카오 인증 라우트
router.get(
    // #swagger.tags = ["Kakao/Google/Naver"]
    "/login/kakao",
    passport.authenticate("kakao")
);

// 카카오 인증 콜백 라우트
router.get(
    // #swagger.ignore = true
    "/login/kakao/callback",
    passport.authenticate("kakao", {
      failureRedirect: "/login/kakao",
      failureMessage: true,
      session: false
    }),
    (req, res) => {
      // 사용자 데이터 가져오기
      const user = req.user as { email: string; accessToken: string; isNewUser: boolean };
      const { accessToken, isNewUser } = user;

      // 데이터 확인
      console.log(user);
  
      // 액세스 토큰 쿠키 저장
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1시간
        sameSite: "lax", // "strict"는 https 환경
        path: '/' //모든 경로에서 쿠키 접근 가능
      });
  
      // 리다이렉트 처리
      const redirectURL = isNewUser ? "/oauth2/consent" : "/";
      res.redirect(redirectURL);
    }
);

// 토큰 갱신 라우트
router.post('/refresh-token', refreshToken);

export default router;