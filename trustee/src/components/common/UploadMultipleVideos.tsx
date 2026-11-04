import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Eye } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { FileViewerModal } from './FileViewerModal';

interface UploadMultipleVideosProps {
  label: string;
  value?: string[];
  maxFiles?: number;
  onChange: (urls: string[]) => void;
  required?: boolean;
}

const UploadMultipleVideos: React.FC<UploadMultipleVideosProps> = ({
  label,
  value = [],
  maxFiles = 5,
  onChange,
  required,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  const [uploadFile, { isLoading }] = useUploadFileMutation();

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadError(null);

    if (value.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} videos allowed`);
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
      setUploadError(err?.data?.message || 'Video upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  const handleView = (url: string) => {
    setViewingUrl(url);
  };

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
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        multiple
        hidden
        onChange={handleFileChange}
      />
      <div
        onClick={openFilePicker}
        className="flex flex-col items-center justify-center gap-2
                   border-2 border-dashed border-muted-foreground/40
                   rounded-lg p-6 cursor-pointer
                   hover:border-primary transition"
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Click to upload videos</p>
        <p className="text-xs text-muted-foreground">MP4, WEBM (max {maxFiles})</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Uploading videos...</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((url) => (
            <div key={url} className="relative group h-32">
              <video src={url} className="h-32 w-full object-cover rounded border bg-black" />

              <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6"
                  onClick={() => handleView(url)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6"
                  onClick={() => handleRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FileViewerModal open={!!viewingUrl} onClose={() => setViewingUrl(null)} url={viewingUrl} />
    </div>
  );
};

export default UploadMultipleVideos;
