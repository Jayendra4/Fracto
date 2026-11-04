import { useParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  ShieldMinus,
  CheckCheck,
  CheckSquare,
  Users,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react'; // new updatek
import { useGetAccountByIdQuery } from '@/store/api/accountsApi';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Settings, Shield } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BankAccountDetails } from './BankAccountDetails';
import { AccountStatement } from './AccountStatement';
import { InvestedAssets } from './InvestedAssets';
import { UploadedAssets } from './UploadedAssets';
import { BrokerLeads } from './BrokerLeads';
import { BrokerCommissions } from './CommissionPage'; // one new update
import { CommissionWithdrawal } from './CommissionWithdrawal';
import Loader from '@/components/common/Loader';
import { useHasPermission } from '@/hooks/redux';
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BrokerCommissionsPct } from './CommisionApprove';
import { RefferedPropertiesByBroker } from './RefferedPropertiesByBroker';
// import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// from new update
export function KycStatusBadge({ status }: { status: string }) {
  if (status === 'Draft' || status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900/30 dark:text-yellow-200">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }
  if (status === 'Submitted' || status === 'submitted') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-200">
        <CheckSquare className="w-3 h-3" />
        Submitted
      </span>
    );
  }
  if (status === 'Approved' || status === 'approved' || status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-200">
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    );
  }
  if (status === 'Rejected' || status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-200">
        <ShieldMinus className="w-3 h-3" />
        Rejected
      </span>
    );
  }
  return <span className="text-xs font-medium">{status || 'N/A'}</span>;
}
// to new update

export function UserDetailPage() {
  const canViewLeads = useHasPermission('broker.lead_view');
  const canViewCommissions = useHasPermission('broker.commission_view');
  const canViewBankDetails = useHasPermission('users.bank_view');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const { id } = useParams();
  const accountId = Number(id);

  const { data, isLoading, isError } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return <div className="p-6 text-red-500">Failed to load user details</div>;
  }

  const {
    firstname,
    lastname,
    email,
    mobile,
    status,
    type,
    licenseNumber,
    licenseExpiry,
    isVerified,
    entityDocument,
    companies,
    meta,
    referredCode,
    currentAddress,
  } = data;

  const isBroker = type === 'Broker';
  const isAssetOwner = type === 'AssetOwner';
  const isCompany = type === 'Company';
  const isInvestor = type === 'Investor';
  const date = new Date(licenseExpiry);

  const formatted = date.toLocaleDateString('en-GB');

  const directorsDocuments = companies?.[0]?.directors?.[0]?.documents ?? [];
  const company = companies?.[0];
  const director = company?.directors?.[0];

  const fullAddress = [
    currentAddress?.addressLine1,
    currentAddress?.addressLine2,
    currentAddress?.city,
    currentAddress?.state,
    currentAddress?.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const directorFullAddress = [
    director?.permanentAddress?.addressLine1,
    director?.permanentAddress?.addressLine2,
    director?.permanentAddress?.city,
    director?.permanentAddress?.state,
    director?.permanentAddress?.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full p-6 pb-20 space-y-6 animate-fade-in">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">
          User Details - {firstname} {lastname}
        </h2>
      </div>

      <Tabs defaultValue="basicDetails" className="w-full space-y-4">
        {/* <TabsList className="grid w-full grid-cols-7"> */}
        <div className="relative flex items-center w-full">
          {/* LEFT ARROW */}
          <button
            onClick={scrollLeft}
            className={`mr-2 p-1 rounded-full transition cursor-pointer
      ${canScrollLeft ? 'hover:bg-slate-800' : 'opacity-30'}
    `}
          >
            <ChevronLeft className="w-4 h-4 ml-2" />
          </button>

          <div
            ref={scrollRef}
            onScroll={updateScrollButtons}
            className="flex overflow-x-auto hide-scrollbar"
          >
            <TabsList className="flex gap-3">
              {/* new 5 update */}
              <TabsTrigger
                value="basicDetails"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4 mr-1 shrink-0" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger
                value="kycDocuments"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-1 shrink-0" />
                KYC Documents
              </TabsTrigger>
              {canViewBankDetails && (
                <TabsTrigger
                  value="bankAccountDetails"
                  className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4 mr-1 shrink-0" />
                  Bank Details
                </TabsTrigger>
              )}
              {canViewBankDetails && (
                <TabsTrigger
                  value="accountStatement"
                  className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4 mr-1 shrink-0" />
                  Account Statement
                </TabsTrigger>
              )}
              <TabsTrigger
                value="investedAssets"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-1 shrink-0" />
                Invested Assets
              </TabsTrigger>
              {/* from new 3 update */}
              {/* <TabsTrigger value="leads" className="flex items-center px-4">
            <Users className="w-4 h-4 mr-1 shrink-0" />
            Leads
          </TabsTrigger>

          <TabsTrigger value="commissions" className="flex items-center px-4">
            <IndianRupee className="w-4 h-4 mr-1 shrink-0" />
            Commissions
          </TabsTrigger> */}
              {/* to new 3 update */}
              {/* from new 5 udpate */}
              {isBroker && (
                <>
                  {canViewLeads && (
                    <TabsTrigger
                      value="leads"
                      className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                    >
                      <Users className="w-4 h-4 mr-1 shrink-0" />
                      Leads
                    </TabsTrigger>
                  )}

                  {canViewCommissions && (
                    <TabsTrigger
                      value="commissions"
                      className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                    >
                      <IndianRupee className="w-4 h-4 mr-1 shrink-0" />
                      Commissions
                    </TabsTrigger>
                  )}

                  <TabsTrigger
                    value="withdrawals"
                    className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                  >
                    <IndianRupee className="w-4 h-4 mr-1 shrink-0" />
                    Commission Withdrawal
                  </TabsTrigger>
                  <TabsTrigger
                    value="commissionpct"
                    className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                  >
                    <IndianRupee className="w-4 h-4 mr-1 shrink-0" />
                    Commission %
                  </TabsTrigger>

                  <TabsTrigger
                    value="refferedProperties"
                    className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1 shrink-0" />
                    Referred Properties
                  </TabsTrigger>
                </>
              )}
              {/* to new 5 udpate */}
              {/* {data?.type !== 'CorporateInvestor' && (
            <TabsTrigger value="uploadedAssets" className="flex items-center px-4">
              <Shield className="w-4 h-4 mr-1 shrink-0" />
              Uploaded Assets
            </TabsTrigger>
          )} */}
              {/* from new 5 udpate */}
              {(isAssetOwner || isCompany) && (
                <TabsTrigger
                  value="uploadedAssets"
                  className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4 mr-1 shrink-0" />
                  Uploaded Assets
                </TabsTrigger>
              )}
              {/* to new 5 udpate */}
            </TabsList>
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={scrollRight}
            className={`ml-2 p-1 rounded-full transition cursor-pointer
      ${canScrollRight ? 'hover:bg-slate-800' : 'opacity-30'}
    `}
          >
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        {/* Basic Details */}
        <TabsContent value="basicDetails" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg font-medium text-slate-200">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
              <div>
                <strong className="block mb-1 text-slate-400">Mobile</strong>
                <span className="text-slate-200">{mobile}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Email</strong>
                <span className="text-slate-200">{email}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Type</strong>
                <span className="text-slate-200">{type}</span>
              </div>
              {referredCode && (
                <div>
                  <strong className="block mb-1 text-slate-400">Referred Code</strong>
                  <span className="text-slate-200">{referredCode}</span>
                </div>
              )}
              <div>
                <strong className="block mb-1 text-slate-400">Status</strong>
                <Badge
                  variant={status === 'Active' ? 'default' : 'secondary'}
                  className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
                >
                  {status}
                </Badge>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">KYC Status</strong>
                <KycStatusBadge status={(data as any).kycStatus} />
              </div>
              {currentAddress && currentAddress?.id && !isCompany && (
                <div>
                  <strong className="block mb-1 text-slate-400">Current Address</strong>
                  <span className="text-slate-200">{fullAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meta Info */}
          {!isCompany && (
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
                <div>
                  <strong className="block mb-1 text-slate-400">PAN Number</strong>
                  <span className="text-slate-200">{meta?.panNumber ?? '—'}</span>
                </div>
                <div>
                  <strong className="block mb-1 text-slate-400">Date of Birth</strong>
                  <span className="text-slate-200">
                    {meta?.dateOfBirth ? new Date(meta.dateOfBirth).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div>
                  <strong className="block mb-1 text-slate-400">Occupation</strong>
                  <span className="text-slate-200">{meta?.occupation ?? '—'}</span>
                </div>
                <div>
                  <strong className="block mb-1 text-slate-400">Monthly Income</strong>
                  <span className="text-slate-200">{meta?.monthlyIncome ?? '—'}</span>
                </div>
                {isBroker && (
                  <>
                    <div>
                      <strong className="block mb-1 text-slate-400">Licence Number</strong>
                      <span className="text-slate-200">{licenseNumber ?? '—'}</span>
                    </div>
                    <div>
                      <strong className="block mb-1 text-slate-400">Licence Expiry</strong>
                      <span className="text-slate-200">{formatted ?? '—'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {isCompany && (
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Company Details
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
                <div>
                  <strong className="block mb-1 text-slate-400">Legal Name</strong>
                  <span className="text-slate-200">{company?.legalEntityName ?? '—'}</span>
                </div>

                {company?.tradeName && (
                  <div>
                    <strong className="block mb-1 text-slate-400">Trade Name</strong>
                    <span className="text-slate-200">{company?.tradeName ?? '—'}</span>
                  </div>
                )}

                <div>
                  <strong className="block mb-1 text-slate-400">Entity Type</strong>
                  <span className="text-slate-200">
                    {company?.entityType == 'PvtLtd'
                      ? 'Private Limited'
                      : (company?.entityType ?? '—')}
                  </span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">CIN / License No</strong>
                  <span className="text-slate-200">{company?.cinOrTradeLicenseNo ?? '—'}</span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">Incorporation Date</strong>
                  <span className="text-slate-200">
                    {company?.dateOfIncorporation
                      ? new Date(company.dateOfIncorporation).toLocaleDateString()
                      : '—'}
                  </span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">Email</strong>
                  <span className="text-slate-200">{company?.companyEmail ?? '—'}</span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">Phone</strong>
                  <span className="text-slate-200">{company?.companyPhone ?? '—'}</span>
                </div>

                {company?.websiteUrl && (
                  <div>
                    <strong className="block mb-1 text-slate-400">Website</strong>
                    <span className="text-slate-200">{company?.websiteUrl ?? '—'}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isCompany && (
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Director Details
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
                <div>
                  <strong className="block mb-1 text-slate-400">Full Name</strong>
                  <span className="text-slate-200">
                    {director ? `${director.firstName} ${director.lastName}` : '—'}
                  </span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">Role</strong>
                  <span className="text-slate-200">{director?.roleInCompany ?? '—'}</span>
                </div>

                <div>
                  <strong className="block mb-1 text-slate-400">Date of Birth</strong>
                  <span className="text-slate-200">
                    {director?.dateOfBirth
                      ? new Date(director.dateOfBirth).toLocaleDateString()
                      : '—'}
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

                <div>
                  <strong className="block mb-1 text-slate-400">PAN Number</strong>
                  <span className="text-slate-200">{director?.directorMeta?.panNumber ?? '—'}</span>
                </div>
                {director && director?.permanentAddress && isCompany && (
                  <div>
                    <strong className="block mb-1 text-slate-400">Current Address</strong>
                    <span className="text-slate-200">{directorFullAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* KYC Documents */}
        <TabsContent value="kycDocuments" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg font-medium text-slate-200">
                {isCompany ? 'KYB Documents' : 'KYC Documents'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entityDocument?.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {entityDocument.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block overflow-hidden transition-colors border rounded-lg group border-slate-700 bg-slate-950 hover:border-blue-500/50"
                    >
                      {/* <div className="aspect-[4/3] bg-slate-900 w-full overflow-hidden">
                        <img
                          src={doc.url}
                          alt="Document"
                          className="object-cover w-full h-full transition-opacity opacity-80 group-hover:opacity-100"
                        />

                      </div> */}

                      <div className="aspect-[4/3] bg-slate-900 w-full overflow-hidden flex items-center justify-center">
                        {doc?.url?.toLowerCase().endsWith('.pdf') ? (
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium"
                          >
                            {doc.documentName} PDF
                          </button>
                        ) : (
                          <img
                            src={doc.url}
                            alt="Document"
                            className="object-cover w-full h-full transition-opacity opacity-80 group-hover:opacity-100"
                          />
                        )}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center transition opacity-0 bg-black/40 group-hover:opacity-100">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex items-center justify-between p-3 text-xs border-t bg-slate-900/80 backdrop-blur-sm border-slate-800">
                        <span className="font-medium text-slate-300">
                          Document #{doc.documentTypeId} - {doc.documentName}
                        </span>
                        {/* <KycStatusBadge status={(data as any).kycStatus} /> */}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No documents uploaded</p>
              )}
            </CardContent>
          </Card>

          {isCompany && (
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">KYC Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {directorsDocuments?.length ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {directorsDocuments.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block overflow-hidden transition-colors border rounded-lg group border-slate-700 bg-slate-950 hover:border-blue-500/50"
                      >
                        {/* <div className="aspect-[4/3] bg-slate-900 w-full overflow-hidden">
                        <img
                          src={doc.url}
                          alt="Document"
                          className="object-cover w-full h-full transition-opacity opacity-80 group-hover:opacity-100"
                        />

                      </div> */}

                        <div className="aspect-[4/3] bg-slate-900 w-full overflow-hidden flex items-center justify-center">
                          {doc?.url?.toLowerCase().endsWith('.pdf') ? (
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium"
                            >
                              {doc.documentType?.name} PDF
                            </button>
                          ) : (
                            <img
                              src={doc.url}
                              alt="Document"
                              className="object-cover w-full h-full transition-opacity opacity-80 group-hover:opacity-100"
                            />
                          )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center transition opacity-0 bg-black/40 group-hover:opacity-100">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex items-center justify-between p-3 text-xs border-t bg-slate-900/80 backdrop-blur-sm border-slate-800">
                          <span className="font-medium text-slate-300">
                            Document # - {doc.documentType?.name}
                          </span>
                          {/* <KycStatusBadge status={(data as any).kycStatus} /> */}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Bank Account Details */}
        {canViewBankDetails && (
          <TabsContent value="bankAccountDetails" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardContent className="p-0">
                <BankAccountDetails />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {canViewBankDetails && (
          <TabsContent value="accountStatement" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Account Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AccountStatement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        <TabsContent value="investedAssets" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg font-medium text-slate-200">Invested Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <InvestedAssets />
            </CardContent>
          </Card>
        </TabsContent>
        {/* from new 5 update */}
        {isBroker && canViewLeads && (
          <TabsContent value="leads" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardContent className="p-0">
                <BrokerLeads brokerId={accountId} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isBroker && canViewCommissions && (
          <TabsContent value="commissions" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardContent className="p-0">
                <BrokerCommissions brokerId={accountId} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isBroker && (
          <TabsContent value="withdrawals" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardContent className="p-0">
                <CommissionWithdrawal brokerId={accountId} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isBroker && (
          <TabsContent value="commissionpct" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardContent className="p-0">
                <BrokerCommissionsPct brokerId={accountId} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isBroker && (
          <TabsContent value="refferedProperties" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Referred Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <RefferedPropertiesByBroker />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {(isAssetOwner || isCompany) && (
          <TabsContent value="uploadedAssets" className="space-y-6">
            <Card className="shadow-sm border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200">
                  Uploaded Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <UploadedAssets />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {/* to new 5 update */}
        {/* <TabsContent value="uploadedAssets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadedAssets />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
