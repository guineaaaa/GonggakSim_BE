import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { responseFromCertificationSummary, responseFromCertification } from "../dtos/certificateInquiry.dto.js";
import { CertificationService } from "../services/certificateInquiry.service.js";

const service = new CertificationService();

// 전체 자격증 목록 조회
export const handleGetAllCertifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("전체 자격증 요약 조회 요청");

  try {
    const certifications = await service.getAllCertifications();
    if (!certifications || certifications.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No certifications found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: certifications.map(responseFromCertificationSummary),
    });
  } catch (error) {
    next(error);
  }
};

// 카테고리별 자격증 조회 
export const handleGetCertificationsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("카테고리별 자격증 조회 요청");

  try {
    const { category } = req.params;
    if (!category) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Category is required",
      });
      return;
    }

    const certifications = await service.getCertificationsByCategory(category);
    if (!certifications || certifications.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No certifications found for category: ${category}`,
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: certifications.map(responseFromCertificationSummary),
    });
  } catch (error) {
    next(error);
  }
};

// 자격증 상세 조회
export const handleGetCertificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("자격증 상세 조회 요청");

  try {
    const { id } = req.params;
    const certification = await service.getCertificationById(Number(id));
    if (!certification) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No certification found with ID: ${id}`,
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: responseFromCertification(certification),
    });
  } catch (error) {
    next(error);
  }
};