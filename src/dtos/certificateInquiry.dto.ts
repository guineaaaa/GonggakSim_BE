//certification2.dto.ts
// 요약 정보 DTO
export interface CertificationSummaryDTO {
    id: number;
    name: string;
    category: string;
  }
  
  // 상세 정보 DTO
  export interface CertificationDTO {
    id: number;
    name: string;
    category: string;
    eligibility: string;
    subjects: string;
    examFormat: string;
    examDuration: string;
    passingCriteria: string;
    fee: string;
    announcementSchedule: string;
  }
  
  // 요약 정보로 변환
  export const responseFromCertificationSummary = (certification: any): CertificationSummaryDTO => ({
    id: certification.id,
    name: certification.name,
    category: certification.category,
  });
  
  // 상세 정보로 변환
  export const responseFromCertification = (certification: any): CertificationDTO => ({
    id: certification.id,
    name: certification.name,
    category: certification.category,
    eligibility: certification.eligibility,
    subjects: certification.subjects,
    examFormat: certification.examFormat,
    examDuration: certification.examDuration,
    passingCriteria: certification.passingCriteria,
    fee: certification.fee,
    announcementSchedule: certification.announcementSchedule,
  });