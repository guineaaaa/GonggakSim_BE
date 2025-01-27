import { Request, Response } from "express"
import { prisma } from "../db.config.js";
import { StatusCodes } from "http-status-codes";
import { userConsentDto } from "../dtos/user.dto.js";
import { userConsent, SuggestionService, getClosestExams } from "../services/user.service.js";
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

// 마이페이지 조회 API
export const getUserPage = async (req: Request, res: Response) => {
  try{
    const { user } = req as AuthRequest; // AuthRequest와 같은 타입을 정의해야 정확합니다.
    const userEmail = user?.email;

    if (!userEmail) {
      res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: '인증이 필요합니다.' });
    }

    // 1. 사용자 정보 조회
    const userInfo = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        name: true,
        profileImage: true,
        id: true,
      },
    });

    if (!userInfo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      }) as any;
    }

    // 2. 사용자 카테고리 조회
    const userCategories = await prisma.userCategory.findMany({
      where: { userId: userInfo.id },
      select: { category: true },
    });

    // 3. 가장 임박한 시험 2개 조회
    const closestExams = await getClosestExams(userInfo.id);

    // 응답 데이터 구성
    const response = {
      name: userInfo.name,
      profileImage: userInfo.profileImage,
      categories: userCategories.map((cat) => cat.category),
      closestExams,
    };

    res.status(StatusCodes.OK).json({ success: true, message: '마이페이지 조회 완료', response });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: '마이페이지 조회 실패'});
  }
}

// 도움말 조회 API
export const getHelpDoc = async (req: Request, res: Response) => {
  try{
    const { user } = req as AuthRequest; // AuthRequest와 같은 타입을 정의해야 정확합니다.
    const userEmail = user?.email;

    if (!userEmail) {
      res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: '인증이 필요합니다.' });
    }
    
    res.status(StatusCodes.OK).json({ success: true, message: "도움말 조회 완료" });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: '도움말 조회 실패'});
  }
}