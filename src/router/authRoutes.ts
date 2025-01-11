import express, { Request, Response } from "express";

const router = express.Router();

// 로그아웃 라우트
router.post("/logout", (req: Request, res: Response) => {
    const provider = req.query.provider as string;
    let logoutUrl = "";

    if (!provider) {
        res.status(400).json({ 
            error: "Invalid provider",
            message: "You must provide a valid provider ('kakao' or 'google')."
        });
        return;
    }
        
    // 1. 세션 제거
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ 
                error: "Failed to logout ",
                message: err.message
            });
        }


        // 2. SNS 제공자 로그아웃 URL 생성
        if (provider === "kakao") {
            logoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.PASSPORT_KAKAO_CLIENT_ID}&logout_redirect_uri=http://localhost:3000/oauth2/login/kakao`;
        } else if (provider === "google") {
            logoutUrl = `https://accounts.google.com/Logout?continue=http://localhost:3000/oauth2/login/google`;
        }

        // 3. 로그아웃 응답
        res.clearCookie("connect.sid"); // 세션 쿠키 삭제
        return res.status(200).json({
            message: "Successfully logged out",
            snsLogoutUrl: logoutUrl || null, // SNS 로그아웃 URL 반환
        });
    });
});

export default router;