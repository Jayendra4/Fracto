import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Eye } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface UploadMultipleImagesProps {
  label: string;
  value?: string[];
  maxFiles?: number;
  required?: boolean;
  onChange: (urls: string[]) => void;
}

const UploadMultipleImages: React.FC<UploadMultipleImagesProps> = ({
  label,
  value = [],
  maxFiles = 20,
  onChange,
  required,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [uploadFile, { isLoading }] = useUploadFileMutation();

  /* -------------------- Trigger input -------------------- */
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  /* -------------------- Upload -------------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadError(null);

    if (value.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} images allowed`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    try {
      const uploaded: string[] = [];

      for (const file of files) {
        const res = await uploadFile(file).unwrap();
        uploaded.push(res.url);
      }

      onChange([...value, ...uploaded]);
    } catch (err: any) {
      setUploadError(err?.data?.message || 'Image upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  /* -------------------- Remove -------------------- */
  const handleRemove = (url: string) => {
    onChange(value.filter((img) => img !== url));
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-3">
      <Label>
        {label}{' '}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}{' '}
        <span className="text-xs text-muted-foreground">
          ({value.length}/{maxFiles})
        </span>
      </Label>

      {uploadError && <ErrorBanner type="error" title="Upload Failed" message={uploadError} />}

      {/* HIDDEN INPUT */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        hidden
        onChange={handleFileChange}
      />

      {/* UPLOAD BOX */}
      <div
        onClick={openFilePicker}
        className="flex flex-col items-center justify-center gap-2
                   border-2 border-dashed border-muted-foreground/40
                   rounded-lg p-6 cursor-pointer
                   hover:border-primary transition"
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Click to upload images</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max {maxFiles})</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Uploading images...</p>}

      {/* PREVIEW */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {value.map((url) => (
            <div key={url} className="relative group">
              <img src={url} alt="Uploaded" className="h-24 w-full object-cover rounded border" />
              <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="default"
                  className="h-6 w-6"
                  onClick={() => setPreviewImage(url)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6"
                  onClick={() => handleRemove(url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <img src={previewImage!} alt="Preview" className="rounded-lg w-full" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadMultipleImages;
