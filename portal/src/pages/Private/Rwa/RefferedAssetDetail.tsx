/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset handling, matches the pattern in rwa.api.ts */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAssetByBrokerApi,
  UpdateAssetApi,
  type IUpdateAssetPayload,
} from '@/api/rwa.api';
import {
  // MdArrowBack,
  MdPictureAsPdf,
  MdPlayCircleOutline,
  MdVisibility,
} from 'react-icons/md';
import { RxCross1 } from 'react-icons/rx';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';
import StatusModal from '@/components/Modals/Status';

interface AssetMeta {
  id: number;
  metaKey: string;
  metaValue: string;
}

interface AssetDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
}

const getFileType = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';

  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';

  return 'other';
};

export default function ReferredAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<any | null>(null);
  const [assetId, setAssetId] = useState<number | null>(null);
  const [ownerStatus, setOwnerStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    message: string;
    actionTaken?: 'Approved' | 'Rejected';
  }>({ open: false, status: 'success', title: '', message: '' });

  const [preview, setPreview] = useState<{
    url: string;
    type: 'image' | 'video' | 'pdf';
  } | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        const res = await getAssetByBrokerApi({
          skip: 0,
          take: 100,
        });

        if (res.success && res.data) {
          const item = res.data.data?.find(
            (x: any) => x.assetId === Number(id)
          );

          if (item) {
            setAsset(item.asset);
            setAssetId(item.assetId);
            setOwnerStatus(item.assetOwnerStatus ?? '');
          } else {
            setAsset(null);
          }
        } else {
          setAsset(null);
        }
      } catch (err) {
        console.error(err);
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!assetId) return;

    try {
      setActionLoading(true);

      const payload: IUpdateAssetPayload = {
        assetId,
        status,
      };

      const res = await UpdateAssetApi(payload);

      if (res.success) {
        setAsset((prev: any) => ({ ...prev, status }));
        setOwnerStatus(status);
        setStatusModal({
          open: true,
          status: 'success',
          title: `Asset ${status}`,
          message: `The asset has been ${status.toLowerCase()} successfully.`,
          actionTaken: status,
        });
      } else {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Action Failed',
          message: res.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (err) {
      console.error(err);
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Action Failed',
        message: 'Failed to update asset. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex justify-center items-center">
        <Loader />
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold">Asset not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 border">
          Go Back
        </button>
      </section>
    );
  }

  const assetImages =
    asset.documents?.filter(
      (d: AssetDocument) => d.documentType === 'ASSET_IMAGE'
    ) || [];

  const assetVideos =
    asset.documents?.filter(
      (d: AssetDocument) => d.documentType === 'ASSET_VIDEO'
    ) || [];

  const propertyDocs =
    asset.documents?.filter(
      (d: AssetDocument) =>
        !['ASSET_IMAGE', 'ASSET_VIDEO'].includes(d.documentType)
    ) || [];

  // ✅ INFO CARD
  const renderInfoCard = (
    title: string,
    data: { label: string; value: any }[]
  ) => (
    <div className="bg-white dark:bg-[#132436] p-3 sm:p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
      <h3 className="text-xs capitalize font-bold text-[#4F46E5] dark:text-[#73B7FF]  tracking-[0.2em] mb-5 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
        {title}
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1 ${
              item.label === 'DETAILED DESCRIPTION' ? 'md:col-span-3' : ''
            }`}
            // className="flex flex-col gap-1"
          >
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">
              {item.label}
            </span>
            <span className="text-base text-[#0B2545] dark:text-white">
              {typeof item.value === 'object' &&
              item.value !== null &&
              'lat' in item.value
                ? `${item.value.lat}, ${item.value.lng}`
                : item.value || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="font-work relative pb-20 min-h-screen  bg-[#F4F6F9] dark:bg-[#0B0B0B] pt-34 lg:pt-40">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-50 dark:bg-white/5 transition text-[#0B2545] dark:text-white"
          >
            <MdArrowBack size={28} />
          </button> */}
          <div className="pagehead">
            <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
              {asset.assetTitle}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
              Referred Asset Details
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {renderInfoCard('Basic Information', [
            { label: 'Asset Type', value: asset.assetType },
            { label: 'Owner', value: asset.currentOwnerName },
            { label: 'Status', value: asset.status },
            {
              label: 'Verification',
              value: asset.isVerified ? 'Verified' : 'Pending',
            },
          ])}

          {/* META */}
          {asset.meta?.filter(
            (m: AssetMeta) =>
              m.metaKey !== 'shortDescription' &&
              m.metaKey !== 'detailedDescription' &&
              m.metaKey !== 'ownershipEntityType'
          ).length > 0 &&
            renderInfoCard(
              'Technical Details',
              asset.meta
                .filter(
                  (m: AssetMeta) =>
                    m.metaKey !== 'shortDescription' &&
                    m.metaKey !== 'detailedDescription'
                )
                .map((m: AssetMeta) => {
                  let value: any = m.metaValue;

                  if (
                    m.metaKey.toLowerCase() === 'geolocation' &&
                    m.metaValue
                  ) {
                    const [lat, lng] = m.metaValue.split(',');

                    value = {
                      lat: Number(lat),
                      lng: Number(lng),
                    };
                  }

                  const formattedLabelMap: Record<string, string> = {
                    assetSubType: 'ASSET SUBTYPE',
                    assetAge: 'ASSET AGE',
                    detailedDescription: 'DETAILED DESCRIPTION',
                    shortDescription: 'SHORT DESCRIPTION',
                    titleStatus: 'Title Status',
                    polygonPath: 'polygon Path',
                    leaseTenureRemainingMonths: 'lease Tenure Remaining Months',
                    geoLocation: 'geo Location',
                    expectedYieldPercentage: 'expected Yield %',
                    expectedAppreciationPercentage: 'expected Appreciation %',
                    extraMarkers: 'extra Markers',
                    rentalIncomeMonthly: 'rental Income Monthly',
                    valuationReportDate: 'valuation Report Date',
                    yearOfConstruction: 'year Of Construction',
                    valuationAgencyName: 'valuation Agency Name',
                    last3YearRevenue: 'last 3Year Revenue',
                    marketValue: 'market Value',
                    netOperationalIncome: 'net Operational Income',
                    landArea: 'land Area',
                    // ownershipEntityType: 'ownership Entity Type',
                  };

                  return {
                    label: formattedLabelMap[m.metaKey] || m.metaKey,
                    value,
                  };
                })
            )}

          {/* Short Description */}
          {(() => {
            const shortDesc = asset.meta?.find(
              (m: AssetMeta) => m.metaKey === 'shortDescription'
            )?.metaValue;
            if (!shortDesc) return null;
            return (
              <div className="bg-white dark:bg-[#132436] p-3 sm:p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
                <h3 className="text-xs capitalize font-bold text-[#4F46E5] dark:text-[#73B7FF] tracking-[0.2em] mb-4 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
                  Short Description
                </h3>
                <div className="text-base text-[#0B2545] dark:text-white leading-relaxed">
                  {shortDesc}
                </div>
              </div>
            );
          })()}

          {/* Detailed Description */}
          {(() => {
            const detailedDesc = asset.meta?.find(
              (m: AssetMeta) => m.metaKey === 'detailedDescription'
            )?.metaValue;
            if (!detailedDesc) return null;
            return (
              <div className="bg-white dark:bg-[#132436] p-3 sm:p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
                <h3 className="text-xs capitalize font-bold text-[#4F46E5] dark:text-[#73B7FF] tracking-[0.2em] mb-4 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
                  Detailed Description
                </h3>
                <div className="text-base text-[#0B2545] dark:text-white leading-relaxed whitespace-pre-wrap">
                  {detailedDesc}
                </div>
              </div>
            );
          })()}

          {/* DOCUMENTS */}
          <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
            <h3 className="text-xs font-bold text-[#4F46E5] dark:text-[#73B7FF] uppercase tracking-[0.2em] mb-5 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
              Documents & Media
            </h3>
            {[
              { title: 'Asset Images', items: assetImages },
              { title: 'Asset Videos', items: assetVideos },
              { title: 'Property Documents', items: propertyDocs },
            ].map(({ title, items }) => (
              <div key={title} className="space-y-4 mt-8">
                <h4 className="text-sm font-bold tracking-widest uppercase text-[#4F46E5] dark:text-[#73B7FF]">
                  {title}
                </h4>

                {items.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No files available
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((doc: AssetDocument) => {
                      const url = doc.documentUrl?.startsWith('http')
                        ? doc.documentUrl
                        : `${import.meta.env.VITE_API_URL}/storage/${doc.documentUrl}`;
                      const type = getFileType(doc.documentUrl);

                      return (
                        <div
                          key={doc.id}
                          className="cursor-pointer bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E3E7EE] dark:border-white/10 overflow-hidden hover:border-[#73B7FF]/50 transition"
                          onClick={() => setPreview({ url, type: type as any })}
                        >
                          <div className="relative aspect-video bg-black/30 overflow-hidden group">
                            {type === 'image' && (
                              <img
                                src={url}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                alt={doc.documentName}
                              />
                            )}

                            {type === 'video' && (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                                <MdPlayCircleOutline size={48} />
                                <span className="text-sm font-bold tracking-wide">
                                  Video
                                </span>
                              </div>
                            )}

                            {type === 'pdf' && (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                                <MdPictureAsPdf size={48} />
                                <span className="text-sm font-bold tracking-wide">
                                  PDF
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreview({
                                    url: url,
                                    type: type as any,
                                  });
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition"
                              >
                                <MdVisibility size={18} />
                                View
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-bold truncate text-[#0B2545] dark:text-white">
                              {doc.documentName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          {ownerStatus !== 'Approved' && ownerStatus !== 'Rejected' ? (
            <>
              <button
                onClick={() => handleAction('Approved')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-lg font-12 font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-lg font-12 font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </>
          ) : (
            <span
              className={`px-3 py-1.5 rounded-full font-11 font-bold uppercase tracking-wide ${
                ownerStatus === 'Approved'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {ownerStatus}
            </span>
          )}
        </div>
      </div>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((s) => ({ ...s, open: false }))}
        onContinue={() => {
          setStatusModal((s) => ({ ...s, open: false }));
          if (statusModal.status === 'success') {
            navigate('/dashboard/rwa/referred-assets');
          }
        }}
      />

      {/* PREVIEW */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white"
            >
              <RxCross1 size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl w-full max-h-[85vh] flex items-center justify-center"
            >
              {preview.type === 'image' && (
                <img
                  src={preview.url}
                  className="max-w-full max-h-full mx-auto rounded-lg object-contain"
                  alt="Preview"
                />
              )}

              {preview.type === 'video' && (
                <video
                  src={preview.url}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] rounded-lg"
                />
              )}

              {preview.type === 'pdf' && (
                <iframe
                  src={preview.url}
                  className="w-full h-[80vh] rounded-lg bg-white"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
