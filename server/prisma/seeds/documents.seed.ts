import { Prisma } from '../../src/generated/prisma/client';

export const documents: Prisma.DocumentCreateInput[] = [
  {
    developerName: 'certificate_of_incorporation',
    name: 'Certificate of Incorporation',
  },
  { developerName: 'moa', name: 'MoA' },
  { developerName: 'aoa', name: 'AoA' },
  { developerName: 'company_pan', name: 'Company PAN' },
  { developerName: 'gst_certificate', name: 'GST Certificate' },
  { developerName: 'trade_license', name: 'Trade License' },
  { developerName: 'shareholding_pattern', name: 'Shareholding Pattern' },
  {
    developerName: 'registered_address_proof',
    name: 'Registered Address Proof',
  },
  { developerName: 'board_resolution', name: 'Board Resolution' },
  { developerName: 'audited_financials', name: 'Audited Financials' },
  { developerName: 'net_worth_certificate', name: 'Net Worth Certificate' },
  { developerName: 'business_pan_card', name: 'Business PAN Card Copy' },
  { developerName: 'pan_indian', name: 'Pan Indian' },
  { developerName: 'emirates_id', name: 'Emirates Id' },
  { developerName: 'passport_indian', name: 'Passport Indian' },
  { developerName: 'passport_emirati', name: 'Passport Emirati' },
  { developerName: 'address_proof', name: 'Address Proof' },
  { developerName: 'selfie_photo', name: 'Selfie Photo' },
  { developerName: 'passport_size_photo', name: 'Passport-size Photo' },
  { developerName: 'secondary_id', name: 'Secondary ID' },
];

export enum AssetSubType {
  Industrial = 'Industrial',
  Commercial = 'Commercial',
  Retail = 'Ratail',
  Residential = 'Residential',
}
