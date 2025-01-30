import express from "express";
import { getDatesByMonth } from "../controllers/schedule.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 특정 월의 모든 날짜 가져오기
router.get(
  "/certifications/:certificationId/schedules/:month",
  verifyToken, // 인증 미들웨어 추가
  getDatesByMonth
);

export default router;
