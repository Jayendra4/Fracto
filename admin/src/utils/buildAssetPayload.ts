type MetaType = 'STRING' | 'NUMBER' | 'DATE';

const isDateString = (val: any) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);

const getMetaType = (value: any): MetaType => {
  if (typeof value === 'number') return 'NUMBER';
  if (isDateString(value)) return 'DATE';
  return 'STRING';
};
const normalizeDocuments = (docs: any[] = []) =>
  docs
    .filter((d) => d?.documentUrl)
    .map((d) => ({
      documentType: d.documentType || d.id,
      documentName: d.documentName || d.documentUrl?.split('/').pop() || d.id || 'document',
      documentUrl: d.documentUrl?.split('/').pop() || 'document',
      remarks: d.remarks || '',
    }));
export const buildAssetPayload = (data: any) => {
  const {
    /* -------- BASIC INFO -------- */
    assetType,
    // assetSubType,
    assetTitle,
    currentOwnerName,
    ownershipModel,

    whyInvested,
    isVerified,

    /* -------- DOCUMENT SOURCES -------- */
    assetImages = [],
    assetVideos = [],
    documents: legalDocuments = [],
    valuationDocuments = [],
    techDocuments = [],

    /* -------- EVERYTHING ELSE -------- */
    ...rest
  } = data;

  /* ---------------- BASIC INFO ---------------- */
  const basicInfo = {
    assetType,
    assetTitle,
    isVerified,
    // assetSubType,
    currentOwnerName,
    ownershipModel,
  };

  /* ---------------- META ---------------- */
  const meta = Object.entries(rest)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({
      metaKey: key,
      metaValue: value,
      metaType: getMetaType(value),
    }));

  /* ---------------- DOCUMENTS ---------------- */
  const documents = [
    // Asset Images
    ...assetImages.map((url: string) => ({
      documentType: 'ASSET_IMAGE',
      documentName: url.split('/').pop() || 'asset-image',
      documentUrl: url.split('/').pop() || 'asset-image',
      remarks: '',
    })),

    // Asset Videos
    ...assetVideos.map((url: string) => ({
      documentType: 'ASSET_VIDEO',
      documentName: url.split('/').pop() || 'asset-video',
      documentUrl: url.split('/').pop() || 'asset-video',
      remarks: '',
    })),

    // Legal / Property Documents
    ...normalizeDocuments(legalDocuments),

    // Valuation Documents
    ...normalizeDocuments(valuationDocuments),

    // Tech / Business Documents
    ...normalizeDocuments(techDocuments),
  ];

  return {
    basicInfo,
    meta,
    documents,

    whyInvested,
  };
};
