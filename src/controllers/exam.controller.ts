import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { bodyToExam, responseFromExam } from "../dtos/exam.dto.js";
import { addExamService } from "../services/exam.service.js";

export const handleAddExam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("사용자 캘린더 시험 추가 요청");
  console.log("body:", req.body);

  try {
    const exam = await addExamService(bodyToExam(req.body));
    res.status(StatusCodes.CREATED).success(exam);
  } catch (error) {
    next(error);
  }
};
