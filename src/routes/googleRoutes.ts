import express from "express";
import passport from "passport";
import { googleStrategy } from "../auth.config.js";

const router = express.Router();

passport.use(googleStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>(
  (user, done) => done(null, user)
);


// 구글 인증 라우트
router.get("/login/google", passport.authenticate("google", {
  accessType: 'offline',  // refreshToken을 받기 위해 필요
  //prompt: 'consent',      // 매번 사용자 동의 화면을 보여줌 //select_account, login
})
/*
#swagger.tags = ["Kakao/Google/Naver"]
*/
);

// 구글 인증 콜백 라우트
router.get(
    // #swagger.ignore=true
    "/login/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/oauth2/login/google",
      failureMessage: true,
    }),
    (req, res) => {
      const user = req.user as { id: number; email: string; accessToken: string; isNewUser: boolean };
      const { id, email, accessToken, isNewUser } = user;

      // 데이터 확인
      console.log(user);
  
      // 액세스 토큰 쿠키 저장
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 10000, // 1시간
        sameSite: "lax", // "strict"는 https 환경
        path: '/' //모든 경로에서 쿠키 접근 가능
      });
  
      // 리다이렉트 처리
      const redirectURL = isNewUser ? "/oauth2/consent" : "/";
      res.redirect(redirectURL);
    }
  );

export default router;