// 기본 예시 오류 코드 -- 나중에 수정/추가해주세요
export class InvaliDataError extends Error {
    errorCode = "400_U001";
    statusCode = 400;
    reason: string;
    data: string;
  
    constructor(reason: string, data: string) {
      super(reason);
      this.reason = reason;
      this.data = data;
    }
  }