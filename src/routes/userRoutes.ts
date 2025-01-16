import { collectUserInfo } from "../controllers/user.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import express from 'express';

const router = express.Router();

router.post('/user-info', verifyToken as express.RequestHandler, collectUserInfo); // 사용자 정보 수집 API

export default router;