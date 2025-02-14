import { prisma } from "../db.config.js";
import { Prisma } from "@prisma/client";

// 로그인 repo
export class AuthRepository {
    async findUserByEmail(email: string) {
      return prisma.user.findFirst({
        where: { 
          email,
          oauthProvider: null // SNS 로그인이 아닌 경우만
        }
      });
    }
  
    async createUser(data: Prisma.UserCreateInput) {
      return prisma.user.create({
        data
      });
    }
  }