import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/common/BackButton';
import { ExternalLink, Check, MapPin } from 'lucide-react';
import { RwaNewStatus } from '@/types';
import { useState } from 'react';
import { useGetAssetByIdQuery, useUpdateAssetStatusMutation } from '@/store/api/assetsApi';
import { getMetaValue } from '@/utils/assetMeta';
import { formatDate } from '@/utils';
import { AssetStatusActionModal } from './AssetStatusActionModal';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [remark, setRemark] = useState('');
  const assetId = Number(id);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const {
    data: asset,
    isLoading,
    isError,
  } = useGetAssetByIdQuery(assetId, {
    skip: !assetId,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateAssetStatusMutation();

  if (isLoading) return <Loader />;
  if (isError || !asset) return <div className="p-6 text-red-500">Failed to load asset</div>;

  const meta = asset.meta ?? [];
  const documents = asset.documents ?? [];

  const currentStatus = (asset?.rwaRequest?.status as string) ?? '';
  const isDraft = currentStatus === 'Draft' || (asset?.rwaRequest?.status as any) === 'Draft';

  const statusForLegal = asset?.rwaRequest?.statusForLegal;
  const statusForValuation = asset?.rwaRequest?.statusForValuation;
  const statusForDueDiligence = asset?.rwaRequest?.statusForDueDiligence;

  // Legacy fallbacks if key-specific status is undefined
  const legacyStep2Approved = [
    'LegalReviewed',
    'ValuationReviewed',
    'ValuationRejected',
    'DueDiligence',
    'DueDiligenceRejected',
  ].includes(currentStatus);
  const legacyStep3Approved = [
    'ValuationReviewed',
    'DueDiligence',
    'DueDiligenceRejected',
  ].includes(currentStatus);
  const legacyStep4Approved = currentStatus === 'DueDiligence';

  // Legal tab status
  const isLegalApproved =
    statusForLegal !== undefined
      ? statusForLegal === 'LegalReviewed' || statusForLegal === 'Approved'
      : legacyStep2Approved;
  const isLegalDone =
    statusForLegal !== undefined
      ? statusForLegal === 'LegalReviewed' ||
        statusForLegal === 'LegalRejected' ||
        statusForLegal === 'Approved' ||
        statusForLegal === 'Rejected'
      : legacyStep2Approved;

  // Valuation tab status
  const isValuationApproved =
    statusForValuation !== undefined
      ? statusForValuation === 'ValuationReviewed' || statusForValuation === 'Approved'
      : legacyStep3Approved;
  const isValuationDone =
    statusForValuation !== undefined
      ? statusForValuation === 'ValuationReviewed' ||
        statusForValuation === 'ValuationRejected' ||
        statusForValuation === 'Approved' ||
        statusForValuation === 'Rejected'
      : legacyStep3Approved;

  // Due Diligence tab status
  const isDueDiligenceApproved =
    statusForDueDiligence !== undefined
      ? statusForDueDiligence === 'DueDiligence' ||
        statusForDueDiligence === 'DueDiligenceReviewed' ||
        statusForDueDiligence === 'Approved'
      : legacyStep4Approved;
  const isDueDiligenceDone =
    statusForDueDiligence !== undefined
      ? statusForDueDiligence === 'DueDiligence' ||
        statusForDueDiligence === 'DueDiligenceReviewed' ||
        statusForDueDiligence === 'DueDiligenceRejected' ||
        statusForDueDiligence === 'Approved' ||
        statusForDueDiligence === 'Rejected'
      : legacyStep4Approved;

  const openActionModal = (data: any, action: string, status: string) => {
    setSelectedRequest(data);
    setActionType(action);
    setActionStatus(status);
    setRemark('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setActionStatus(null);
    setRemark('');
  };

  const statusLabels: Record<string, string> = {
    ReviewPending: 'Submitted',
    Reviewed: 'Approved',
    ReviewReject: 'Rejected',
  };

  const handleConfirm = async (remark: string) => {
    if (!selectedRequest || !actionType) return;

    try {
      await updateStatus({
        id: asset.id,
        status: actionStatus!,
        newStatus: actionType,
        trusteeComment: remark,
        ...((actionType === 'Rejected' ||
          actionType === RwaNewStatus.Rejected ||
          actionType.endsWith('Rejected')) && {
          rejectionReason: remark,
        }),
      }).unwrap();

      toast.success(
        `Asset ${actionType === 'Rejected' || actionType === RwaNewStatus.Rejected || actionType.endsWith('Rejected') ? 'rejected' : 'approved'} successfully`
      );

      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong while updating asset status');
    }
  };

  return (
    <>
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-10">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">{asset.assetTitle ?? '—'}</h1>
              <p className="text-muted-foreground">Owned by {asset.currentOwnerName ?? '—'}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="due-diligence" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted mb-6">
            <TabsTrigger value="basic-info" className="flex items-center justify-center gap-2">
              Property basic Info
            </TabsTrigger>
            <TabsTrigger value="legal-review" className="flex items-center justify-center gap-2">
              {isLegalApproved && <Check className="w-4 h-4 text-green-500" />}
              Legal Review
            </TabsTrigger>
            <TabsTrigger
              value="valuation-detail"
              className="flex items-center justify-center gap-2"
            >
              {isValuationApproved && <Check className="w-4 h-4 text-green-500" />}
              Valuation Detail
            </TabsTrigger>
            <TabsTrigger value="due-diligence" className="flex items-center justify-center gap-2">
              {isDueDiligenceApproved && <Check className="w-4 h-4 text-green-500" />}
              Due Diligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Info label="Short Description" value={getMetaValue(meta, 'shortDescription')} />
                <Info label="Country" value={getMetaValue(meta, 'country')} />
                <Info label="State" value={getMetaValue(meta, 'state')} />
                <Info label="City" value={getMetaValue(meta, 'city')} />
                <Info label="Pincode" value={getMetaValue(meta, 'pincode')} />
                <Info label="Geo Location" value={getMetaValue(meta, 'geoLocation')} />
                {getMetaValue(meta, 'mapUrl') ? (
                  <div className="flex items-center">
                    <a
                      href={getMetaValue(meta, 'mapUrl') as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/50 rounded-full transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Google Location
                    </a>
                  </div>
                ) : (
                  <Info label="Google Location" value={null} />
                )}
                <Info label="Asset Type" value={asset.assetType} />
                <Info label="Asset Sub Type" value={getMetaValue(meta, 'assetSubType')} />
                <Info label="Ownership Model" value={asset.ownershipModel} />
                <Info
                  label="Created At"
                  value={asset.createdAt ? formatDate(asset.createdAt) : '—'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents
                    .filter((item) => item?.documentType === 'ASSET_IMAGE')
                    .map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative border rounded-md overflow-hidden"
                      >
                        <img src={doc.url} alt="Asset Image" className="h-48 w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <ExternalLink className="text-white h-6 w-6" />
                        </div>
                      </a>
                    ))}
                  {documents.filter((item) => item?.documentType === 'ASSET_IMAGE').length ===
                    0 && <p className="text-muted-foreground text-sm">No images uploaded</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents
                    .filter((item) => item?.documentType === 'ASSET_VIDEO')
                    .map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url || doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative border rounded-md overflow-hidden bg-black"
                      >
                        <video
                          src={doc.url || doc.documentUrl}
                          className="h-48 w-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <ExternalLink className="text-white h-6 w-6" />
                        </div>
                      </a>
                    ))}
                  {documents.filter((item) => item?.documentType === 'ASSET_VIDEO').length ===
                    0 && <p className="text-muted-foreground text-sm">No videos uploaded</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal-review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Info label="Current Owner Name" value={asset.currentOwnerName} />
                <Info
                  label="Ownership Entity Type"
                  value={getMetaValue(meta, 'ownershipEntityType')}
                />
                <Info label="Title Status" value={getMetaValue(meta, 'titleStatus')} />
                <Info
                  label="Encumbrance Details"
                  value={getMetaValue(meta, 'encumbranceDetails')}
                />
                <Info
                  label="Survey / Khasra Number"
                  value={
                    getMetaValue(meta, 'propertySurveyKhasraNumber') ||
                    getMetaValue(meta, 'propertySurveyKhasraNumber')
                  }
                />
                <Info
                  label="RERA Registration Number"
                  value={getMetaValue(meta, 'reraRegistrationNumber')}
                />
                <Info label="Land Area" value={getMetaValue(meta, 'landArea')} />
                <Info label="Built-up Area" value={getMetaValue(meta, 'builtupArea')} />
                <Info label="Year Built" value={getMetaValue(meta, 'yearOfConstruction')} />
                <Info label="Asset Age" value={getMetaValue(meta, 'assetAge')} />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 justify-end ml-auto">
                <Button
                  size="sm"
                  onClick={() => openActionModal(asset, 'LegalReviewed', 'LegalReviewed')}
                  disabled={isLegalDone}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openActionModal(asset, 'LegalRejected', 'LegalRejected')}
                  disabled={isLegalDone}
                >
                  Reject
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="valuation-detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Detail</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Info label="Market Value" value={getMetaValue(meta, 'marketValue')} />
                <Info label="Currency" value={getMetaValue(meta, 'currency')} />
                <Info label="Valuation Agency" value={getMetaValue(meta, 'valuationAgencyName')} />
                <Info
                  label="Valuation Report Date"
                  value={getMetaValue(meta, 'valuationReportDate')}
                />
                <Info label="Last Purchase Price" value={getMetaValue(meta, 'lastPurchasePrice')} />
                <Info
                  label="Monthly Rental Income"
                  value={getMetaValue(meta, 'rentalIncomeMonthly')}
                />
                <Info
                  label="Lease Tenure Remaining"
                  value={getMetaValue(meta, 'leaseTenureRemainingMonths')}
                />
                <Info label="Last 3-Year Revenue" value={getMetaValue(meta, 'last3YearRevenue')} />
                <Info
                  label="Annual Operational Expenses"
                  value={getMetaValue(meta, 'operationalExpensesAnnual')}
                />
                <Info
                  label="Net Operational Income"
                  value={getMetaValue(meta, 'netOperationalIncome')}
                />
                <Info
                  label="Expected Yield"
                  value={getMetaValue(meta, 'expectedYieldPercentage')}
                  suffix="%"
                />
                <Info
                  label="Expected Appreciation"
                  value={getMetaValue(meta, 'expectedAppreciationPercentage')}
                  suffix="%"
                />
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => openActionModal(asset, 'ValuationReviewed', 'ValuationReviewed')}
                disabled={isValuationDone}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openActionModal(asset, 'ValuationRejected', 'ValuationRejected')}
                disabled={isValuationDone}
              >
                Reject
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="due-diligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Due Diligence Documents</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {documents
                  .filter(
                    (doc: any) =>
                      doc.documentType !== 'ASSET_IMAGE' && doc.documentType !== 'ASSET_VIDEO'
                  )
                  .map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between py-4 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {formatDocType(doc.documentType)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDocName(doc.documentName)}
                        </p>
                      </div>
                      {doc.url || doc.documentUrl ? (
                        <a
                          href={doc.url || doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground/60 italic font-normal">
                          Not Available
                        </span>
                      )}
                    </div>
                  ))}
                {documents.filter(
                  (doc: any) =>
                    doc.documentType !== 'ASSET_IMAGE' && doc.documentType !== 'ASSET_VIDEO'
                ).length === 0 && (
                  <p className="text-muted-foreground text-sm py-4">No documents uploaded</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => openActionModal(asset, 'DueDiligence', 'DueDiligence')}
                disabled={isDueDiligenceDone}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  openActionModal(asset, 'DueDiligenceRejected', 'DueDiligenceRejected')
                }
                disabled={isDueDiligenceDone}
              >
                Reject
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AssetStatusActionModal
        open={!!selectedRequest}
        onClose={closeModal}
        data={selectedRequest}
        action={actionType!}
        remark={remark}
        setRemark={setRemark}
        onConfirm={handleConfirm}
        loading={isUpdating}
      />
    </>
  );
}

function Info({
  label,
  value,
  suffix = '',
  isLink = false,
}: {
  label: string;
  value?: string | number | null;
  suffix?: string;
  isLink?: boolean;
}) {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== '';
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLink && hasValue ? (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline flex items-center gap-1 break-all"
        >
          {value} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="font-medium text-foreground">{hasValue ? `${value}${suffix}` : '—'}</p>
      )}
    </div>
  );
}

const formatDocType = (type: string) => {
  if (!type || String(type).trim() === '') return '—';
  if (type.toUpperCase() === 'EC') return 'Encumbrance Certificate';
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .toUpperCase();
};

const formatDocName = (name: string) => {
  if (!name || String(name).trim() === '') return '—';
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
