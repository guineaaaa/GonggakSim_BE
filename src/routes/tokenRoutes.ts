import express, { Request, Response } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 미들웨어 토큰 검증 확인 라우터
router.post("/verify-token", verifyToken, async(req: Request, res: Response) => {
  res.json({
    success: true,
    message: "토큰 검증 성공",
    user: req.user, // 미들웨어에서 추가한 사용자 정보
  });
});

export default router;
