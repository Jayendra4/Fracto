// src/utils/rwa.helpers.ts
/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed helpers, matches the pattern in rwa.api.ts */
import { uploadFileApi } from '@/api/common.api';

export const stripFileFields = (data: any) => {
  if (!data) return data;

  const clean: any = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === undefined || value === null) return;

    if (
      value instanceof File ||
      value instanceof Blob ||
      (Array.isArray(value) && value.some((v) => v instanceof File)) ||
      key === 'documents' ||
      key === 'extra'
    ) {
      return;
    }

    clean[key] = value;
  });

  return clean;
};

export const extractBasicInfo = (step1Data: any, step2Data: any) => {
  return {
    assetType: step1Data?.assetType || '',
    assetTitle: step1Data?.assetTitle || '',
    currentOwnerName: step2Data?.currentOwnerName || '',
    ownershipModel: step2Data?.ownershipModel || '',
    ownershipModelOther:
      step2Data?.ownershipModel === 'Others'
        ? step2Data?.ownershipModelOther || ''
        : '',
  };
};

export type MetaType = 'String' | 'Number' | 'Date';

const detectMetaType = (value: unknown): MetaType => {
  if (value === null || value === undefined) return 'String';
  if (Array.isArray(value)) return 'String';

  const str = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'Date';

  const num = Number(str);
  if (!Number.isNaN(num) && str !== '') return 'Number';

  return 'String';
};

export const extractMeta = (
  step1Data: any,
  step2Data: any,
  step3Data: any,
  step4Data: any
) => {
  const BASIC_KEYS = new Set([
    'assetType',
    'assetTitle',
    'currentOwnerName',
    'ownershipModel',
    'ownershipModelOther',
  ]);

  const meta: Array<{
    metaKey: string;
    metaValue: string;
    metaType: MetaType;
  }> = [];

  const addFrom = (obj: any) => {
    if (!obj) return;

    Object.entries(obj).forEach(([key, rawValue]) => {
      if (rawValue === undefined || rawValue === null) return;
      if (BASIC_KEYS.has(key)) return;

      if (
        key === 'assetImages' ||
        key === 'assetVideos' ||
        key === 'whyInvested'
      )
        return;

      let metaValue: string;
      if (Array.isArray(rawValue)) {
        metaValue = rawValue.join(', ');
      } else {
        metaValue = String(rawValue);
      }

      const metaType = detectMetaType(rawValue);

      meta.push({
        metaKey: key,
        metaValue,
        metaType,
      });
    });
  };

  addFrom(step1Data);
  addFrom(step2Data);
  addFrom(step3Data);
  addFrom(step4Data);

  return meta;
};

export interface UploadItem {
  file: File;
  documentType: string;
  documentName: string;
  remarks?: string;
}

export interface UploadedDocument {
  documentType: string;
  documentName: string;
  documentUrl: string;
  remarks: string;
}

export const uploadAllFiles = async (
  items: UploadItem[]
): Promise<UploadedDocument[]> => {
  const results: UploadedDocument[] = [];

  for (const item of items) {
    try {
      const res = await uploadFileApi(item.file);
      if (!res.success) {
        const errMsg = res.error || res.message || 'Upload failed';
        console.error('Upload failed for:', item.documentName, errMsg);
        throw new Error(`${errMsg} for ${item.documentName}`);
      }
      const url = res?.data?.meta.filename;
      if (!url) {
        console.error(
          'Upload API returned no URL for:',
          item.documentName,
          res.data
        );
        throw new Error(`Upload API returned no URL for: ${item.documentName}`);
      }
      results.push({
        documentType: item.documentType,
        documentName: item.documentName,
        documentUrl: url,
        remarks: item.remarks || '',
      });
    } catch (error) {
      console.error(
        'Upload exception for:',
        item.documentName,
        (error as Error).message
      );
      throw error;
    }
  }

  return results;
};

export const buildDocumentsPayload = (params: {
  step1Docs: any[] | null;
  step2Docs: any[] | null;
  step3Docs: any[] | null;
  step4Docs: any[] | null;
}) => {
  const { step1Docs, step2Docs, step3Docs, step4Docs } = params;

  const docs: UploadedDocument[] = [];

  const normalizePush = (arr: any[] | null | undefined) => {
    if (!Array.isArray(arr)) return;

    arr.forEach((d) => {
      if (!d) return;

      const documentUrl =
        d.documentUrl || d.url || d.fileUrl || d.location || d.path;
      if (!documentUrl) return;

      const documentType =
        d.documentType || d.type || d.code || 'GENERIC_DOCUMENT';

      const documentName = d.documentName || d.name || d.label || 'Document';

      docs.push({
        documentType,
        documentName,
        documentUrl,
        remarks: d.remarks || '',
      });
    });
  };

  normalizePush(step1Docs);
  normalizePush(step2Docs);
  normalizePush(step3Docs);
  normalizePush(step4Docs);

  return docs;
};

// Older submits stored the human-readable country/state name (not the
// select's ISO code/code value) in asset meta. When re-editing such an
// asset, the Country/State selects need the code back to show as selected
// and to drive the dependent State/City APIs — these resolve a raw
// name-or-code value against the location API's response to that code.
export const resolveCountryIsoCode = (
  countries: { name: string; isoCode: string }[] | undefined,
  raw: string | undefined
): string | undefined => {
  if (!raw) return undefined;
  if (countries?.some((c) => c.isoCode === raw)) return raw;
  return countries?.find((c) => c.name?.toLowerCase() === raw.toLowerCase())
    ?.isoCode;
};

export const resolveStateCode = (
  states: { name: string; code: string }[] | undefined,
  raw: string | undefined
): string | undefined => {
  if (!raw) return undefined;
  if (states?.some((s) => s.code === raw)) return raw;
  return states?.find((s) => s.name?.toLowerCase() === raw.toLowerCase())?.code;
};

export const numberWithCommas = (number: any) => {
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);

  return formattedNumber.replace(/\.00$/, '');
};
