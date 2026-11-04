import {
  ACCEPTED_MIME_PREFIXES,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
} from '@/constants/kyb';
import type { FileMeta } from '@/interface';
import { uploadFileApi } from '@/api/common.api';

export const validateFile = (file: File): string | null => {
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB)
    return `File is too large. Max size is ${MAX_FILE_SIZE_MB} MB.`;

  const isAcceptedPrefix = ACCEPTED_MIME_PREFIXES.some((p) =>
    file.type.startsWith(p)
  );
  const isAcceptedType = ACCEPTED_MIME_TYPES.includes(file.type);

  if (!isAcceptedPrefix && !isAcceptedType)
    return 'Unsupported file type. Please upload an image, PDF or Word document.';

  return null;
};

export const buildFileMeta = (file: File): FileMeta => ({
  name: file.name,
  type: file.type,
  size: file.size,
});

export const uploadFileToServer = async (file: File): Promise<string> => {
  const res = await uploadFileApi(file);
  if (!res.success) throw new Error(res.error || 'Upload failed');
  return res?.data?.meta.filename || '';
};
