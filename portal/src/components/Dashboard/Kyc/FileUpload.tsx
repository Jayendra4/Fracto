import { useRef } from 'react';
import FileNameViewer from './FileNameViewer';

interface FileUploadProps {
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

export default function FileUpload({
  label,
  description,
  required = false,
  accept = '*',
  maxSizeMB = 4,
  file,
  error,
  onChange,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (f: File | null) => {
    if (!f) return onChange(null);

    if (f.size > maxSizeMB * 1024 * 1024) {
      onChange(null);
      return;
    }

    onChange(f);
  };

  return (
    <div className="mt-8">
      <label className="font-new-20 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {description && (
        <p className="font-16 text-[var(--fg)]/50 mb-3">{description}</p>
      )}

      <label
        className="
          flex flex-col items-center justify-center gap-3
          border border-dashed border-[var(--fg)]/20
          rounded-xl px-4 py-7 lg:py-20
          cursor-pointer hover:border-[var(--fg)]
          transition text-center
        "
      >
        {!file && (
          <>
            <p className="font-16 text-[var(--fg)]/50">
              Choose a File or Drag & Drop It Here
            </p>
            <p className="text-sm text-[var(--fg)]/40">
              {accept.replaceAll('.', '').toUpperCase()} • Max {maxSizeMB}MB
            </p>
            <span className="px-4 py-1.5 lg:px-7 lg:py-3 rounded-md border border-[var(--fg)]/20 font-16 hover:border-[var(--fg)]/30 text-[var(--fg)]">
              Browse Files
            </span>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) =>
            handleFileChange(e.target.files?.[0] || null)
          }
        />

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {file && (
          <FileNameViewer
            file={file}
            onRemove={() => {
              onChange(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
        )}
      </label>
    </div>
  );
}
