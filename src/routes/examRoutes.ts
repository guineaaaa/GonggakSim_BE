import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { handleAddExamByCertificationSchedule } from "../controllers/exam.controller.js";

const router = express.Router();

// 특정 자격증 시험 일정 등록
router.post(
  "/certifications/:certification_id/schedules/calendar",
  verifyJWT,
  handleAddExamByCertificationSchedule
);

export default router;
