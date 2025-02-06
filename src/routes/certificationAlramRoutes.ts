import express from "express";
import { handleCreateCertificationAlarm } from "../controllers/certificationAlram.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 인증된 사용자만 알림을 설정할 수 있도록 verifyToken 미들웨어 추가 가능
router.post(
  "/certifications/:certificationId/notifications",
  verifyToken,
  handleCreateCertificationAlarm
);

export default router;