import { Request, Response } from 'express';
import { prisma } from "../db.config.js"
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { StatusCodes } from 'http-status-codes';

interface AgreementRequest {
  agreements: boolean[];
}

// 이용약관 동의 API
export const updateAgreement = async (req: Request, res: Response) => {
    const { user } = req as AuthRequest; // AuthRequest로 타입 캐스팅
    const accessEmail = user?.email; //verifyToken으로부터 사용자 email 가져오기
    const { agreements } = req.body;

    if (!accessEmail) {
        res.status(StatusCodes.UNAUTHORIZED).json({ 
            success: false, 
            message: "인증이 필요합니다." 
        });
    }

  // agreements 검증
  if (!Array.isArray(agreements) || agreements.length !== 3) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false,
        message: '잘못된 입력입니다. 동의 상태는 3개의 boolean 값을 포함하는 배열이어야 합니다.' 
    });
  }

  // 모든 동의 항목이 true인지 확인
  const [firstRequired, secondRequired] = agreements;
  if (!firstRequired || !secondRequired) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false,
        message: '필수 약관에 모두 동의해야 합니다.' 
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: accessEmail },
        data: { hasAgreedToTerms: true },
        select: {
          id: true,
          email: true,
          hasAgreedToTerms: true
        }
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: '약관동의 상태가 저장되었습니다.',
      data: {
        user: updatedUser,
        agreements: {
          required1: agreements[0],
          required2: agreements[1],
          optional: agreements[2]
        }
      }
    });
    } catch (error) {
        console.error('약관동의 상태 저장 실패:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: '약관동의 상태를 저장하는데 실패했습니다.' 
      });
    }
};