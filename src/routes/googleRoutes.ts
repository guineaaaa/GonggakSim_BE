import express from "express";
import { verifyGoogleToken } from "../auth.config.js";
import { prisma } from "../db.config.js";

const router = express.Router();

// 구글 인증 라우트
router.post("/login/google", async (req, res): Promise<any> => {
  try {
    const { idToken } = req.body;

    console.log(idToken); //검증

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken이 필요합니다." });
    }

    // idToken 검증 -> Google 사용자 정보 가져오기
    const payload = await verifyGoogleToken(idToken);
    if (!payload?.email) {
      return res.status(400).json({ success: false, message: "Google 인증 실패" });
    }

    const email = payload.email;
    const name = payload.name || "Google User";
    const profileImage = payload.picture || null;

    // 기존 사용자 조회
    let user = await prisma.user.findFirst({ where: { email, oauthProvider: "google" } });
    const isNewUser = !user;

    // 신규 사용자라면 저장
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          profileImage,
          oauthProvider: "google",
        },
      });
    }

    // JSON 응답 반환
    return res.status(200).json({
      success: true,
      message: "로그인 성공",
      user: {
        id: user.id,
        email: user.email,
        isNewUser,
        oauthProvider: user.oauthProvider,
      },
    });
  } catch (error) {
    console.error("Google 로그인 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
});

export default router;