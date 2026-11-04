export const useRwaStep = (
  isCompany: boolean,
  rwaRequired: boolean,
  rwaOptional: boolean
): number | null => {
  if (isCompany) return 3;
  if (rwaRequired || rwaOptional) return 4;
  return null;
};
