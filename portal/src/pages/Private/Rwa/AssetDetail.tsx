import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetByIdApi } from '@/api/rwa.api';
import {
  MdArrowBack,
  MdPictureAsPdf,
  MdPlayCircleOutline,
  MdVisibility,
} from 'react-icons/md';
import { RxCross1 } from 'react-icons/rx';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';

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
  const ext = url?.split('.').pop()?.toLowerCase();
  if (!ext) return 'unknown';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return 'image';
  if (['mp4', 'webm'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';

  return 'other';
};

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{
    url: string;
    type: 'image' | 'video' | 'pdf';
  } | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;
      try {
        const response = await getAssetByIdApi(id);
        if (response.success && response.data) {
          setAsset(response.data);
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <section className="font-work relative pb-20 min-h-screen px-4 lg:px-10 bg-[var(--bg)] pt-34 lg:pt-40">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader />
        </div>
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="font-work relative pb-20 min-h-screen px-4 lg:px-10 bg-[var(--bg)] pt-34 lg:pt-40">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--fg)]">
          <h2 className="text-2xl font-bold">Asset not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  const assetImages = asset.documents.filter(
    (d: AssetDocument) => d.documentType === 'ASSET_IMAGE'
  );

  const assetVideos = asset.documents.filter(
    (d: AssetDocument) => d.documentType === 'ASSET_VIDEO'
  );

  const propertyDocs = asset.documents.filter(
    (d: AssetDocument) =>
      !['ASSET_IMAGE', 'ASSET_VIDEO'].includes(d.documentType)
  );

  const statusColorMap: Record<string, string> = {
    Available: 'bg-green-500/15 text-green-400 border-green-500/30',
    Sold: 'bg-red-500/15 text-red-400 border-red-500/30',
    Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    Approved: 'bg-green-500/15 text-green-400 border-green-500/30',
    Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    Verified: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const StatusBadge = ({ value }: { value: string }) => {
    const color =
      statusColorMap[value] ??
      'bg-gray-500/15 text-gray-400 border-gray-500/30';
    return (
      <span
        className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold border ${color}`}
      >
        {value}
      </span>
    );
  };

  const renderInfoCard = (
    title: string,
    data: { label: string; value: any; badge?: boolean }[]
  ) => (
    <div className="bg-[var(--inner-card)] p-6 rounded-2xl border border-[var(--fg)]/5 shadow-sm">
      <h3 className="text-xs font-bold text-[#73B7FF] uppercase tracking-[0.2em] mb-6 pb-2 border-b border-[var(--fg)]/10">
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => {
          const isFullWidth = item.label.toLowerCase().includes('description');

          return (
            <div
              key={index}
              className={`flex flex-col gap-1.5 ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}
            >
              <span className="text-[11px] text-[var(--fg)]/40 uppercase tracking-wider font-bold">
                {item.label}
              </span>
              {item.badge ? (
                <StatusBadge value={item.value || 'N/A'} />
              ) : (
                <span className="text-base font-medium text-[var(--fg)] break-words">
                  {item.value || 'N/A'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  console.log(propertyDocs, 'propertyDocs 2222');

  return (
    <section className="font-work relative pb-20 min-h-screen px-4 lg:px-10 bg-[var(--bg)] pt-34 lg:pt-40">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[var(--fg)]/5 transition text-[var(--fg)]"
          >
            <MdArrowBack size={28} />
          </button>
          <div>
            <h2 className="font-medium font-30 text-[var(--fg)]">
              {asset.assetTitle}
            </h2>
            <p className="text-gray-500 font-medium font-16">
              Full specification and documentation of your asset
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {renderInfoCard('Basic Information', [
            { label: 'Asset Type', value: asset.assetType },
            { label: 'Current Owner', value: asset.currentOwnerName },
            { label: 'Asset Status', value: asset.status, badge: true },
            {
              label: 'Owner Approval',
              value: asset.ownerStatus ?? 'Pending',
              badge: true,
            },
            {
              label: 'Trustee Approval',
              value: asset.rwaRequest?.status ?? 'Pending',
              badge: true,
            },
            {
              label: 'Verification',
              value: asset.isVerified ? 'Verified' : 'Pending',
              badge: true,
            },
            {
              label: 'Submission Date',
              value: new Date(asset.createdAt).toLocaleDateString(),
            },
          ])}

          {asset.meta &&
            asset.meta.filter(
              (m: AssetMeta) =>
                m.metaKey !== 'shortDescription' &&
                m.metaKey !== 'detailedDescription'
            ).length > 0 &&
            renderInfoCard(
              'Technical & Financial Details',
              asset.meta
                .filter(
                  (m: AssetMeta) =>
                    m.metaKey !== 'shortDescription' &&
                    m.metaKey !== 'detailedDescription'
                )
                .map((m: AssetMeta) => ({
                  label: m.metaKey.replace(/([A-Z])/g, ' $1').trim(),
                  value: m.metaValue,
                }))
            )}

          {/* Short Description */}
          {(() => {
            const shortDesc = asset.meta?.find(
              (m: AssetMeta) => m.metaKey === 'shortDescription'
            )?.metaValue;
            if (!shortDesc) return null;
            return (
              <div className="bg-[var(--inner-card)] p-6 rounded-2xl border border-[var(--fg)]/5 shadow-sm">
                <h3 className="text-xs font-bold text-[#73B7FF] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[var(--fg)]/10">
                  Short Description
                </h3>
                <div className="text-base font-medium text-[var(--fg)] leading-relaxed">
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
              <div className="bg-[var(--inner-card)] p-6 rounded-2xl border border-[var(--fg)]/5 shadow-sm">
                <h3 className="text-xs font-bold text-[#73B7FF] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[var(--fg)]/10">
                  Detailed Description
                </h3>
                <div className="text-base font-medium text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                  {detailedDesc}
                </div>
              </div>
            );
          })()}

          <div className="bg-[var(--inner-card)] p-6 rounded-2xl border border-[var(--fg)]/5 shadow-sm">
            <h3 className="text-xs font-bold text-[#73B7FF] uppercase tracking-[0.2em] mb-6 pb-2 border-b border-[var(--fg)]/10">
              Documents & Media
            </h3>
            {[
              { title: 'Asset Images', items: assetImages },
              { title: 'Asset Videos', items: assetVideos },
              { title: 'Property Documents', items: propertyDocs },
            ].map(({ title, items }) => (
              <div key={title} className="space-y-4 mt-8">
                <h4 className="text-sm font-bold tracking-widest uppercase text-[#73B7FF]">
                  {title}
                </h4>

                {items.length === 0 ? (
                  <p className="text-sm text-[var(--fg)]/40">
                    No files available
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((doc: AssetDocument) => {
                      // const docUrl = `${import.meta.env.VITE_API_URL}/storage/${doc.documentUrl}`;
                      const docUrl = (doc?.documentUrl || '').startsWith('http')
                        ? doc?.documentUrl
                        : `${import.meta.env.VITE_API_URL}/storage/${doc.documentUrl}`;
                      const type = getFileType(doc.documentUrl);

                      return (
                        <div
                          key={doc.id}
                          onClick={() =>
                            setPreview({ url: docUrl, type: type as any })
                          }
                          className="cursor-pointer bg-[var(--fg)]/5 rounded-xl border border-[var(--fg)]/10 overflow-hidden hover:border-[#73B7FF]/50 transition"
                        >
                          <div className="relative aspect-video bg-black/30 overflow-hidden group">
                            {type === 'image' && (
                              <img
                                src={docUrl}
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
                                    url: docUrl,
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
                            <p className="text-xs font-bold truncate text-(--fg)">
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
      </div>

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
