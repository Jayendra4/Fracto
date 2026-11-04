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

export const formatTimeCountDown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
};
