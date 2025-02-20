export const mapQueryToCertificationSearch = (query: any) => {
  return {
    query: query.query as string,
    category: query.category ? query.category : "전체",
  };
};


export const responseFromCertification = (certification: any) => {
  return {
    id: certification.id,
    name: certification.name,
    category: certification.category,
  };
};


export const responseFromCertifications = (certifications: any[]) => {
  return certifications.map(responseFromCertification);
};
