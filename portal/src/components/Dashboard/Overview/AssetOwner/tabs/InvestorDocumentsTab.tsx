import { useEffect, useState, type JSX } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import CommonModal from '@/components/CommonModal';

function PreviewSpinner() {
  return (
    <span className="w-8 h-8 border-[3px] border-[#1F4FE0] border-t-transparent rounded-full animate-spin" />
  );
}

function StatusPill({ verified }: { verified: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        verified
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-[#F5A623]/10 text-[#F5A623]'
      }`}
    >
      {verified ? 'Verified' : 'Pending'}
    </span>
  );
}

interface EntityDocument {
  id: number;
  url: string;
  isVerified: boolean;
  uploadedAt: string;
  verifiedAt: string | null;
  remark: string | null;
  documentName: string;
  documentDeveloperName: string;
}

function getPreviewKind(url: string): 'image' | 'video' | 'pdf' | 'other' {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export default function InvestorDocumentsTab(): JSX.Element {
  const { user } = useSelector((state: RootState) => state.authLogin);
  const entityDocuments: EntityDocument[] = user?.entityDocument ?? [];
  const [previewDoc, setPreviewDoc] = useState<EntityDocument | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    setPreviewLoading(true);
  }, [previewDoc?.url]);

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Documents
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Documents submitted with your KYC.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
        {entityDocuments.length === 0 ? (
          <p className="py-6 text-center text-gray-400 font-12 md:font-14">
            No documents uploaded yet.
          </p>
        ) : (
          <table className="w-full text-left font-12">
            <thead>
              <tr className="text-[var(--fg)]/60 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
                <th className="py-2 pr-4 font-medium">Document</th>
                <th className="py-2 pr-4 font-medium">Uploaded</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entityDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                >
                  <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                    {doc.documentName}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                    {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusPill verified={doc.isVerified} />
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="text-[#1F4FE0] dark:text-[#60a5fa] font-medium cursor-pointer hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CommonModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.documentName}
        className="max-w-3xl"
        contentClassName="p-4"
      >
        {previewDoc &&
          (() => {
            const kind = getPreviewKind(previewDoc.url);
            if (kind === 'image') {
              return (
                <div className="relative min-h-[200px]">
                  {previewLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PreviewSpinner />
                    </div>
                  )}
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.documentName}
                    onLoad={() => setPreviewLoading(false)}
                    onError={() => setPreviewLoading(false)}
                    className={`w-full max-h-[75vh] object-contain rounded-lg transition-opacity duration-300 ${
                      previewLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>
              );
            }
            if (kind === 'video') {
              return (
                <div className="relative min-h-[200px]">
                  {previewLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PreviewSpinner />
                    </div>
                  )}
                  <video
                    src={previewDoc.url}
                    controls
                    onLoadedData={() => setPreviewLoading(false)}
                    onError={() => setPreviewLoading(false)}
                    className={`w-full max-h-[75vh] rounded-lg transition-opacity duration-300 ${
                      previewLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>
              );
            }
            if (kind === 'pdf') {
              return (
                <div className="relative min-h-[200px]">
                  {previewLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PreviewSpinner />
                    </div>
                  )}
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.documentName}
                    onLoad={() => setPreviewLoading(false)}
                    className={`w-full h-[75vh] rounded-lg border border-[#E3E7EE] dark:border-white/10 transition-opacity duration-300 ${
                      previewLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>
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
    </div>
  );
}
