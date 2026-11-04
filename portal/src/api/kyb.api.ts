import { toIsoDate } from '@/utils/CompanyKyb/toIsoDate';
import { companyKybCountryLabelMap } from '@/constants/kyb';
import { axiosRequest } from '@/services';

import type {
  ICompanyBasicReq,
  ICompanyBasicRes,
  ICompanyTaxReq,
  ICompanyTaxRes,
  IBusinessProfileReq,
  IBusinessProfileRes,
  ICompanyUploadDocsReq,
  ICompanyUploadDocsRes,
  IApiResponse,
} from '@/interface';

export const submitCompanyBasicApi = async (
  formData: any
): Promise<IApiResponse<ICompanyBasicRes>> => {
  let accountId = undefined;

  try {
    const raw = localStorage.getItem('hof_user');

    if (raw) {
      const parsed = JSON.parse(raw);
      accountId = parsed?.data?.id ?? parsed?.id ?? undefined;
    }
  } catch {}

  if (!accountId) throw new Error('User not found. Please login again.');

  const isoDate = toIsoDate(formData.dateOfIncorporation);
  if (!isoDate) throw new Error('Invalid Date of Incorporation.');

  const payload: ICompanyBasicReq = {
    legalEntityName: formData.legalEntityName ?? '',
    tradeName: formData.tradeName ?? '',
    entityType: formData.entityType ?? '',
    cinOrTradeLicenseNo: formData.cinOrTradeLicenseNo ?? '',
    dateOfIncorporation: isoDate,

    industryType: formData.industryType ?? '',

    registeredAddressLine1: formData.registeredAddressLine1 ?? '',
    registeredAddressLine2: formData.registeredAddressLine2,
    registeredCity: formData.registeredCity ?? '',
    registeredState: formData.registeredState ?? '',
    registeredCountry:
      companyKybCountryLabelMap[formData.registeredCountry] ??
      formData.registeredCountry ??
      '',
    registeredPincode: formData.registeredPincode ?? '',

    operationalAddressLine1: formData.operationalAddressLine1 ?? '',
    operationalAddressLine2: formData.operationalAddressLine2,
    operationalCity: formData.operationalCity ?? '',
    operationalState: formData.operationalState ?? '',
    operationalCountry:
      companyKybCountryLabelMap[formData.operationalCountry] ??
      formData.operationalCountry ??
      '',
    operationalPincode: formData.operationalPincode ?? '',

    companyEmail: formData.companyEmail ?? '',
    companyPhone: formData.companyPhone ?? '',
    websiteUrl: formData.websiteUrl,
    accountId,
  };

  return axiosRequest<ICompanyBasicRes>({
    method: 'POST',
    endpoint: '/company/basic',
    data: payload,
  });
};

export const submitCompanyTaxApi = async (
  formData: any,
  companyId: string
): Promise<IApiResponse<ICompanyTaxRes>> => {
  const isoTradeExpiry = toIsoDate(formData.tradeLicenseExpiry);
  if (!isoTradeExpiry) throw new Error('Invalid Trade License Expiry Date.');

  const payload: ICompanyTaxReq = {
    panNumber: formData.panNumber ?? '',
    gstNumber: formData.gstNumber,
    tanNumber: formData.tanNumber,
    tradeLicenseExpiryDate: isoTradeExpiry,
    placeOfBusinessProofType: formData.proofOfPlaceOfBusiness ?? '',
  };

  return axiosRequest<ICompanyTaxRes>({
    method: 'PATCH',
    endpoint: `/company/tax/${companyId}`,
    data: payload,
  });
};

export const submitBusinessProfileApi = async (
  formData: any,
  companyId: string
): Promise<IApiResponse<IBusinessProfileRes>> => {
  const payload: IBusinessProfileReq = {
    natureOfBusiness: formData.natureOfBusiness ?? '',
    countriesOfOperation: (Array.isArray(formData.countriesOfOperation)
      ? formData.countriesOfOperation
      : typeof formData.countriesOfOperation === 'string'
        ? formData.countriesOfOperation.split(',').map((s: string) => s.trim())
        : []
    ).map((code: string) => companyKybCountryLabelMap[code] || code),
    expectedMonthlyTransactionVolume:
      formData.expectedMonthlyTransactionVolume ?? '',
    expectedSourceOfFunds: formData.expectedSourceOfFunds ?? '',
    businessDescription: formData.businessDescription,
    isCompanyPubliclyListed: formData.isCompanyPubliclyListed ?? '',
  };

  return axiosRequest<IBusinessProfileRes>({
    method: 'PATCH',
    endpoint: `/company/meta/${companyId}`,
    data: payload,
  });
};

export const uploadCompanyDocumentsApi = async (
  documents: any[],
  extra: any,
  companyId: string
): Promise<IApiResponse<ICompanyUploadDocsRes>> => {
  const payload: ICompanyUploadDocsReq = {
    documents,
    ...extra,
  };

  return axiosRequest<ICompanyUploadDocsRes>({
    method: 'POST',
    endpoint: `/company/document/upload/${companyId}`,
    data: payload,
  });
};

export const updateCompanyDocumentsApi = async (
  documents: any[],
  extra: any,
  companyId: string
): Promise<IApiResponse<ICompanyUploadDocsRes>> => {
  const payload: ICompanyUploadDocsReq = {
    documents,
    ...extra,
  };

  return axiosRequest<ICompanyUploadDocsRes>({
    method: 'PATCH',
    endpoint: `/company/update/document/upload/${companyId}`,
    data: payload,
  });
};
