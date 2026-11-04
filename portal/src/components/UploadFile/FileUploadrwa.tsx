import { useRef, useState } from 'react';
import FileNameViewer from './FileNameViewer';
import Tooltip from '../Common/Tooltip';
import { FiInfo } from 'react-icons/fi';

interface FileUploadProps {
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  file?: File | null;
  existingUrl?: string;
  error?: string;
  onChange: (file: File | null) => void;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  isUploading?: boolean;
}

export default function FileUpload({
  label,
  description,
  required = false,
  accept = '*',
  // maxSizeMB = 4,
  file,
  error,
  onChange,
  existingUrl,
  tooltip,
  toolTipContent,
  helpDesk,
  isUploading,
  maxSizeMB = 100,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const transformUrl = (url?: string) => {
    if (!url) return '';

    return url.replace('user/profile/', '');
  };
  let newUrl = '';

  if (existingUrl) {
    newUrl = transformUrl(existingUrl);
  }

  return (
    <div className="mt-8">
      <label className="flex items-center gap-2 font-24 mb-1 text-[var(--fg)]">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>

        {tooltip && (
          <Tooltip content={toolTipContent || ''}>
            <FiInfo className="text-gray-400 cursor-pointer" />
          </Tooltip>
        )}

        {helpDesk && (
          <span
            className="cursor-pointer shrink-0"
            title="Help"
            // onClick={() => window.open('/dashboard/rwa/vendors', '_blank')}
          >
            {/* <BiSupport size={20} /> */}
          </span>
        )}
      </label>
      {description && (
        <p className="font-16 text-[var(--fg)]/40 mb-3">{description}</p>
      )}

      <div
        // onClick={() => {
        //   if (!file && !existingUrl) fileInputRef.current?.click();
        // }}
        className="
          flex flex-col items-center justify-center gap-3
          border border-dashed border-gray-400
          rounded-xl px-4 py-7 lg:py-15
          hover:border-gray-500
          transition text-center
        "
      >
        {!file && !existingUrl && (
          <>
            <p className="font-16 text-[var(--fg)]/50">
              Choose a File or Drag & Drop It Here
            </p>
            {/* <p className="text-sm text-[var(--fg)]/30">
              {accept.replaceAll('.', '').toUpperCase()}
            </p> */}
            <p className="text-sm text-[var(--fg)]/30">
              {accept.replaceAll('.', '').toUpperCase()} • Max {maxSizeMB} MB
            </p>
            {isUploading ? (
              <span className="flex items-center text-[var(--fg)]/40  gap-2">
                {/* Loader */}
                <span className="w-5 h-5 border-2 border-[var(--fg)]/40 border-t-transparent rounded-full animate-spin"></span>
                Uploading...
              </span>
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation(); // prevent parent click conflicts
                  fileInputRef.current?.click();
                }}
                className="px-4 py-1.5 lg:px-7 lg:py-3 rounded-md border border-gray-400 font-16 text-[var(--fg)] cursor-pointer"
              >
                Browse Files
              </span>
            )}
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          hidden
          disabled={isUploading}
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            if (
              selectedFile &&
              maxSizeMB &&
              selectedFile.size > maxSizeMB * 1024 * 1024
            ) {
              if (fileInputRef.current) fileInputRef.current.value = '';
              onChange(null);
              setSizeError(`File size must be under ${maxSizeMB} MB`);
              return;
            }
            setSizeError(null);
            onChange(selectedFile);
          }}
        />
        {/* {error && (!file || !existingUrl) && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )} */}
        {(error || sizeError) && !file && !existingUrl && (
          <p className="mt-2 text-sm text-red-500">{sizeError || error}</p>
        )}

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

        {!file && existingUrl && (
          <FileNameViewer
            existingUrl={newUrl}
            name={existingUrl.split('/').pop()!}
            onRemove={() => {
              onChange(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
