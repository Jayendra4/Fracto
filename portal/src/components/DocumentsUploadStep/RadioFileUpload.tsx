/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useRef, useState } from 'react';
import FormRadio from '@/components/Form/FormRadio';
import type { IFormRadioConfig } from '@/interface';
import FileNameViewer from '../UploadFile/FileNameViewer';

interface RadioFileUploadProps {
  docId: string;
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
  files: Record<string, File | null>;
  filesMeta?: Record<string, { url?: string } | null>;
  error?: string;
  onChange: (docId: string, file: File | null) => void;
  watch: (name: string) => any;
  control: any;
  setValue: any;
  accept?: string;
  maxSizeMB?: number;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  isUploading?: boolean;
}

export default function RadioFileUpload({
  docId,
  label,
  required = false,
  options,
  files,
  error,
  onChange,
  filesMeta,
  watch,
  control,
  setValue,
  accept = '.jpg,.jpeg,.png,.pdf',
  maxSizeMB = 100,
  tooltip,
  toolTipContent,
  helpDesk,
  isUploading,
}: RadioFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedValue = watch(docId);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const derivedDocId = docId;
  const file = files[docId] ?? null;
  const existingUrl = filesMeta?.[docId]?.url;
  const radioField: IFormRadioConfig = {
    name: docId,
    label,
    type: 'radio',
    options,
    validation: required ? { required: `${label} is required` } : {},
  };

  const hasFile = Boolean(file || existingUrl);

  // const handleFileChange = (f: File | null) => {
  //   if (!derivedDocId) return;

  //   if (!f) {
  //     onChange(derivedDocId, null);
  //     return;
  //   }

  //   if (f.size > maxSizeMB * 1024 * 1024) {
  //     onChange(derivedDocId, null);
  //     return;
  //   }

  //   onChange(docId, f);
  // };

  const handleFileChange = (f: File | null) => {
    if (!derivedDocId) return;
    if (!f) {
      setSizeError(null);
      onChange(derivedDocId, null);
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`File size must be under ${maxSizeMB} MB`);
      onChange(derivedDocId, null);
      return;
    }
    setSizeError(null);
    onChange(docId, f);
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <FormRadio
        field={radioField}
        control={control}
        rules={radioField.validation}
        disabled={hasFile}
        tooltip={tooltip}
        toolTipContent={toolTipContent}
        helpDesk={helpDesk}
      />
      <div
        className={`
          flex flex-col items-center justify-center gap-3
          border border-dashed rounded-xl px-4 py-7 lg:py-10
          transition text-center
          ${
            selectedValue
              ? ' border-gray-400 hover:border-gray-500'
              : 'cursor-not-allowed hover:border-gray-300 opacity-60'
          }
        `}
      >
        {!file && !existingUrl && (
          <>
            <p className="font-16 text-[var(--fg)]/50">
              Choose a File or Drag & Drop It Here
            </p>
            <p className="text-sm text-[var(--fg)]/40">
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
                onClick={() => {
                  if (!selectedValue || hasFile) return;
                  fileInputRef.current?.click();
                }}
                className="px-4 py-1.5 lg:px-7 lg:py-3 rounded-md border cursor-pointer border-gray-400 font-16 text-[var(--fg)]"
              >
                Browse Files
              </span>
            )}
            {(error || sizeError) && (
              <p className="mt-2 text-sm text-red-500">{sizeError || error}</p>
            )}
          </>
        )}
        {file && (
          <FileNameViewer
            file={file}
            onRemove={() => {
              handleFileChange(null);
              setValue(docId, undefined);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
        )}

        {!file && existingUrl && (
          <FileNameViewer
            existingUrl={existingUrl}
            name={existingUrl.split('/').pop()!}
            onRemove={() => {
              handleFileChange(null);
              setValue(docId, undefined);
            }}
          />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        hidden
        disabled={!selectedValue || isUploading}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}
