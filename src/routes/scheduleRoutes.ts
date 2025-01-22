import express from "express";
import { getSchedulesByMonth } from "../controllers/schedule.controller.js";

const router = express.Router();

// 특정 월의 시험 일정 조회
router.get("/certifications/:certificationId/schedules/:month", getSchedulesByMonth);

export default router;
