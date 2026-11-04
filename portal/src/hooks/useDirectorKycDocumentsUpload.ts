import {
  validateKycFile,
  buildFileMetaKyc,
  uploadKycFileToServer,
} from '@/utils';

import { KYC_DOCUMENTS, KYC_DOCUMENT_TYPE_CODE_MAP } from '@/constants/kyc';

import type { KycDocumentId } from '@/interface';
import { useBaseDocumentsUpload } from './useBaseDocumentsUpload';

export const useDirectorKycDocumentsUpload = (
  initialFilesMeta?: Record<string, any>
) =>
  useBaseDocumentsUpload<KycDocumentId>({
    documentIds: KYC_DOCUMENTS.map((d) => d.id),
    validateFile: validateKycFile,
    buildMeta: buildFileMetaKyc,
    uploadFile: uploadKycFileToServer,
    mode: 'company',
    typeCodeMap: KYC_DOCUMENT_TYPE_CODE_MAP,
    isRadioImage: (id) => id === 'address_proof' || id === 'secondary_id',
    initialFilesMeta,
  });
