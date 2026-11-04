import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Eye } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const MAX_FILE_SIZE_MB = 20;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_TYPES = [...IMAGE_TYPES];

interface UploadImageProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  setIsImageUploading: (value: boolean) => void;
  removeDoc?: () => void;
  required?: boolean;
}

const UploadImage: React.FC<UploadImageProps> = ({
  label,
  onChange,
  value,
  removeDoc,
  required,
  setIsImageUploading = () => {},
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [uploadFile, { isLoading }] = useUploadFileMutation();

  /* -------------------- SYNC VALUE -------------------- */
  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  /* -------------------- OPEN PICKER -------------------- */
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  /* -------------------- FILE CHANGE -------------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImageUploading?.(true);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only PNG and JPG images are allowed');
      inputRef.current!.value = '';
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      inputRef.current!.value = '';
      return;
    }

    try {
      const res = await uploadFile(file).unwrap();
      setPreview(res.url);
      onChange(res.url);
    } catch (err: any) {
      setUploadError(err?.data?.message || 'File upload failed');
      setPreview(null);
      onChange('');
    } finally {
      setIsImageUploading?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  /* -------------------- REMOVE -------------------- */
  const handleRemove = () => {
    setPreview(null);
    setUploadError(null);
    onChange('');
    removeDoc?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <Label required={required}>{label}</Label>}

      {uploadError && <ErrorBanner type="error" title="Upload Failed" message={uploadError} />}

      {/* HIDDEN INPUT */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        hidden
        onChange={handleFileChange}
      />

      {/* UPLOAD UI */}
      {!preview ? (
        <div
          onClick={openFilePicker}
          className="flex flex-col items-center justify-center gap-2
                     border-2 border-dashed border-muted-foreground/40
                     rounded-lg p-4 cursor-pointer
                     hover:border-primary transition"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Upload Image</p>
          <p className="text-xs text-muted-foreground">PNG, JPG (max {MAX_FILE_SIZE_MB}MB)</p>
        </div>
      ) : (
        <div className="relative w-40">
          <img src={preview} alt="Uploaded" className="rounded border w-full object-cover" />
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <Button
              type="button"
              size="icon"
              variant="default"
              className="h-6 w-6"
              onClick={() => setIsModalOpen(true)}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Uploading...</p>}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <img src={preview!} alt="Preview" className="rounded-lg w-full" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadImage;
