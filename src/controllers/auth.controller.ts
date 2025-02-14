import { Request, Response } from 'express';
import { logoutFromSNS, deleteAccount, clearSession, AuthService } from '../services/auth.service.js';
import { LoginDTO } from '../dtos/auth.dto.js';
import { AuthRequest } from "../middlewares/auth.middleware.js";

// 로그인 controller
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<any> => {
    try {
      const loginDTO: LoginDTO = req.body;

      if (!loginDTO.email || !loginDTO.password) {
        return res.status(400).json({ success : false, message: '이메일과 비밀번호를 모두 입력해주세요.' });
      }

      const result = await this.authService.login(loginDTO);
      
      return res.status(200).json({ success: true, masseage: result });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({ success: false, message: error });
    }
  };

  register = async (req: Request, res: Response): Promise<any> => {
    try {
      const registerDTO = req.body;

      if (!registerDTO.email || !registerDTO.password) {
        return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
      }

      const result = await this.authService.register(registerDTO);
      
      return res.status(200).json({ success: true, message: result });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(400).json({ success: false, message: error });
    }
  };
}


// 로그아웃 controller
export const logoutUser = async (req: Request, res: Response) => {
    try {
        const { user } = req as AuthRequest;
        const provider = user.provider;
    
        if (!user) throw new Error("사용자가 인증되지 않았습니다.");
        
        if (!provider) {
          await clearSession(req, res, "로그아웃 성공(일반)");
        } else {
          const logoutUrl = await logoutFromSNS(provider);
          await clearSession(req, res, "로그아웃 성공(sns)", logoutUrl);
        }
        
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "로그아웃 실패",
        });
    }
};


// 회원탈퇴 controller
export const deleteUserAccount = async (req: Request, res: Response) => {
    try {
        const { user } = req as AuthRequest;
        const accessEmail = user?.email;
        const token = user.accessToken;
        const provider = user.provider;

        await deleteAccount(accessEmail, token, provider);
        await clearSession(req, res, "회원탈퇴 완료");

      } catch (error) {
        res.status(500).json({
          success: false,
          message: "회원탈퇴 실패",
        });
    }
};