	import { prisma } from "../db.config.js";
	
	export class CertificationRepository {
	  async findAllSummaries() {
	    return prisma.certification.findMany({
	      select: {
	        id: true,
	        name: true,
	        category: true,
	      },
	    });
	  }
	
	  // 카테고리별 요약 정보 조회
	  async findSummariesByCategory(category: string) {
	    return prisma.certification.findMany({
	      where: { category },
	      select: {
	        id: true,
	        name: true,
	        category: true,
	      },
	    });
	  }
	
	  // 상세 정보 조회
	  async findById(certificationId: number) {
	    return prisma.certification.findUnique({
	      where: { id: certificationId },
	    });
	  }
	}