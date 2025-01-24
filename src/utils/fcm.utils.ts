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

// 이미 초기화 되지 않은 경우에만 Firebase 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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

// FCM 알림 전송 - 예약된 시간에 도달 시 전송
export const sendFcmNotification = async (
  fcmToken: string,
  title: string,
  body: string
): Promise<void> => {
  try {
    await admin.messaging().send({
      notification: {
        title,
        body,
      },
      token: fcmToken,
    });
    console.log("알림 전송 성공:", { title, body, fcmToken });
  } catch (error) {
    console.error("알림 전송 실패:", error);
  }
};
