import { collectUserInfo, getSuggestions } from "../controllers/user.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import express from 'express';

const router = express.Router();

router.post('/user-info', verifyToken, collectUserInfo); // 사용자 정보 수집 API

router.get('/suggest-info', verifyToken, getSuggestions); // 유사 사용자 시험 추천 API

export default router;