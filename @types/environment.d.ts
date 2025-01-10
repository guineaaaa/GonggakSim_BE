declare namespace NodeJS {
    interface ProcessEnv extends NodeJS.ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      MONGO_URL: string;
      EXPRESS_SESSION_SECRET: string;
      PASSPORT_GOOGLE_CLIENT_ID: string;
      PASSPORT_GOOGLE_CLIENT_SECRET: string;
      PASSPORT_KAKAO_CLIENT_ID: string;
      PASSPORT_KAKAO_CLIENT_SECRET: string;
    }
  }