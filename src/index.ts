import cors from "cors";

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import kakaoRoutes from "./routes/kakaoRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import naverRoutes from "./routes/naverRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";

import { prisma } from "./db.config.js";

//swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// controllers
import {
  handleAddExam,
  handleGetExam,
  handleDeleteExam,
} from "./controllers/exam.controller.js";
import { handleRecommendSchedule } from "./controllers/schedule.controller.js";
import { handleGetCertifications } from "./controllers/certification.controller.js";
import { handleDnDNotification } from "./controllers/notification.controller.js";

import {
  handleGetAllCertifications,
  handleGetCertificationsByCategory,
  handleGetCertificationById,
} from "./controllers/certificateInquiry.controller.js";

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT;

// 공통 응답 메서드 확장 미들웨어
app.use((req, res, next) => {
  res.create = (create) => {
    return res.json({
      resultType: "CREATE",
      error: null,
      create,
    });
  };

  res.success = (success) => {
    return res.json({
      resultType: "SUCCESS",
      error: null,
      success,
    });
  };

  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };

  next();
});

// swagger 설정
const swaggerSpec = YAML.load(path.join("./src/swagger/openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Express 기본 설정
// cors 방식 허용
// Case1 'Access-Control-Allow-Origin' header..' 특정 프론트엔드 주소 허용 시 : {origin: ["<프론트엔드_주소_및_포트>"],} 처럼 설정해준다.
// Case2 'Request header field x-auth-token..' 프론트 엔드에서 보내는 header 정보 확인 : {allowedHeaders: ["x-auth-token", ...],}
app.use(cors());

app.use(express.static("public")); // 정적 파일 접근
app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// 쿠키 파서 설정
app.use(cookieParser());

// 세션 설정
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // ms : 주기적으로 만료된 세션 삭제
      dbRecordIdIsSessionId: true, // 세션 ID를 데이터베이스 레코드 ID로 사용
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
}); // 기본 라우트

app.use("/oauth2", googleRoutes); // 구글 인증 라우트
app.use("/oauth2", kakaoRoutes); // 카카오 인증 라우트
app.use("/oauth2", naverRoutes); // 네이버 인증 라우트
app.use("/oauth2", authRoutes); // 로그아웃, 토큰 갱신, 토큰 검증, 이용약관 동의 라우트
app.use("/api/v1/users", userRoutes); // 사용자 정보 수집 API, 유사 사용자 추천 API, 회원정보 수정 API

// 캘린더 API
app.post("/api/v1/calander/exams", handleAddExam);
app.get("/api/v1/calander/exams", handleGetExam);
app.delete("/api/v1/calander/exams/:id", handleDeleteExam); //삭제하려는 시험 id

// 알림 방해금지 시간대 설정 API
app.post("/api/v1/notification/settings", handleDnDNotification);

// AI 시험 추천 API
app.post("/api/v1/schedule/recommendation", handleRecommendSchedule);

// 자격증 검색 API
app.get("/api/v1/certifications/search", handleGetCertifications);

//자격증 목록 조회 API
app.get("/api/v1/certifications", handleGetAllCertifications);
app.get(
  "/api/v1/certifications/category/:category",
  handleGetCertificationsByCategory
);
app.get("/api/v1/certifications/:id", handleGetCertificationById);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 전역 오류 처리 미들웨어
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

app.use("/api/v1", scheduleRoutes);

// 서버 실행
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
