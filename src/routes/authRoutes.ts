import express, { Request, Response } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logoutUser, deleteUserAccount, AuthController } from '../controllers/auth.controller.js';
import { updateAgreement } from '../controllers/consent.controller.js';


const router = express.Router();
const auth = new AuthController;

router.post('/login', auth.login); // 일반 로그인
router.post('/register', auth.register); // 일반 회원가입

// 미들웨어 토큰 검증 확인 라우터
router.post("/verify-token", verifyJWT, async(req: Request, res: Response) => {
  try{
    res.json({
      success: true,
      message: "토큰 검증 성공",
      user: req.user, // 미들웨어에서 추가한 사용자 정보
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "재로그인 해주세요."})
  }
});

// 이용약관 동의 라우터
router.post('/consent', verifyJWT, updateAgreement);

// 로그아웃 라우터
router.post("/logout", verifyJWT, logoutUser);

// 회원탈퇴 라우터
router.post("/delete-account", verifyJWT, deleteUserAccount);

export default router;