import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useGetAssetByIdQuery, useFinalizeListingMutation } from '@/store/api/assetsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { getMetaValue } from '@/utils/assetMeta';
import { BackButton } from '@/components/common/BackButton';
import { ExternalLink, MapPin } from 'lucide-react';
import { useHasPermission } from '@/hooks/redux';

export default function AssetDetailsPage() {
  // const { id } = useParams<{ id: string }>();
  // const assetId = Number(id);
  const { assetId } = useParams<{ assetId: string }>(); // new 5 update
  const id = Number(assetId); // new 5 update

  const {
    data: asset,
    isLoading,
    isError,
    // } = useGetAssetByIdQuery(assetId, {
    //   skip: !assetId,
    // });
    // from new 5 update
  } = useGetAssetByIdQuery(id, {
    skip: !id,
  });
  // from new 5 update

  const canFinalize = useHasPermission('asset.finalize');
  const [finalizeListing, { isLoading: isFinalizing }] = useFinalizeListingMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [listingAmount, setListingAmount] = useState<number | ''>('');

  if (isLoading) return <div className="p-6">Loading asset details…</div>;
  if (isError || !asset) return <div className="p-6 text-red-500">Failed to load asset</div>;

  const meta = asset.meta ?? [];
  const documents = asset.documents ?? [];
  const propertyInterest = asset.propertyInterest ?? [];

  const handleFinalizeApprove = async () => {
    try {
      await finalizeListing({
        assetId: id,
        status: 'Available',
        listingAmount: Number(listingAmount),
      }).unwrap();
      toast.success('Listing approved and finalized successfully!');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to finalize listing');
      console.error(err);
    }
  };

  return (
    <div className=" space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-10">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">{asset.assetTitle ?? '—'}</h1>
            <p className="text-muted-foreground">Owned by {asset.currentOwnerName ?? '—'}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {asset.isVerified && <Badge variant="default">Verified</Badge>}
          {asset.isSoldOut && <Badge variant="destructive">Sold Out</Badge>}

          {/* {(asset.status as string) === 'RequestLive' && canFinalize && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3 ml-2"
              onClick={() => {
                setListingAmount('');
                setModalOpen(true);
              }}
            >
              Live approve
            </Button>
          )} */}
        </div>
      </div>

      {/* BASIC INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Asset Type" value={asset.assetType} />
          <Info label="Asset Sub Type" value={getMetaValue(meta, 'assetSubType')} />
          <Info label="Ownership Model" value={asset.ownershipModel} />
          <Info label="Created At" value={formatDate(asset.createdAt)} />
        </CardContent>
      </Card>

      {/* LOCATION */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Info label="City" value={getMetaValue(meta, 'city')} />
          <Info label="State" value={getMetaValue(meta, 'state')} />
          <Info label="Country" value={getMetaValue(meta, 'country')} />
          <Info label="Pincode" value={getMetaValue(meta, 'pincode')} />
          <Info label="Geo Location" value={getMetaValue(meta, 'geoLocation')} />
          {(() => {
            const mapUrl = getMetaValue(meta, 'mapUrl');
            return mapUrl ? (
              <div className="flex items-center">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-500/50 bg-transparent px-4 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Google Location
                </a>
              </div>
            ) : (
              <Info label="Google Location" value="—" />
            );
          })()}
        </CardContent>
      </Card>

      {/* PROPERTY DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Info label="Built-up Area" value={getMetaValue(meta, 'builtupArea')} />
          <Info label="Land Area" value={getMetaValue(meta, 'landArea')} />
          <Info label="Year of Construction" value={getMetaValue(meta, 'yearOfConstruction')} />
          <Info label="Asset Age" value={getMetaValue(meta, 'assetAge')} />
          <Info label="Title Status" value={getMetaValue(meta, 'titleStatus')} />
          <Info label="Ownership Entity Type" value={getMetaValue(meta, 'ownershipEntityType')} />
          <Info label="Valuation Agency" value={getMetaValue(meta, 'valuationAgencyName')} />
          <Info label="Valuation Report Date" value={getMetaValue(meta, 'valuationReportDate')} />
          <Info label="Last Purchase Price" value={getMetaValue(meta, 'lastPurchasePrice')} />
        </CardContent>
      </Card>

      {/* FINANCIALS */}
      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Info label="Market Value" value={getMetaValue(meta, 'marketValue')} />
          <Info label="Rental Income (Monthly)" value={getMetaValue(meta, 'rentalIncomeMonthly')} />
          <Info label="Lease Rent / Month" value={getMetaValue(meta, 'leaseRentPerMonth')} />
          <Info
            label="Lease Tenure (Months)"
            value={getMetaValue(meta, 'leaseTenureRemainingMonths')}
          />
          <Info label="Last 3 Year Revenue" value={getMetaValue(meta, 'last3YearRevenue')} />
          <Info
            label="Annual Operational Expenses"
            value={getMetaValue(meta, 'operationalExpensesAnnual')}
          />
          <Info label="Net Operational Income" value={getMetaValue(meta, 'netOperationalIncome')} />
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

      {/* FRACTIONALIZATION DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Fractionalize Detail</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Info label="Total Fractions" value={asset.totalFractions} />
          <Info label="Sold Fractions" value={asset.soldFractions} />
          <Info label="Remaining Fractions" value={asset.remainingFractions} />
          <Info label="Initial Price Per Fraction" value={asset.price?.initialPricePerFraction} />
          <Info label="Current Price Per Fraction" value={asset.price?.currentPricePerFraction} />
        </CardContent>
      </Card>

      {/* DESCRIPTION */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 break-all">
          <p>{getMetaValue(meta, 'shortDescription') ?? '—'}</p>
          <Separator />
          <p className="text-muted-foreground break-all">
            {getMetaValue(meta, 'detailedDescription') ?? '—'}
          </p>
        </CardContent>
      </Card>

      {/* DOCUMENTS */}
      <Card>
        <CardContent className="space-y-3">
          {documents.length === 0 && <p className="text-muted-foreground">No documents uploaded</p>}
          <div>
            <CardHeader>
              <CardTitle>Asset Images</CardTitle>
            </CardHeader>
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
                    <img src={doc.url} alt="Document" className="h-48 w-full object-cover" />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ExternalLink className="text-white h-6 w-6" />
                    </div>
                  </a>
                ))}
            </div>
          </div>
          <div>
            <CardHeader>
              <CardTitle>Asset Videos</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents
                .filter((item) => item?.documentType === 'ASSET_VIDEO')
                .map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative border rounded-md overflow-hidden"
                  >
                    <video
                      src={doc.url}
                      className="h-48 w-full object-cover"
                      muted
                      playsInline
                      controls
                      preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ExternalLink className="text-white h-6 w-6" />
                    </div>
                  </a>
                ))}
            </div>
          </div>
          <div>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents
                .filter(
                  (item) =>
                    item?.documentType !== 'ASSET_IMAGE' && item?.documentType !== 'ASSET_VIDEO'
                )
                .map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative border rounded-md overflow-hidden"
                  >
                    {/* <img src={doc.url} alt="Document" className="h-48 w-full object-cover" /> */}
                    {doc.url?.toLowerCase().endsWith('.pdf') ? (
                      <div className="h-48 w-full flex flex-col items-center justify-center bg-[var(--inner-card)] gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-[var(--fg)]/50"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9.3 15.1c-.2.2-.5.3-1 .3H8v1.1H7v-3.5h1.3c.5 0 .8.1 1 .3.2.2.3.5.3.9s-.1.7-.3.9zm3.7.2c-.2.3-.5.5-.8.6-.2.1-.5.1-.9.1H10v-3.5h1.3c.4 0 .7.1.9.1.3.1.6.3.8.6.2.3.3.6.3 1s-.1.8-.3 1.1zm3.5-2.3h-1.8v.8h1.6v.7h-1.6v1.4H13v-3.5h3.5v.6z" />
                        </svg>
                        <span className="text-[var(--fg)]/60 text-sm font-medium">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <img src={doc.url} alt="Document" className="h-48 w-full object-cover" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ExternalLink className="text-white h-6 w-6" />
                    </div>

                    <div className="p-2 text-xs flex justify-between items-center bg-muted">
                      <span className="capitalize"> #{doc.documentType}</span>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WHY INVESTED / PROPERTY INTEREST */}
      <Card>
        <CardHeader>
          <CardTitle>Why Invest in this Property</CardTitle>
        </CardHeader>

        <CardContent>
          {propertyInterest.length === 0 ? (
            <p className="text-muted-foreground">No data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyInterest.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-4 border rounded-xl bg-muted/30">
                  {/* ICON */}
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-10 h-10 object-contain rounded-md bg-black p-1"
                  />

                  {/* TEXT */}
                  <div>
                    <h4 className="font-semibold text-base">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* POPUP MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md border border-input bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Property verification amount</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Listing Amount</label>
              <Input
                type="number"
                placeholder="0"
                value={listingAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setListingAmount(val === '' ? '' : Number(val));
                }}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalizeApprove}
              disabled={isFinalizing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Info({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value?: string | number | null;
  suffix?: string;
}) {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== '';
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{hasValue ? `${value}${suffix}` : '—'}</p>
    </div>
  );
}

function formatDate(date?: string) {
  return date ? new Date(date).toLocaleDateString() : '—';
}
