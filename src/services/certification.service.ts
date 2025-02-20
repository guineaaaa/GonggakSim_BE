import { findCertifications } from "../repositories/certification.respository.js";
import {
  responseFromCertifications,
  mapQueryToCertificationSearch,
} from "../dtos/certification.dto.js";

export const searchCertifications = async ({
  query,
  category,
}: {
  query: string;
  category?: string;
}) => {
  const { query: searchQuery, category: searchCategory } =
    mapQueryToCertificationSearch({ query, category });

  const certifications = await findCertifications(
    searchQuery,
    searchCategory ?? undefined
  );

  return responseFromCertifications(certifications);
};
