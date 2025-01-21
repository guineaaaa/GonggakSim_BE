// 요청에서 받아온 데이터를 DTO로 매핑
export const mapQueryToCertificationSearch = (query: any) => {
  return {
    query: query.query as string,
    category: query.category as string | undefined,
  };
};

// 자격증 데이터를 응답 형식으로 변환
export const responseFromCertification = (certification: any) => {
  return {
    id: certification.id,
    name: certification.name,
    category: certification.category,
  };
};

// 자격증 목록 데이터를 응답 형식으로 변환
export const responseFromCertifications = (certifications: any[]) => {
  return certifications.map(responseFromCertification);
};
