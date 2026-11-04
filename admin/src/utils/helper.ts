import z from 'zod';
import { documentsSchema } from './zodSchema';

type Documents = z.infer<typeof documentsSchema>;

export const validateRequiredDocuments = (documents: Documents) => {
  const missingDocs = documents.filter((doc) => doc.required && !doc.documentUrl);

  return {
    isValid: missingDocs.length === 0,
    missingDocs,
  };
};
export const extractFileName = (url: string) => {
  try {
    return url.split('/').pop() ?? '';
  } catch {
    return '';
  }
};
