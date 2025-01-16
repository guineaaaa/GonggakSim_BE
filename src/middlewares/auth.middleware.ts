import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from 'http-status-codes';
import dotenv from "dotenv";

export interface AuthRequest extends Request {
  user: { id: number; email: string; } | undefined;
}

dotenv.config();

export const verifyToken = (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const authCookie = req.cookies['accessToken'];
    console.log("Auth cookie:", authCookie);
    //const token = authHeader?.split(' ')[1];  // Bearer token 형식

    if (!authCookie) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "인증이 필요합니다.1"
      });
    }

    const decoded = jwt.verify(authCookie as string, process.env.JWT_SECRET as string) as { id: number; email: string };
    req.user = decoded;  // 요청 객체에 사용자 정보 추가
    console.log("Decode: ", decoded);
    next();
  } catch (err) {
    console.error("Token verification failed: ", err);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "유효하지 않은 토큰입니다.1"
    });
  }
};