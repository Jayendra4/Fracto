/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset handling, matches the pattern in rwa.api.ts */
import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetByIdApi } from '@/api/rwa.api';
import CommonModal from '@/components/CommonModal';
import Loader from '@/components/Loader';
import {
  // MdArrowBack,
  MdPlayCircleOutline,
  MdPictureAsPdf,
  MdVisibility,
} from 'react-icons/md';

const getPreviewKind = (
  url: string | null | undefined
): 'image' | 'video' | 'pdf' | 'other' => {
  if (!url) return 'other';
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return 'image';
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
};

interface BrokerAssetDetailProps {
  id: string;
}

export default function BrokerAssetDetail({
  id,
}: BrokerAssetDetailProps): JSX.Element {
  const navigate = useNavigate();
  const [fetchedAsset, setFetchedAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getAssetByIdApi(id);
        if (response.success && response.data) {
          setFetchedAsset(response.data);
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const getDocUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || ''}/storage/${url}`;
  };

  const stat = (label: string, value: any, isBadge = false) => (
    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      {isBadge ? (
        <div className="mt-1">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              value === 'Draft' || value === 'Pending'
                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                : value === 'Verified' ||
                    value === 'Approved' ||
                    value === 'Available'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}
          >
            {value || 'Pending'}
          </span>
        </div>
      ) : (
        <p className="font-12 md:font-14 font-semibold text-gray-800 dark:text-white mt-0.5 break-all">
          {value || '—'}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (!fetchedAsset) {
    return (
      <div className="py-16 text-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl">
        <p className="text-[var(--fg)]/60 text-base font-semibold">
          Asset details not found
        </p>
        <button
          onClick={() => navigate('/dashboard/my-assets')}
          className="mt-4 px-4 py-2 bg-[#1F4FE0] text-white rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const assetImages = (fetchedAsset.documents || []).filter(
    (d: any) => d.documentType === 'ASSET_IMAGE'
  );
  const assetVideos = (fetchedAsset.documents || []).filter(
    (d: any) => d.documentType === 'ASSET_VIDEO'
  );
  const propertyDocs = (fetchedAsset.documents || []).filter(
    (d: any) => !['ASSET_IMAGE', 'ASSET_VIDEO'].includes(d.documentType)
  );

  return (
    <section className="font-work relative pb-20 bg-transparent min-h-0">
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          {/* <button
            onClick={() => navigate('/dashboard/my-assets')}
            className="p-2 rounded-full hover:bg-[var(--fg)]/5 transition text-[var(--fg)]"
          >
            <MdArrowBack size={24} />
          </button> */}
          <div>
            <h2 className="font-medium font-24 text-[var(--fg)]">
              {fetchedAsset.assetTitle}
            </h2>
            <p className="text-[var(--fg)]/50 font-medium font-14">
              Full specification and documentation of your asset.
            </p>
          </div>
        </header>

        <div className="space-y-6 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl p-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stat('Asset Type', fetchedAsset.assetType)}
              {stat('Current Owner', fetchedAsset.currentOwnerName)}
              {stat('Asset Status', fetchedAsset.status, true)}
              {stat(
                'Owner Approval',
                fetchedAsset.ownerStatus ?? 'Pending',
                true
              )}
              {stat(
                'Trustee Approval',
                fetchedAsset.rwaRequest?.status ?? 'Pending',
                true
              )}
              {stat(
                'Verification',
                fetchedAsset.isVerified ? 'Verified' : 'Pending',
                true
              )}
              {stat(
                'Submission Date',
                new Date(fetchedAsset.createdAt).toLocaleDateString()
              )}
            </div>
          </div>

          {/* Technical & Financial Details */}
          {fetchedAsset.meta &&
            fetchedAsset.meta.filter(
              (m: any) =>
                m.metaKey !== 'shortDescription' &&
                m.metaKey !== 'detailedDescription'
            ).length > 0 && (
              <div>
                <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                  Technical & Financial Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fetchedAsset.meta
                    .filter(
                      (m: any) =>
                        m.metaKey !== 'shortDescription' &&
                        m.metaKey !== 'detailedDescription'
                    )
                    .map((m: any) =>
                      stat(
                        m.metaKey.replace(/([A-Z])/g, ' $1').trim(),
                        m.metaValue
                      )
                    )}
                </div>
              </div>
            )}

          {/* Short Description */}
          {(() => {
            const shortDesc = fetchedAsset.meta?.find(
              (m: any) => m.metaKey === 'shortDescription'
            )?.metaValue;
            if (!shortDesc) return null;
            return (
              <div>
                <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                  Short Description
                </h4>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-gray-800 dark:text-gray-300 font-12 md:font-14 leading-relaxed">
                  {shortDesc}
                </div>
              </div>
            );
          })()}

          {/* Detailed Description */}
          {(() => {
            const detailedDesc = fetchedAsset.meta?.find(
              (m: any) => m.metaKey === 'detailedDescription'
            )?.metaValue;
            if (!detailedDesc) return null;
            return (
              <div>
                <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                  Detailed Description
                </h4>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-gray-800 dark:text-gray-300 font-12 md:font-14 leading-relaxed whitespace-pre-wrap">
                  {detailedDesc}
                </div>
              </div>
            );
          })()}

          {/* Documents & Media */}
          <div>
            <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-4">
              Documents & Media
            </h4>

            {[
              { title: 'Asset Images', items: assetImages },
              { title: 'Asset Videos', items: assetVideos },
              { title: 'Property Documents', items: propertyDocs },
            ].map(({ title, items }) => (
              <div key={title} className="space-y-2 mt-4">
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-gray-400">
                  {title}
                </h5>

                {items.length === 0 ? (
                  <p className="text-xs text-[var(--fg)]/40 py-2">
                    No files available
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((doc: any) => {
                      const docUrl = getDocUrl(doc.documentUrl);
                      const type = getPreviewKind(doc.documentUrl);

                      return (
                        <div
                          key={doc.id}
                          onClick={() =>
                            setPreviewDoc({
                              name: doc.documentName,
                              url: docUrl,
                            })
                          }
                          className="cursor-pointer bg-[var(--fg)]/5 rounded-xl border border-[var(--fg)]/10 overflow-hidden hover:border-[#1F4FE0] dark:hover:border-blue-400 transition"
                        >
                          <div className="relative aspect-video bg-black/30 overflow-hidden group flex items-center justify-center">
                            {type === 'image' && (
                              <img
                                src={docUrl}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                alt={doc.documentName}
                              />
                            )}

                            {type === 'video' && (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                                <MdPlayCircleOutline size={40} />
                                <span className="text-xs font-bold tracking-wide">
                                  Video
                                </span>
                              </div>
                            )}

                            {type === 'pdf' && (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                                <MdPictureAsPdf size={40} />
                                <span className="text-xs font-bold tracking-wide">
                                  PDF
                                </span>
                              </div>
                            )}

                            {type === 'other' && (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                                <span className="text-xs font-bold tracking-wide uppercase">
                                  {doc.documentName.split('.').pop() ?? 'File'}
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc({
                                    name: doc.documentName,
                                    url: docUrl,
                                  });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition text-xs"
                              >
                                <MdVisibility size={14} />
                                View
                              </button>
                            </div>
                          </div>

                          <div className="p-3">
                            <p
                              className="text-xs font-bold truncate text-[var(--fg)]"
                              title={doc.documentName}
                            >
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

      <CommonModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name}
        className="max-w-3xl"
        contentClassName="p-4"
      >
        {previewDoc &&
          (() => {
            const kind = getPreviewKind(previewDoc.url);
            if (kind === 'image') {
              return (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="w-full max-h-[75vh] object-contain rounded-lg"
                />
              );
            }
            if (kind === 'video') {
              return (
                <video
                  src={previewDoc.url}
                  controls
                  className="w-full max-h-[75vh] rounded-lg"
                />
              );
            }
            if (kind === 'pdf') {
              return (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[75vh] rounded-lg border border-[#E3E7EE] dark:border-white/10"
                />
              );
            }
            return (
              <div className="text-center py-10 space-y-3">
                <p className="font-12 md:font-14 text-gray-500">
                  Preview isn&apos;t available for this file type.
                </p>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition"
                >
                  Open in New Tab
                </a>
              </div>
            );
          })()}
      </CommonModal>
    </section>
  );
}
