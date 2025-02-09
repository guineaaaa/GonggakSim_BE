import express from "express";
import passport from "passport";
import { naverStrategy } from "../auth.config.js";
import { generateJWTToken } from "../utils/jwt.utils.js";

const router = express.Router();

passport.use(naverStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>((user, done) => done(null, user));


// 카카오 인증 라우트
router.get(
    "/login/naver",
    passport.authenticate("naver")
);

// 네이버 인증 콜백 라우트
router.get(
  "/login/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: "/login/naver",
    failureMessage: true, 
  }),
  async (req, res): Promise<any> => {
    try{
      // 사용자 데이터 가져오기
      const user = req.user as { id: number; email: string; oauthProvider: string; oauthRefreshToken: string; isNewUser: boolean };

      // 2. JWT 토큰에 담을 payload (예: id, email, provider 등)
      const payload = { id: user.id, email: user.email, provider: user.oauthProvider };

      // 3. 데이터 확인
      console.log(payload);

      // 4. jwt토큰 생성
      const jwtToken = generateJWTToken(payload);
  
      // 5. 클라이언트(Android)에 JSON으로 응답 전달 -> android쪽에서 isNewUser로 /consent or /home 으로 리다이렉트
      return res.status(200).json({
        success: true,
        message: "로그인 성공",
        accessToken: jwtToken,
        refreshToken: user.oauthRefreshToken,
        isNewUser: user.isNewUser,
      });
    } catch (error) {
      console.error("JWT 생성 오류:", error);
        return res.status(500).json({
          success: false,
          message: "토큰 생성에 실패했습니다.",
      });
    }
  }
);

export default router;