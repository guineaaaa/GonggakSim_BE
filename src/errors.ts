// 기본 예시 오류 코드 -- 나중에 수정/추가해주세요
export class InvalidDataError extends Error {
  errorCode = "400_U001";
  statusCode = 400;
  reason: string;
  data: any;

  constructor(reason: string, data: any) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}

export class DuplicateDataError extends Error {
  errorCode = "400_D001";
  statusCode = 400;
  reason: string;
  data: any;

  constructor(reason: string, data: any) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}
