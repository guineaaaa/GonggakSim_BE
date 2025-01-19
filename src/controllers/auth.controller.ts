import { Request, Response } from 'express';
import { refreshAccessToken, logoutFromSNS, deleteAccount, clearSession } from '../services/auth.service.js';
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { StatusCodes } from 'http-status-codes';

// 토큰 갱신 controller
export const refreshUserToken = async (req: Request, res: Response) => {
    try {
        const { user } = req as AuthRequest; // AuthRequest로 타입 캐스팅
        const accessEmail = user?.email; //verifyToken으로부터 사용자 email 가져오기

        if (!accessEmail) {
            res.status(StatusCodes.UNAUTHORIZED).json({ 
                success: false, 
                message: "인증이 필요합니다.- authController" 
            });
        }
        
        const tokens = await refreshAccessToken(accessEmail);
        console.log("받은 토큰:", tokens); // 토큰 확인

        if (!tokens) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "반환된 토큰이 없습니다.",
            })as any;
        }

        res.cookie("accessToken", tokens, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 1000, // 1시간
            sameSite: "lax", // "strict"는 https 환경
            path: '/' //모든 경로에서 쿠키 접근 가능
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "토큰이 성공적으로 갱신되었습니다."
        });

    } catch (error) {
        console.error('Token refresh error:', error); // 확인용
        return res.status(401).json({ 
            success: false, 
            message: "토큰 갱신 실패" 
        });
    }
}

// 로그아웃 controller
export const logoutUser = async (req: Request, res: Response) => {
    try {
        const { user } = req as AuthRequest;
        const provider = req.query.provider as string;
    
        if (!user) throw new Error("사용자가 인증되지 않았습니다.");
        const logoutUrl = await logoutFromSNS(provider);
    
        await clearSession(req, res, "로그아웃 성공.", logoutUrl);
      } catch (error) {
        res.status(500).json({
          errorCode: "logout_error",
          reason: "서버 에러 500",
        });
    }
};


// 회원탈퇴 controller
export const deleteUserAccount = async (req: Request, res: Response) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) throw new Error("쿠키에서 액세스 토큰을 찾을 수 없습니다.");

        const { user } = req as AuthRequest;
        const accessEmail = user?.email;
    
        await deleteAccount(accessEmail, accessToken);
        await clearSession(req, res, "회원탈퇴 완료");
      } catch (error) {
        res.status(500).json({
          errorCode: "account_deletion_error",
          reason: "회원탈퇴 서버 에러",
        });
    }
};