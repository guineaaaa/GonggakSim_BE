import { prisma } from "../db.config.js";

export const findCertifications = async (query: string, category?: string) => {
  // where 조건 생성
  const whereClause: { name: { contains: string }; category?: string } = {
    name: {
      contains: query, // 검색어 포함 여부
    },
  };

  // 카테고리가 제공되었고, 값이 '전체'가 아닌 경우 추가
  if (category && category !== "전체") {
    whereClause.category = category;
  }

  // 데이터 베이스 조회
  const certifications = await prisma.certification.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  return certifications;
};
