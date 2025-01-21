import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { searchCertifications } from "../services/certification.service.js";
import { responseFromCertifications } from "../dtos/certification.dto.js";

export const handleGetCertifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, category } = req.query;

    if (!query || typeof query !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "검색어는 필수입니다",
      });
      return;
    }

    if (category && typeof category !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "카테고리는 문자열입니다",
      });
      return;
    }

    // category가 없다면
    const certifications = await searchCertifications({
      query,
      category: category ?? undefined,
    });

    const data = responseFromCertifications(certifications);

    console.log("컨트롤러에서 자격증", JSON.stringify(data, null, 2));
    res.status(StatusCodes.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
