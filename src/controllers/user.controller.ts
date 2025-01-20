import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { userConsentDto } from "../dtos/user.dto.js";
import { userConsent } from "../services/user.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const collectUserInfo = async (req: Request, res: Response ) => {
  try {
    const { user } = req as AuthRequest; // AuthRequest로 타입 캐스팅
    const accessEmail = user?.email; //verifyToken으로부터 사용자 ID 가져오기
    const userData = req.body;

    if (!accessEmail) {
        res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: "인증이 필요합니다.2" 
        });
        return;
    }


    // DTO를 통해 유효성 검증 후, 서비스 호출
    const validatedData = userConsentDto(userData);
    const result = await userConsent(accessEmail, validatedData);

    res.status(200).json({ success: true, message: "정보가 성공적으로 업데이트 되었습니다.", result });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "사용자 정보 저장 중 오류가 발생했습니다." });
  }
};
