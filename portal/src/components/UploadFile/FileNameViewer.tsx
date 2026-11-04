import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiFileText, FiX } from 'react-icons/fi';

interface Props {
  file?: File | null;
  existingUrl?: string;
  name?: string;
  onRemove: () => void;
}

export default function FileNameViewer({
  file,
  existingUrl,
  name,
  onRemove,
}: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const isExisting = Boolean(existingUrl);
  const previewUrl = isExisting ? existingUrl : fileUrl;
  const displayName = isExisting
    ? (name ?? 'Uploaded file')
    : (file?.name ?? 'Uploaded file');
  // const fileName = isExisting ? name : file?.name;

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file && !existingUrl) return null;

  const mimeType = file?.type;

  const extension = previewUrl?.split('?')[0]?.split('.')?.pop()?.toLowerCase();

  const isPdf = mimeType === 'application/pdf' || extension === 'pdf';

  // For existing URLs with no clear extension, default to image (KYC docs are typically images)
  const isImage =
    mimeType?.startsWith('image/') ||
    (extension ? ['jpg', 'jpeg', 'png', 'webp'].includes(extension) : false) ||
    (isExisting && !isPdf && !extension);

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full flex items-center justify-between gap-3
          border border-white/10 rounded-lg
          px-3 py-2 md:px-4 md:py-3
         bg-(--inner-card) min-w-[210px] max-w-[550px]
        "
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <FiFileText className="text-(--fg)/60 shrink-0 text-base md:text-lg" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="
              text-sm md:text-base
             text-[var(--fg)] hover:underline
              truncate text-left
              max-w-full
            "
            title={displayName}
          >
            {displayName}
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="
            p-1.5 md:p-2
            rounded-full
            text-[var(--fg)]/50 hover:text-red-400
            transition
            shrink-0
          "
          aria-label="Remove file"
        >
          <FiX className="text-base md:text-lg" />
        </button>
      </div>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center px-4"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          {previewUrl && isImage ? (
            <div
              className="max-w-3xl w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt={displayName}
                  className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl block"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="relative bg-[#0B1622] rounded-xl max-w-3xl w-full max-h-[90vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="absolute top-3 right-3 text-white/60 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
              <div className="mt-6">
                {previewUrl && isPdf && (
                  <iframe
                    src={previewUrl}
                    title={displayName}
                    className="w-full h-[75vh] rounded-lg bg-white"
                  />
                )}
                {!isPdf && (
                  <p className="text-white/70 text-center">
                    Preview not available for this file type
                  </p>
                )}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
