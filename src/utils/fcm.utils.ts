import admin from "firebase-admin";
import { prisma } from "../db.config.js";

// Firebase Admin SDK 인증 정보
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "",
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
} as admin.ServiceAccount;

/**
 * FCM 초기화 (Firebase Admin SDK 설정 필요)
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Firebase 인증 정보 설정
});

/**
 * FCM 알림 메시지 구조 인터페이스
 */
interface FcmMessage {
  title: string; //제목
  body: string; //본문
  fcmToken: string; //수신자의 FCM token
}

// 사용자 FCM 토큰 조회 함수
export const getUserFcmToken = async (
  userId: number
): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });
  return user?.fcmToken || null;
};

/**
 * FCM 알림 전송 - 예약된 시간에 도달 시 호출됨
 * @param fcmToken FCM 토큰큰
 * @param title 알림 제목
 * @param body 알림 본문
 */
export const sendFcmNotification = (
  fcmToken: string, //수신자의 FCM 토큰
  title: string, // 알림 제목
  body: string // 알림 본문문
): void => {
  console.log("sendFCMNotification 호출");

  // FCM 메세지 생성하기기
  const message: FcmMessage = {
    title, //메세지 제목
    body, // 메세지 본문
    fcmToken, // 수신자의 FCM 토큰
  };

  // Firebase Admin SDK를 통해 메세지 전송
  admin
    .messaging()
    .send({
      // 메세지 구성
      //Firebase Cloud Messaing API에 요청 보냄
      notification: {
        title: message.title, //알림 제목
        body: message.body, // 알림 본문
      },
      token: message.fcmToken, // 수신자 FCM 토큰
    })
    // 메세지 전송 성공 시 처리
    .then((response) => {
      console.log("Successfully sent message:", response);
      console.log("알림 전송:", { title, body, fcmToken });
    })
    // 메세지 전송 실패 시 처리
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};
