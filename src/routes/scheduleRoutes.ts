import express from "express";
import { getDatesByMonth, handleCheckScheduleRegistration } from "../controllers/schedule.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 특정 월의 모든 날짜 가져오기
router.get(
  "/certifications/:certificationId/schedules/:month",
  verifyToken, // 인증 미들웨어 추가
  getDatesByMonth
);

// 접수기간 확인 API
router.get(
  "/certifications/:certificationId/schedules/:scheduleId/check",
  verifyToken, // 인증 미들웨어 추가
  handleCheckScheduleRegistration
);

export default router;
