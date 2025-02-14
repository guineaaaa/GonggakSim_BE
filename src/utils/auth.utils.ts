// import { OAuth2Client } from 'google-auth-library';  // 구글의 경우
// import axios from 'axios';
// import dotenv from "dotenv";

// dotenv.config();

// interface KakaoTokenResponse {
//   access_token: string;
// }

// interface NaverUserResponse {
//   response: {
//     access_token: string
//   };
// }

// OAuth 제공자별 토큰 갱신 유틸리티 함수들
// export const refreshGoogleToken = async (refreshToken: string) => {
//   const oauth2Client = new OAuth2Client(
//     process.env.PASSPORT_GOOGLE_CLIENT_ID,
//     process.env.PASSPORT_GOOGLE_CLIENT_SECRET
//   );
//   oauth2Client.setCredentials({
//     refresh_token: refreshToken
//   });
//   const { credentials } = await oauth2Client.refreshAccessToken();
//   return credentials.access_token;
// }

// export const refreshKakaoToken = async (refreshToken: string) => {
//   const params = new URLSearchParams();
//   params.append('grant_type', 'refresh_token');
//   params.append('client_id', process.env.PASSPORT_KAKAO_CLIENT_ID!);
//   params.append('refresh_token', refreshToken);

//   const response = await axios.post<KakaoTokenResponse>(
//     'https://kauth.kakao.com/oauth/token',
//     params,
//     {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     }
//   );

//   console.log('Response:', response.data); // 디버깅용
//   return response.data.access_token;
// }

// export const refreshNaverToken = async (refreshToken: string) => {
//   const response = await axios.get<NaverUserResponse>('https://nid.naver.com/oauth2.0/token', {
//     params: {
//       grant_type: 'refresh_token',
//       client_id: process.env.PASSPORT_NAVER_CLIENT_ID,
//       client_secret: process.env.PASSPORT_NAVER_CLIENT_SECRET,
//       refresh_token: refreshToken
//     }
//   });
//   return response.data.response.access_token;
// }