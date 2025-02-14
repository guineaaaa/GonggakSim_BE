import express, { Request, Response } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logoutUser, deleteUserAccount, AuthController } from '../controllers/auth.controller.js';
import { updateAgreement } from '../controllers/consent.controller.js';


const router = express.Router();
const auth = new AuthController;

router.post('/login', auth.login);
router.post('/register', auth.register);

// 미들웨어 토큰 검증 확인 라우터
router.post("/verify-token", verifyJWT, async(req: Request, res: Response) => {
  res.json({
    success: true,
    message: "토큰 검증 성공",
    user: req.user, // 미들웨어에서 추가한 사용자 정보
  });
});

// // 토큰 갱신 라우터 -> 리프레시 토큰이 만료면 재로그인(클라이언트에서 리다이렉트 /oauth2/login/provider)
// router.post('/refresh-token', verifyRefreshToken, refreshUserToken);

// 이용약관 동의 라우터
router.post('/consent', verifyJWT, updateAgreement);

// 로그아웃 라우터
router.post("/logout", verifyJWT, logoutUser);

// 회원탈퇴 라우터
router.post("/delete-account", verifyJWT, deleteUserAccount);

export default router;