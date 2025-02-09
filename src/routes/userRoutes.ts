import { collectUserInfo, getSuggestions, getUserPage, getHelpDoc, postNickname } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import express from 'express';

const router = express.Router();

router.post('/user-info', verifyJWT, collectUserInfo); // 사용자 정보 수집 API

router.get('/suggest-info', verifyJWT, getSuggestions); // 유사 사용자 시험 추천 API

router.get('/mypage', verifyJWT, getUserPage); // 마이페이지 조회 API

router.patch('/mypage/user-edit', verifyJWT, collectUserInfo); // 회원정보 수정 API

router.post('/user-nickname', verifyJWT, postNickname); // 닉네임 수정/저장

router.get('/help', verifyJWT, getHelpDoc); // 도움말 확인 API

export default router;