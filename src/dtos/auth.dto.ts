// 로그인 dto
export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface LoginResponseDTO {
    id: number;
    email: string;
    token: string;
  }