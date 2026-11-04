import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccountDetail, Address, Company, Director } from '@/types';
import { useGetCompanyKycDetailsIdQuery } from '@/store/api/kycApi';
import { KycStatusBadge } from '@/pages/users/UsersPage';
import Loader from '@/components/common/Loader';

function formatShortDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB');
}

function formatAddress(address?: Address | null) {
  if (!address) return '—';
  const line2 = address.addressLine2 ? `, ${address.addressLine2}` : '';
  return `${address.addressLine1 ?? ''}${line2}, ${address.city ?? ''}, ${address.state ?? ''}, ${address.pincode ?? ''}`;
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm">
      <strong className="block mb-1 text-slate-400">{label}</strong>
      <span className="text-slate-200">{value || value === 0 ? value : '—'}</span>
    </div>
  );
}

function AccountStatusBadge({ status }: { status: string }) {
  const isActive = status?.toLowerCase() === 'active';
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
    >
      {status ?? '—'}
    </Badge>
  );
}

function KycStatusDisplay({ status }: { status?: string }) {
  if (status?.toLowerCase() === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3" />
        Verified
      </span>
    );
  }
  return <KycStatusBadge status={status} />;
}

function BasicInformationCard({
  mobile,
  email,
  type,
  status,
  kycStatus,
  referredCode,
  currentAddress,
}: {
  mobile: string;
  email: string;
  type: string;
  status: string;
  kycStatus?: string;
  referredCode?: string;
  currentAddress?: string;
}) {
  return (
    <Card className="shadow-sm border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <CardTitle className="text-lg font-medium text-slate-200">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
        <InfoField label="Mobile" value={mobile} />
        <InfoField label="Email" value={email} />
        <InfoField label="Type" value={type} />
        {referredCode && <InfoField label="Referred Code" value={referredCode} />}
        <div>
          <strong className="block mb-1 text-slate-400">Status</strong>
          <AccountStatusBadge status={status} />
        </div>
        <div>
          <strong className="block mb-1 text-slate-400">KYC Status</strong>
          <KycStatusDisplay status={kycStatus} />
        </div>
        {currentAddress && <InfoField label="Current Address" value={currentAddress} />}
      </CardContent>
    </Card>
  );
}

function CompanyDetailsCard({ company }: { company: any }) {
  return (
    <Card className="shadow-sm border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <CardTitle className="text-lg font-medium text-slate-200">Company Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
        <InfoField label="Legal Name" value={company?.legalEntityName} />
        {company?.tradeName && <InfoField label="Trade Name" value={company?.tradeName} />}
        <InfoField
          label="Entity Type"
          value={
            company?.entityType === 'PvtLtd' ? 'Private Limited' : company?.entityType
          }
        />
        <InfoField label="CIN / License No" value={company?.cinOrTradeLicenseNo} />
        <InfoField
          label="Incorporation Date"
          value={formatShortDate(company?.dateOfIncorporation)}
        />
        {/* Support both field naming conventions from different API responses */}
        <InfoField label="Email" value={company?.companyEmail ?? company?.email} />
        <InfoField label="Phone" value={company?.companyPhone ?? company?.phone} />
        {company?.websiteUrl && <InfoField label="Website" value={company?.websiteUrl} />}
      </CardContent>
    </Card>
  );
}

function DirectorDetailsCard({ director }: { director: any }) {
  // Support both `name` (flat) and `firstName`/`lastName` (split) conventions
  const fullName =
    director?.name ??
    (director?.firstName || director?.lastName
      ? `${director?.firstName ?? ''} ${director?.lastName ?? ''}`.trim()
      : null);

  const directorAddress = formatAddress(director?.permanentAddress);

  return (
    <Card className="shadow-sm border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <CardTitle className="text-lg font-medium text-slate-200">Director Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
        <InfoField label="Full Name" value={fullName} />
        <InfoField label="Role" value={director?.roleInCompany} />
        <InfoField label="Date of Birth" value={formatShortDate(director?.dateOfBirth)} />
        <InfoField label="Nationality" value={director?.nationality} />
        <InfoField label="Email" value={director?.email} />
        <InfoField label="Mobile" value={director?.mobileNumber} />
        {/* Support both kycIdentifiers.panNumber and directorMeta.panNumber */}
        <InfoField
          label="PAN Number"
          value={director?.kycIdentifiers?.panNumber ?? director?.directorMeta?.panNumber}
        />
        {director?.permanentAddress && (
          <InfoField label="Current Address" value={directorAddress} />
        )}
      </CardContent>
    </Card>
  );
}

interface BasicDetailsTabProps {
  account: AccountDetail;
}

export function BasicDetailsTab({ account }: BasicDetailsTabProps) {
  const isCompany = account?.type?.toLowerCase() === 'company';
  const isBroker = account?.type === 'Broker';

  const companyKycId = account?.kyc?.id || account?.meta?.kycId || account?.id;

  const {
    data: companyKycResponse,
    isLoading: isCompanyLoading,
    isFetching,
  } = useGetCompanyKycDetailsIdQuery(companyKycId, {
    skip: !isCompany || !companyKycId,
  });

  const companyKycData = companyKycResponse?.data || companyKycResponse;
  const company = companyKycData?.company || companyKycData?.companyDetails || null;
  const directors: any[] = companyKycData?.directors || companyKycData?.directorDetails || [];
  const kycStatus =
    companyKycData?.statuses?.kycStatus || companyKycData?.kycStatus || account?.kycStatus;

  const displayMobile =
    account?.mobile?.startsWith('+') || account?.mobile?.startsWith(account?.dialCode)
      ? account?.mobile
      : `${account?.dialCode ?? ''}${account?.mobile ?? ''}`;

  const fullCurrentAddress = account?.currentAddress
    ? [
        account.currentAddress.addressLine1,
        account.currentAddress.addressLine2,
        account.currentAddress.city,
        account.currentAddress.state,
        account.currentAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <BasicInformationCard
        mobile={displayMobile}
        email={account?.email}
        type={account?.type}
        status={account?.status}
        kycStatus={isCompany ? kycStatus : (account as any)?.kycStatus}
        referredCode={(account as any)?.referredCode}
        currentAddress={!isCompany && fullCurrentAddress ? fullCurrentAddress : undefined}
      />

      {/* Company-specific sections */}
      {isCompany && (isCompanyLoading || isFetching) && <Loader />}

      {isCompany && !isCompanyLoading && !isFetching && (
        <>
          {/* Company Details — falls back gracefully if no data */}
          <CompanyDetailsCard
            company={
              company ?? {
                legalEntityName: (account as any)?.companies?.[0]?.legalEntityName,
                tradeName: (account as any)?.companies?.[0]?.tradeName,
                entityType: (account as any)?.companies?.[0]?.entityType,
                cinOrTradeLicenseNo: (account as any)?.companies?.[0]?.cinOrTradeLicenseNo,
                dateOfIncorporation: (account as any)?.companies?.[0]?.dateOfIncorporation,
                companyEmail: (account as any)?.companies?.[0]?.companyEmail,
                companyPhone: (account as any)?.companies?.[0]?.companyPhone,
                websiteUrl: (account as any)?.companies?.[0]?.websiteUrl,
              }
            }
          />

          {/* Director Details — one card per director */}
          {directors.length > 0
            ? directors.map((director: any, index: number) => (
                <DirectorDetailsCard key={director?.id ?? index} director={director} />
              ))
            : (account as any)?.companies?.[0]?.directors?.map(
                (director: any, index: number) => (
                  <DirectorDetailsCard key={director?.id ?? index} director={director} />
                ),
              )}
        </>
      )}

      {/* Personal Details for non-company accounts */}
      {!isCompany && (
        <Card className="shadow-sm border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-4 border-b border-slate-800/50">
            <CardTitle className="text-lg font-medium text-slate-200">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
            <InfoField label="PAN Number" value={account?.meta?.panNumber} />
            <InfoField
              label="Date of Birth"
              value={formatShortDate(account?.meta?.dateOfBirth)}
            />
            <InfoField label="Occupation" value={account?.meta?.occupation} />
            <InfoField label="Monthly Income" value={account?.meta?.monthlyIncome} />
            {isBroker && (
              <>
                <InfoField label="Licence Number" value={(account as any)?.licenseNumber} />
                <InfoField
                  label="Licence Expiry"
                  value={formatShortDate((account as any)?.licenseExpiry)}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}