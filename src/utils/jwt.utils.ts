import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// payload에 원하는 사용자 정보를 담아 토큰 생성 (예: id, email, provider 등)
export const generateJWTToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '100y' }); // 개발과정이라 만료시간을 100년 설정, 기본 1h
};

// JWT 검증 함수
export const verifyJWTToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
