import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { StatusCodes } from 'http-status-codes';

interface KakaoAccount {
  email?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: KakaoAccount;
}

interface NaverUserResponse {
  response: {
    id: string;
    email: string;
    name?: string;
    profile_image?: string;
  };
}

interface UserInfo {
  email?: string ;
  provider: string;
};

export interface AuthRequest extends Request {
  user: any;
}

// 카카오 사용자 정보 요청
const getKakaoUserInfo = async (token: string): Promise<UserInfo> => {
  const response = await axios.get<KakaoUserResponse>("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const { kakao_account } = response.data;
  return {
    email: kakao_account?.email,
    provider: "kakao",
  };
};

// 구글 사용자 정보 요청
const getGoogleUserInfo = async (token: string): Promise<UserInfo> => {
  const response = await axios.get<UserInfo>('https://oauth2.googleapis.com/tokeninfo', {
    headers: { Authorization: `Bearer ${token}` }
});
  const { email } = response.data;
  return {
    email,
    provider: "google",
  };
};

// 네이버 사용자 정보 요청
const getNaverUserInfo = async (token: string): Promise<UserInfo> => {
  const response = await axios.get<NaverUserResponse>("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { email } = response.data.response;
  return {
    email,
    provider: "naver",
  };
};

// Oauth 제공자에 따른 처리 분기
const fetchUserInfo = async (provider: string, token: string): Promise<UserInfo> => {
  switch (provider) {
    case "kakao":
      return await getKakaoUserInfo(token);
    case "google":
      return await getGoogleUserInfo(token);
    case "naver":
      return await getNaverUserInfo(token);
    default:
      throw new Error("지원하지 않는 OAuth 제공자입니다.");
  }
};

// 미들웨어 함수
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 쿠키에서 토큰 읽기
    const token = req.cookies['accessToken'];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "인증 토큰이 필요합니다.",
      })as any;
    }

    // 사용자 정보 가져오기 (예: Kakao, Google 등)
    const oauthProvider = req.body.oauthProvider; // 클라이언트에서 전달받은 OAuth 제공자
    if (!oauthProvider) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "OAuth 제공자가 필요합니다.",
      });
    }

    // 사용자 정보 가져오기
    const userInfo = await fetchUserInfo(oauthProvider, token);

    // 요청 객체에 사용자 정보 추가
    req.user = userInfo;
    console.log(userInfo);

    next(); // 다음 미들웨어로 전달
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};