import express, { Request, Response } from "express";
import { verifyToken, verifyRefreshToken } from "../middlewares/auth.middleware.js";
import { refreshUserToken, logoutUser, deleteUserAccount, } from '../controllers/auth.controller.js';
import { updateAgreement } from '../controllers/consent.controller.js';

const router = express.Router();

// 미들웨어 토큰 검증 확인 라우터
router.post("/verify-token", verifyToken, async(req: Request, res: Response) => {
  res.json({
    success: true,
    message: "토큰 검증 성공",
    user: req.user, // 미들웨어에서 추가한 사용자 정보
  });
});

// 토큰 갱신 라우터 -> 리프레시 토큰이 만료면 재로그인(클라이언트에서 리다이렉트 /oauth2/login/provider)
router.post('/refresh-token', verifyRefreshToken, refreshUserToken);

// 이용약관 동의 라우터
router.post('/consent', verifyToken, updateAgreement);

// 로그아웃 라우터
router.post("/logout", verifyToken, logoutUser);

// 회원탈퇴 라우터
router.post("/delete-account", verifyToken, deleteUserAccount);

export default router;