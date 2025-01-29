import express from "express";
import passport from "passport";
import { kakaoStrategy } from "../auth.config.js";

const router = express.Router();

passport.use(kakaoStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>(
  (user, done) => done(null, user)
);

// 카카오 인증 라우트
router.get(
    "/login/kakao",
    passport.authenticate("kakao")
);

// 카카오 인증 콜백 라우트
router.get(
    "/login/kakao/callback",
    passport.authenticate("kakao", {
      failureRedirect: "/login/kakao",
      failureMessage: true,
      session: false
    }),
    (req, res) => {
      // 사용자 데이터 가져오기
      const user = req.user as { email: string; accessToken: string; refreshToken: string; isNewUser: boolean };
      const { accessToken, refreshToken, isNewUser } = user;

      // 데이터 확인
      console.log(user);
  
      // 클라이언트(Android)에 JSON으로 응답 -> android쪽에서 isNewUser로 /consent or /home 으로 리다이렉트
      res.status(200).json({
        success: true,
        message: "로그인 성공",
        accessToken,
        refreshToken,
        isNewUser,
    });
  }
);

export default router;