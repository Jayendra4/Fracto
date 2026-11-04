import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyKycDetailsResponse, KycStatus } from '@/types';
import { useGetCompanyKycDetailsIdQuery } from '@/store/api/kycApi';
import CompanyKycActionModal from './CompanyKycActionModal';
import Loader from '@/components/common/Loader';
import { useHasPermission } from '@/hooks/redux';

const CompanyKycDetails = () => {
  const { id } = useParams();
  const kycIdParam = Number(id);
  const canApprove = useHasPermission('kyc.approve');
  const canReject = useHasPermission('kyc.reject');

  const { data, isLoading, isError } = useGetCompanyKycDetailsIdQuery(kycIdParam, {
    skip: !kycIdParam,
  });

  const metaDetails = data?.company?.meta;

  // console.log(metaDetails, 'data');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<KycStatus | null>(null);
  const [remark, setRemark] = useState('');

  const handleAction = (type: KycStatus) => {
    setActionType(type);
    setIsModalOpen(true);
  };

  if (isLoading) return <Loader />;
  if (isError || !data) return <div className="p-6 text-red-500">Failed to load details</div>;

  const { company, directors, statuses, kycId } = data as CompanyKycDetailsResponse & {
    kycId: number;
  };

  const director = directors?.[0];

  const directorFullAddress = [
    director?.permanentAddress?.addressLine1,
    director?.permanentAddress?.addressLine2,
    director?.permanentAddress?.city,
    director?.permanentAddress?.state,
    director?.permanentAddress?.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const isRejected =
    statuses.overallStatus === KycStatus.Rejected ||
    statuses.kycStatus === KycStatus.Rejected ||
    statuses.kybStatus === KycStatus.Rejected;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h2 className="text-2xl font-bold">{company.legalEntityName}</h2>
          </div>
          {(statuses.overallStatus === KycStatus.Submitted ||
            statuses.overallStatus === KycStatus.Rejected) &&
            (canApprove || canReject) && (
            <div className="flex gap-2">
              {canApprove && (
                <Button
                  variant="outline"
                  disabled={isRejected}
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAction(KycStatus.Approved)}
                >
                  Approve
                </Button>
              )}
              {canReject && (
                <Button
                  variant="outline"
                  disabled={isRejected}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAction(KycStatus.Rejected)}
                >
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <Card>
          <CardContent className="flex gap-3 py-4">
            <Badge
              variant={
                statuses.overallStatus === KycStatus.Rejected
                  ? 'destructive'
                  : statuses.overallStatus === KycStatus.Approved
                    ? 'default'
                    : 'secondary'
              }
            >
              Overall: {statuses.overallStatus}
            </Badge>
            <Badge
              variant={
                statuses.kycStatus === KycStatus.Rejected
                  ? 'destructive'
                  : statuses.kycStatus === KycStatus.Approved
                    ? 'default'
                    : 'secondary'
              }
            >
              KYC: {statuses.kycStatus}
            </Badge>
            <Badge
              variant={
                statuses.kybStatus === KycStatus.Rejected
                  ? 'destructive'
                  : statuses.kybStatus === KycStatus.Approved
                    ? 'default'
                    : 'secondary'
              }
            >
              KYB: {statuses.kybStatus}
            </Badge>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            {company.tradeName && (
              <div>
                <p className="text-muted-foreground font-medium">Trade Name</p>
                <p className="text-lg">{company.tradeName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground font-medium">Entity Type</p>
              <p className="text-lg">{company.entityType}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">CIN</p>
              <p className="text-lg">{company.cinOrTradeLicenseNo}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Email</p>
              <p className="text-lg">{company.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Phone</p>
              <p className="text-lg">{company.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">PAN</p>
              <p className="text-lg">{company.meta.panNumber ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Registered Address */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {company.registeredAddress.addressLine1}, {company.registeredAddress.city},{' '}
            {company.registeredAddress.state} - {company.registeredAddress.pincode}
          </CardContent>
        </Card>

        {/* Business / Meta Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground font-medium">Industry Type</p>
              <p className="text-sm">{metaDetails?.industryType ?? '—'}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Nature of Business</p>
              <p className="text-sm">{metaDetails?.natureOfBusiness ?? '—'}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Monthly Transaction Volume</p>
              <p className="text-sm">{metaDetails?.expectedMonthlyTransactionVolume ?? '—'}</p>
            </div>
            {/* 
            <div>
              <p className="text-muted-foreground font-medium">PAN Number</p>
              <p className="text-sm">{metaDetails?.panNumber ?? '—'}</p>
            </div> */}

            <div>
              <p className="text-muted-foreground font-medium">Publicly Listed</p>
              <p className="text-sm">{metaDetails?.isCompanyPubliclyListed ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Place of Business Proof</p>
              <p className="text-sm capitalize">{metaDetails?.placeOfBusinessProofType ?? '—'}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Trade License Expiry</p>
              <p className="text-sm">
                {metaDetails?.tradeLicenseExpiryDate
                  ? new Date(metaDetails.tradeLicenseExpiryDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Countries of Operation</p>
              <p className="text-sm">{metaDetails?.countriesOfOperation?.join(', ') ?? '—'}</p>
            </div>

            {/* Full width field */}
            <div className="md:col-span-2">
              <p className="text-muted-foreground font-medium">Business Description</p>
              <p className="text-sm leading-relaxed">{metaDetails?.businessDescription ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Company Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Company Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {/* {company.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="relative group border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800"
              >
                <img src={doc.url} className="h-40 w-full object-cover" />
                <div className="text-lg px-2 capitalize">{doc.documentName}</div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ExternalLink className="text-white" />
                </div>
              </a>
            ))} */}

            {company.documents.map((doc) => {
              const isPdf = doc.url?.toLowerCase().endsWith('.pdf');

              return (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative group border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  {isPdf ? (
                    <div className="h-40 w-full flex flex-col items-center justify-center bg-slate-600  gap-2">
                      <FileText className="text-slate-200 text-5xl" />
                      <span className="text-slate-200 font-semibold text-sm">PDF</span>
                    </div>
                  ) : (
                    <img src={doc.url} className="h-40 w-full object-cover" />
                  )}

                  <div className="text-lg px-2 capitalize">{doc.documentName}</div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ExternalLink className="text-white" />
                  </div>
                </a>
              );
            })}
          </CardContent>
        </Card>

        {/* Directors */}

        <Card>
          <CardHeader>
            <CardTitle>Director Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
            <div>
              <strong className="block mb-1 text-slate-400">Full Name</strong>
              <span className="text-slate-200">{director ? `${director.name}` : '—'}</span>
            </div>

            <div>
              <strong className="block mb-1 text-slate-400">Role</strong>
              <span className="text-slate-200">{director?.roleInCompany ?? '—'}</span>
            </div>

            <div>
              <strong className="block mb-1 text-slate-400">Date of Birth</strong>
              <span className="text-slate-200">
                {director?.dateOfBirth ? new Date(director.dateOfBirth).toLocaleDateString() : '—'}
              </span>
            </div>

            <div>
              <strong className="block mb-1 text-slate-400">Nationality</strong>
              <span className="text-slate-200 capitalize">{director?.nationality ?? '—'}</span>
            </div>

            <div>
              <strong className="block mb-1 text-slate-400">Email</strong>
              <span className="text-slate-200">{director?.email ?? '—'}</span>
            </div>

            <div>
              <strong className="block mb-1 text-slate-400">Mobile</strong>
              <span className="text-slate-200">{director?.mobileNumber ?? '—'}</span>
            </div>

            {director?.directorMeta?.panNumber && (
              <div>
                <strong className="block mb-1 text-slate-400">PAN Number</strong>
                <span className="text-slate-200">{director?.directorMeta?.panNumber ?? '—'}</span>
              </div>
            )}
            {director && director?.permanentAddress && (
              <div>
                <strong className="block mb-1 text-slate-400">Current Address</strong>
                <span className="text-slate-200">{directorFullAddress}</span>
              </div>
            )}

            {(director?.documents?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {director?.documents!.map((doc) => {
                  const isPdf = doc.url?.toLowerCase().includes('.pdf');

                  return (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border rounded-md overflow-hidden bg-slate-100"
                    >
                      {isPdf ? (
                        <div className="h-28 w-full flex flex-col items-center justify-center bg-slate-600 gap-1">
                          <FileText className="text-slate-200 w-10 h-10" />
                          <span className="text-slate-200 font-semibold text-sm">PDF</span>
                        </div>
                      ) : (
                        <img src={doc.url} className="h-28 w-full object-cover" />
                      )}
                      <div className="text-lg text-black px-2 capitalize">{doc.documentName}</div>
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Directors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {directors.map((director) => (
              <div key={director.id} className="border rounded-lg p-4 space-y-2">
                <div className="font-medium text-lg">{director.name}</div>
                <div className="text-sm text-muted-foreground">
                  {director.roleInCompany} • {director.email} • {director.mobileNumber}
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs mt-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded">
                  <div>
                    <p className="text-muted-foreground font-medium">PAN</p>
                    <p>{director.kycIdentifiers.panNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">DOB</p>
                    <p>{new Date(director.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>

                {director.documents.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {director.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="border rounded-md overflow-hidden bg-slate-100"
                      >
                        <img src={doc.url} className="h-28 w-full object-cover" />
                        <div className="text-lg text-black px-2 capitalize">{doc.documentName}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card> */}
      </div>

      <CompanyKycActionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{ company, id: kycId }}
        action={actionType!}
        remark={remark}
        setRemark={setRemark}
      />
    </>
  );
};

export default CompanyKycDetails;
