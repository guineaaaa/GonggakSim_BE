// import { Request, Response, NextFunction } from "express"
// import { StatusCodes } from "http-status-codes";
// import { bodyToUser } from "../dtos/user.dto.js";
// import { userRegister } from "../services/user.service.js";

// export const handleUserRegister = async (req, res, next) => {
//     /*
//     #swagger.summary = '회원 가입 API';
//     #swagger.requestBody = {
//       required: true,
//       content: {
//         "application/json": {
//           schema: {
//             type: "object",
//             properties: {
//               name: { type: "string", example: "홍길동" },
//               phoneNum: { type: "string", example: "010-0000-0000" },
//               email: { type: "string", example: "sdf324@gmail.com" },
//               password: { type: "string", example: "sfg23k@??" },
//               gender: { type: "number", example: 0 },
//               birthDate: { type: "string", format: "date" },
//               address: { type: "string", example: "서울시 성북구" },
//               preference: { type: "array", items: { type: "number" } }
//             }
//           }
//         }
//       }
//     };
//     #swagger.responses[200] = {
//       description: "회원 가입 성공 응답",
//       content: {
//         "application/json": {
//           schema: {
//             type: "object",
//             properties: {
//               resultType: { type: "string", example: "SUCCESS" },
//               error: { type: "object", nullable: true, example: null },
//               success: {
//                 type: "object",
//                 properties: {
//                   email: { type: "string" },
//                   name: { type: "string" },
//                   preferCategory: { type: "array", items: { type: "string" } }
//                 }
//               }
//             }
//           }
//         }
//       }
//     };
//     #swagger.responses[400] = {
//       description: "회원 가입 실패 응답",
//       content: {
//         "application/json": {
//           schema: {
//             type: "object",
//             properties: {
//               resultType: { type: "string", example: "FAIL" },
//               error: {
//                 type: "object",
//                 properties: {
//                   errorCode: { type: "string", example: "400_U001" },
//                   reason: { type: "string" },
//                   data: { type: "object" }
//                 }
//               },
//               success: { type: "object", nullable: true, example: null }
//             }
//           }
//         }
//       }
//     };
//   */

//   console.log("회원가입을 요청했습니다!");
//   console.log("body:", req.body);

//   const user = await userRegister(bodyToUser(req.body));
//   res.status(StatusCodes.OK).success(user);
// };
