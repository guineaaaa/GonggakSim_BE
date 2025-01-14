import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { userConsentDto } from "../dtos/user.dto.js";
import { userConsent } from "../services/user.service.js";

export const collectUserInfo = async (req: Request, res: Response ) => {
/*
    #swagger.tags = ["User"]
    #swagger.summary = '사용자 정보 수집 API';
    #swagger.description = '액세스토큰을 parameter로 받아서 사용자 인증 후, 사용자 정보 데이터 저장';
    #swagger.parameters['oauthAccessToken'] = {
        in: 'path',
        required: true,
    };
    
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        age: { 
                            type: "integer", 
                            enum: [18, 19, 20, 21, 22, 23, 24, 25], 
                            description: "사용자의 나이 | 18~25사이로만 선택 가능" 
                        },
                        department: { 
                            type: "string", 
                            enum: ["디자인/예술", "경영/경제", "IT/정보통신", "공학", "자연과학", "인문사회"], 
                            description: "사용자가 속한 학과" 
                        },
                        grade: { 
                            type: "string", 
                            enum: ["1학년", "2학년", "3학년", "4학년", "졸업"], 
                            description: "사용자의 학년" 
                        },
                        category: { 
                            type: "string", 
                            enum: ["전산/IT" , "물류/유통", "생산/품질관리", "어학-영어", "중국어", "일본어", "한국어", "금융/회계", "디자인", "교육/상담", "건축/설계", "환경/에너지", "기타"], 
                            description: "사용자 관심 분야" 
                        },
                        employmentStatus: { 
                            type: "string", 
                            enum: ["재직 중", "퇴사 예정", "구직"], 
                            description: "사용자의 고용 상태" 
                        }
                    },
                    required: ["age", "department", "grade", "category", "employmentStatus"]
                }
            }
        }
    };

    #swagger.responses["200"] = {
        description: "정보 수집 성공 응답",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        success: { 
                            type: "boolean",
                            example: true
                        },
                        message: { 
                            type: "string",
                            example: "정보가 성공적으로 저장되었습니다."
                        },
                        result: {
                            type: "object",
                            properties: {
                                age: { type: "integer", example: 25 },
                                department: { type: "string", example: "디자인/예술" },
                                grade: { type: "string", example: "1학년" },
                                category: { type: "string", example: "전산/IT" },
                                employmentStatus: { type: "string", example: "재직 중" }
                            }
                        }
                    }
                }
            }
        }
    };
    
    #swagger.responses["400"] = {
        description: "정보 수집 실패 응답",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        resultType: { type: "string", example: "FAIL" },
                        error: {
                            type: "object",
                            properties: {
                                errorCode: { type: "string", example: "400_U001" },
                                reason: { type: "string", example: "데이터를 입력해주세요." },
                                data: { type: "object", nullable: true, example: null }
                            }
                        },
                        success: { type: "object", nullable: true, example: null }
                    }
                }
            }
        }
    };
*/

  try {
    const accessToken = req.query.accessToken;
    const userData = req.body;

    if (!accessToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({ 
          success: false, 
          message: "인증이 필요합니다." 
        });
        return
    }

    // DTO를 통해 유효성 검증 후, 서비스 호출
    const validatedData = userConsentDto(userData);
    const result = await userConsent(accessToken, validatedData);

    res.status(300).json({ success: true, message: "정보가 성공적으로 업데이트 되었습니다.", result });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "사용자 정보 저장 중 오류가 발생했습니다." });
  }
};
