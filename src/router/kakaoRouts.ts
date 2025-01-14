import express from "express";
import passport from "passport";
import { kakaoStrategy } from "../auth.config.js";

const router = express.Router();

passport.use(kakaoStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>(
  (user, done) => done(null, user)
);


// 카카오 인증 라우트
router.get("/login/kakao", passport.authenticate("kakao")
/*
    #swagger.tags = ["Kakao/Google/Naver"]
*/
);

// 카카오 인증 콜백 라우트
router.get(
    // #swagger.ignore = true
    "/login/kakao/callback",
    passport.authenticate("kakao", {
        failureRedirect: "/oauth2/login/kakao",
        failureMessage: true,
    }),
    (req, res) => {
        res.redirect("/");
    }
);

export default router;