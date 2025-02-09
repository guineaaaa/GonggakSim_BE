import { Router } from "express";
import { handleGetQuizzesByCertificationAndType, handleValidateQuizAnswer } from "../controllers/quiz.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ POST 요청을 처리하는 엔드포인트 추가
router.post("/", verifyJWT, handleGetQuizzesByCertificationAndType);

// 퀴즈 정답 검증 엔드포인트 추가
router.post("/validate", verifyJWT, handleValidateQuizAnswer);

export default router;