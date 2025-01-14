import express from "express";
import passport from "passport";
import { googleStrategy } from "../auth.config.js";

const router = express.Router();

passport.use(googleStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser<{ email: string; name: string }>(
  (user, done) => done(null, user)
);


// 구글 인증 라우트
router.get("/login/google", passport.authenticate("google")
/*
#swagger.tags = ["Kakao/Google/Naver"]
*/
);

// 구글 인증 콜백 라우트
router.get(
    // #swagger.ignore=true
    "/login/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/oauth2/login/google",
        failureMessage: true,
    }),
    (req, res) => {
        res.redirect("/");
    }
);

export default router;