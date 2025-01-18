import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export const updateAgreement = async (req: Request, res: Response) => {
    const { user } = req as AuthRequest; // AuthRequest로 타입 캐스팅
    const accessEmail = user?.email; //verifyToken으로부터 사용자 email 가져오기
    const { agreements } = req.body;

    if (!accessEmail) {
        res.status(StatusCodes.UNAUTHORIZED).json({ 
            success: false, 
            message: "인증이 필요합니다.- authController" 
        });
    }

  // agreements 검증
  if (!Array.isArray(agreements)) {
    return res.status(400).json({ error: '잘못된 입력입니다. 동의 상태는 배열로 줘야합니다.' });
  }

  // 모든 동의 항목이 true인지 확인
  const allAgreed = agreements.every((agreement: boolean) => agreement === true);
  if (!allAgreed) {
    return res.status(400).json({ error: '모든 약관에 동의(true)해아합니다.' });
  }

  try {
    // User 테이블에서 email로 사용자 검색 및 hasAgreedToTerms 업데이트
    const updatedUser = await prisma.user.update({
      where: { email: accessEmail },
      data: { hasAgreedToTerms: true },
    });

    // 성공 응답
    return res.status(200).json({
      message: '약관동의 상태를 저장하는데 성공했습니다.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        hasAgreedToTerms: updatedUser.hasAgreedToTerms,
      },
    }) as any;
  } catch (error) {
    console.error('약관동의 상태 저장 문제 발생:', error);
    return res.status(500).json({ error: '약관동의 상태를 저장하는데 실패했습니다.' });
  }
};
