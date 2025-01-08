import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import passport from "passport";

import { googleStrategy } from "./auth.config.js";
import { prisma } from "./db.config.js";

//swagger
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";

// 환경 변수 로드
dotenv.config();

const app = express()
const port = process.env.PORT;

// Passport 설정
passport.use(googleStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ id: string; email: string; name: string }>(
  (user, done) => done(null, user)
);


// 공통 응답 메서드 확장 미들웨어
app.use((req, res, next) => {

  res.create = (create) => {
    return res.json({
      resultType: "CREATE",
      error: null,
      create});
  };

  res.success = (success) => {
    return res.json({ 
      resultType: "SUCCESS", 
      error: null, 
      success });
  };

  res.error = ({ 
    errorCode = "unknown", 
    reason = null, 
    data = null }) => {
    
      return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };

  next();
});

// swagger 설정
app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null"; // 파일 출력은 사용하지 않습니다.
  const routes = ["./src/index.ts"]; // typescript에 따라서 index.ts로 변경
  const doc = {
    info: {
      title: "Gonggaksim API",
      description: "공각심 swagger",
    },
    host: "localhost:${port}",
  };
  
  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

// Express 기본 설정
// cors 방식 허용
// Case1 'Access-Control-Allow-Origin' header..' 특정 프론트엔드 주소 허용 시 : {origin: ["<프론트엔드_주소_및_포트>"],} 처럼 설정해준다.
// Case2 'Request header field x-auth-token..' 프론트 엔드에서 보내는 header 정보 확인 : {allowedHeaders: ["x-auth-token", ...],}
app.use(cors());

app.use(express.static('public'));          // 정적 파일 접근
app.use(express.json());                    // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// 세션 설정
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
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


// API 작성 //

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// 인증 라우트
app.get("/oauth2/login/google", passport.authenticate("google"));
app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    failureRedirect: "/oauth2/login/google",
    failureMessage: true,
  }),
  (req, res) => {
    res.redirect("/");
  }
);


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


// 서버 실행
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})