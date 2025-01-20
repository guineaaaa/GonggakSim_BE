import express, { Request, Response } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
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

// 토큰 갱신 라우터
router.post('/refresh-token', verifyToken, refreshUserToken);

// 이용약관 동의 라우터
router.post('/consent', verifyToken, updateAgreement);

// 로그아웃 라우터
router.post("/logout", verifyToken, logoutUser);

// 회원탈퇴 라우터
router.post("/delete-account", verifyToken, deleteUserAccount);

export default router;