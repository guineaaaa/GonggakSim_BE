import admin from "firebase-admin";
import dotenv from "dotenv";

// ✅ 환경 변수 로드
dotenv.config();

// ✅ Firebase 설정을 위한 환경 변수 가져오기
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // 🔥 개행 문자 변환 필수
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// ✅ 환경 변수 체크
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  throw new Error("❌ Firebase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

// ✅ Firebase 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();
export { db };