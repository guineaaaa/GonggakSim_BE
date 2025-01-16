import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { refreshAccessToken } from "../utils/jwt.utils.js";

// 토큰 갱신
export const refreshToken = async (req: Request, res: Response): Promise<any> => {
    try{
        const { refreshToken } = req.cookies['refreshToken'];

        if(!refreshToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // 새로운 access 토큰 생성
        const result = await refreshAccessToken(refreshToken);

        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // 1시간
            sameSite: 'lax',
            path: '/'
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "토큰이 갱신 성공",
            data: result
        });
    } catch (err) {
        console.error('Token refresh error: ', err);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "토큰 갱신 실패"
        })
    }
}