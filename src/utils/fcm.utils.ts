import admin from "firebase-admin";

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
  credential: admin.credential.cert(serviceAccount),
});

/**
 * FCM 알림 메시지 구조 인터페이스
 */
interface FcmMessage {
  title: string; //제목
  body: string; //본문
  token: string; //수신자의 FCM token
}

/**
 * 사용자 FCM 토큰 조회 함수
 * @param userId 사용자 ID
 * @returns FCM 토큰
 */
const getUserFcmToken = (userId: number): string => {
  // 클라이언트 앱 토큰
  // 안드로이드 장치의 고유 식별자..
  return "USER_FCM_TOKEN";
};

/**
 * FCM 알림 전송 - 예약된 시간에 도달 시 호출됨
 * @param userId 사용자 ID
 * @param title 알림 제목
 * @param body 알림 본문
 */
export const sendFcmNotification = (
  userId: number,
  title: string,
  body: string
): void => {
  const token = getUserFcmToken(userId);
  console.log("sendFCMNotification 호출");
  const message: FcmMessage = {
    title,
    body,
    token,
  };

  admin
    .messaging()
    .send({
      //Firebase Cloud Messaing API에 요청 보냄
      notification: {
        title: message.title,
        body: message.body,
      },
      token: message.token,
    })
    .then((response) => {
      console.log("Successfully sent message:", response);
      console.log("알림 전송:", { title, body, token });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};
