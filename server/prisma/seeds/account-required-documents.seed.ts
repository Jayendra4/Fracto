import { AccountType, Prisma } from '../../src/generated/prisma/client';

export const companyDocs: Omit<
  Prisma.AccountRequiredDocumentCreateInput,
  'documentTypeId'
>[] = [
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 1,
    documentType: {
      connect: { developerName: 'certificate_of_incorporation' },
    },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 2,
    documentType: { connect: { developerName: 'moa' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 12,
    documentType: { connect: { developerName: 'aoa' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 3,
    documentType: { connect: { developerName: 'company_pan' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 4,
    documentType: { connect: { developerName: 'gst_certificate' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 5,
    documentType: { connect: { developerName: 'trade_license' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 6,
    documentType: { connect: { developerName: 'shareholding_pattern' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 7,
    documentType: { connect: { developerName: 'registered_address_proof' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: true,
    order: 8,
    documentType: { connect: { developerName: 'board_resolution' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: false,
    order: 9,
    documentType: { connect: { developerName: 'audited_financials' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: false,
    order: 10,
    documentType: { connect: { developerName: 'net_worth_certificate' } },
  },
  {
    accountType: AccountType.Company,
    mandatory: false,
    order: 11,
    documentType: { connect: { developerName: 'business_pan_card' } },
  },
];

export const directorDocs: Omit<
  Prisma.AccountRequiredDocumentCreateInput,
  'documentTypeId'
>[] = [
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 1,
    documentType: { connect: { developerName: 'pan_indian' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 1,
    documentType: { connect: { developerName: 'emirates_id' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 2,
    documentType: { connect: { developerName: 'passport_indian' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 2,
    documentType: { connect: { developerName: 'passport_emirati' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 3,
    documentType: { connect: { developerName: 'address_proof' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 4,
    documentType: { connect: { developerName: 'selfie_photo' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 5,
    documentType: { connect: { developerName: 'passport_size_photo' } },
  },
  {
    accountType: AccountType.Director,
    mandatory: false,
    order: 6,
    documentType: { connect: { developerName: 'secondary_id' } },
  },
];

export const allAccountTypeDocs: Omit<
  Prisma.AccountRequiredDocumentCreateInput,
  'documentTypeId'
>[] = [];

Object.values(AccountType).forEach((type) => {
  directorDocs.forEach((item) => {
    allAccountTypeDocs.push({
      accountType: type,
      mandatory: item.mandatory,
      order: item.order,
      documentType: {
        connect: { developerName: item.documentType.connect!.developerName },
      },
    });
  });
});
