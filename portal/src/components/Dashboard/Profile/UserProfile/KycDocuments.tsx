import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentPreviewModal from './DocumentPreviewModal';
import ImageWithFallback from '@/components/Common/ImageWithFallback';
import {
  DOCUMENT_TYPE_LABEL,
  normalizeFileUrl,
  type KycDocument,
} from '@/types/userDashboard';
import { FiFileText, FiArrowRight } from 'react-icons/fi';

interface Props {
  isDocumentUploaded: boolean;
  documents: KycDocument[];
}

export default function KycDocuments({ isDocumentUploaded, documents }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isDocumentUploaded || documents.length === 0) {
    return (
      <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-6 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
          <FiFileText className="text-blue-500 w-8 h-8 opacity-80" />
        </div>
        <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white mb-2">
          KYC Documents Pending
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-12 md:font-14 max-w-sm mb-6">
          Please complete your KYC verification process to securely upload and
          manage your essential documents.
        </p>
        <button
          onClick={() => navigate('/dashboard/kyc')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 font-12 font-semibold rounded-lg text-white bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Complete KYC
          <FiArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-6 relative z-10 text-left">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150 dark:border-white/5">
          <div>
            <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white">
              KYC Documents
            </h3>
            <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 mt-1">
              Manage your verification documents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {documents.map((doc: KycDocument) => {
            const fileUrl = normalizeFileUrl(doc.url);
            const documentLabel =
              (typeof doc.documentTypeId === 'number'
                ? DOCUMENT_TYPE_LABEL[doc.documentTypeId]
                : undefined) ||
              doc.documentName ||
              doc.documentDeveloperName ||
              (doc.documentTypeId
                ? `Document #${doc.documentTypeId}`
                : 'Uploaded Document');

            return (
              <button
                key={doc.id}
                onClick={() => setPreviewUrl(fileUrl)}
                className="group relative flex flex-col rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30 overflow-hidden text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <span
                  className={`absolute top-3 right-3 z-10 font-12 font-medium px-2.5 py-1 rounded-full border shadow-sm ${
                    doc.isVerified
                      ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {doc.isVerified ? 'Verified' : 'Pending Review'}
                </span>

                <div className="h-32 w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/5 relative">
                  <ImageWithFallback
                    src={fileUrl}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    fallbackText="Preview Unavailable"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <FiFileText className="text-white w-8 h-8 drop-shadow-lg" />
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <p className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white truncate w-full group-hover:text-blue-400 transition-colors">
                    {documentLabel}
                  </p>
                  <p className="font-12 text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                    <FiFileText size={12} /> Click to view
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {previewUrl && (
        <DocumentPreviewModal
          open
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}
