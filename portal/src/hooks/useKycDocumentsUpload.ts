import {
  validateKycFile,
  buildFileMetaKyc,
  uploadKycFileToServer,
} from '@/utils';

import { KYC_DOCUMENTS, KYC_DOCUMENT_TYPE_CODE_MAP } from '@/constants/kyc';

import type { KycDocumentId } from '@/interface';
import { useBaseDocumentsUpload } from './useBaseDocumentsUpload';

export const useKycDocumentsUpload = (initialFilesMeta?: Record<string, any>) =>
  useBaseDocumentsUpload<KycDocumentId>({
    documentIds: KYC_DOCUMENTS.map((d) => d.id),
    validateFile: validateKycFile,
    buildMeta: buildFileMetaKyc,
    uploadFile: uploadKycFileToServer,
    typeCodeMap: KYC_DOCUMENT_TYPE_CODE_MAP,
    mode: 'user',
    isRadioImage: (id) => id === 'addressProof' || id === 'secondaryId',
    initialFilesMeta,
  });
