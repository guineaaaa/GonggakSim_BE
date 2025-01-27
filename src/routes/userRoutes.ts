import { collectUserInfo, getSuggestions, getUserPage } from "../controllers/user.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import express from 'express';

const router = express.Router();

router.post('/user-info', verifyToken, collectUserInfo); // 사용자 정보 수집 API

router.get('/suggest-info', verifyToken, getSuggestions); // 유사 사용자 시험 추천 API

router.get('/mypage', verifyToken, getUserPage); // 마이페이지 조회 API

router.patch('/mypage/user-edit', verifyToken, collectUserInfo); // 회원정보 수정 API

router.get('/help', verifyToken); // 도움말 확인 API

export default router;