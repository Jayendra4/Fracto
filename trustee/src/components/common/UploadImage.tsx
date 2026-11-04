import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Eye, FileText } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { FileViewerModal } from './FileViewerModal';

const MAX_FILE_SIZE_MB = 20;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const PDF_TYPES = ['application/pdf'];
const ALL_TYPES = [...IMAGE_TYPES, ...PDF_TYPES];

interface UploadImageProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  setIsImageUploading: (value: boolean) => void;
  removeDoc?: () => void;
  required?: boolean;
  disabled?: boolean;
  accept?: string; 
}

const UploadImage: React.FC<UploadImageProps> = ({
  label,
  onChange,
  value,
  removeDoc,
  required,
  disabled = false,
  setIsImageUploading = () => {},
  accept, // ✅
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  const [uploadFile, { isLoading }] = useUploadFileMutation();

  // Determine allowed types based on accept prop
  const allowedTypes = accept
    ? accept.split(',').flatMap((type) => {
        const t = type.trim();
        if (t === 'image/*') return IMAGE_TYPES;
        if (t === 'application/pdf') return PDF_TYPES;
        return [t];
      })
    : IMAGE_TYPES;

  const acceptsPdf = allowedTypes.includes('application/pdf');

  useEffect(() => {
    if (value) {
      setPreview(value);
      setIsPdf(value.endsWith('.pdf') || value.includes('application/pdf'));
    }
  }, [value]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImageUploading?.(true);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        acceptsPdf
          ? 'Only PNG, JPG images and PDF files are allowed'
          : 'Only PNG and JPG images are allowed'
      );
      inputRef.current!.value = '';
      setIsImageUploading?.(false);
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      inputRef.current!.value = '';
      setIsImageUploading?.(false);
      return;
    }

    try {
      const res = await uploadFile(file).unwrap();
      setPreview(res.url);
      setIsPdf(file.type === 'application/pdf');
      onChange(res.url);
    } catch (err: any) {
      setUploadError(err?.data?.message || 'File upload failed');
      setPreview(null);
      setIsPdf(false);
      onChange('');
    } finally {
      setIsImageUploading?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setIsPdf(false);
    setUploadError(null);
    onChange('');
    removeDoc?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  // Build the accept string for the input element
  const inputAccept = accept ?? '.png,.jpg,.jpeg';

  return (
    <div className="space-y-2">
      {label && <Label required={required}>{label}</Label>}

      {uploadError && <ErrorBanner type="error" title="Upload Failed" message={uploadError} />}

      <input
        ref={inputRef}
        type="file"
        accept={inputAccept}
        hidden
        disabled={disabled}
        onChange={handleFileChange}
      />

      {!preview ? (
        <div
          onClick={!disabled ? openFilePicker : undefined}
          className={`flex flex-col items-center justify-center gap-2
            ${!disabled && 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary'}
            rounded-lg p-4 transition`}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {acceptsPdf ? 'Upload Image or PDF' : 'Upload Image'}
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptsPdf
              ? `PNG, JPG, PDF (max ${MAX_FILE_SIZE_MB}MB)`
              : `PNG, JPG (max ${MAX_FILE_SIZE_MB}MB)`}
          </p>
        </div>
      ) : isPdf ? (
        // PDF preview
        <div className="relative flex items-center gap-3 w-full max-w-xs border rounded-lg p-3 bg-muted/30 group">
          <FileText className="h-8 w-8 text-red-500 shrink-0" />
          <span className="text-sm text-muted-foreground truncate">PDF Document</span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-6 w-6"
              onClick={() => setViewingUrl(preview)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Image preview
        <div className="relative w-40 h-24 group">
          <img src={preview} alt="Uploaded" className="h-full w-full rounded border object-cover" />
          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-6 w-6"
              onClick={() => setViewingUrl(preview)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Uploading...</p>}

      <FileViewerModal open={!!viewingUrl} onClose={() => setViewingUrl(null)} url={viewingUrl} />
    </div>
  );
};

export default UploadImage;
