import { DOCUMENTS, DOCUMENT_TYPE_CODE_MAP } from '@/constants/kyb';
import { validateFile, buildFileMeta, uploadFileToServer } from '@/utils';
import type { DocumentId } from '@/interface';
import { useBaseDocumentsUpload } from './useBaseDocumentsUpload';

export const useDocumentsUpload = (initialFilesMeta?: Record<string, any>) =>
  useBaseDocumentsUpload<DocumentId>({
    documentIds: DOCUMENTS.map((d) => d.id),
    validateFile,
    buildMeta: buildFileMeta,
    uploadFile: uploadFileToServer,
    mode: 'company',
    typeCodeMap: DOCUMENT_TYPE_CODE_MAP,
    initialFilesMeta,
  });
