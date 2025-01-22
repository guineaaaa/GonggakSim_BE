//certification2.service.ts
import { CertificationRepository } from "../repositories/certificateInquiry.repository.js";

export class CertificationService {
  private repository: CertificationRepository;

  constructor() {
    this.repository = new CertificationRepository();
  }

  // 요약 목록 조회
  async getAllCertifications() {
    return await this.repository.findAllSummaries();
  }

  // 카테고리별 요약 조회
  async getCertificationsByCategory(category: string) {
    return await this.repository.findSummariesByCategory(category);
  }

  // 상세 정보 조회
  async getCertificationById(certificationId: number) {
    return await this.repository.findById(certificationId);
  }
}