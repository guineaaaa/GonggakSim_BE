import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { userConsentDto } from "../dtos/user.dto.js";
import { userConsent, SuggestionService } from "../services/user.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// 사용자 정보 수집 API
export const collectUserInfo = async (req: Request, res: Response ) => {
  try {
    const { user } = req as AuthRequest; // AuthRequest로 타입 캐스팅
    const accessEmail = user?.email; //verifyToken으로부터 사용자 ID 가져오기
    const userData = req.body;

    if (!accessEmail) {
        res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: "인증이 필요합니다." 
        });
        return;
    }


    // DTO를 통해 유효성 검증 후, 서비스 호출
    const validatedData = userConsentDto(userData);
    const result = await userConsent(accessEmail, validatedData);

    res.status(StatusCodes.OK).json({ success: true, message: "정보가 성공적으로 업데이트 되었습니다.", result });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "사용자 정보 저장 중 오류가 발생했습니다." });
  }
};

// 유사 사용자 시험 추천 API
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest; // AuthRequest와 같은 타입을 정의해야 정확합니다.
    const userEmail = user?.email;

    if (!userEmail) {
      res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: '인증이 필요합니다.' });
    }

      const suggestions = await SuggestionService.getSuggestions(userEmail);
      res.status(200).json({ success: true, message: '시험 추천 완료', suggestions });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: '시험 추천 실패' });
  }
}