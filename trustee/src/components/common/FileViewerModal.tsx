import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

import { cn } from '@/utils';

interface FileViewerModalProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  fileType?: string | null;
  className?: string;
}

export function FileViewerModal({
  open,
  onClose,
  url,
  fileType: explicitType,
  className,
}: FileViewerModalProps) {
  if (!url) return null;

  const getFileTypeFromUrl = (fileUrl: string): string => {
    const extension = fileUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return 'image/generic';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video/generic';
    if (extension === 'pdf') return 'application/pdf';
    return 'other';
  };

  const fileType = explicitType || getFileTypeFromUrl(url);
  let content: React.ReactNode;

  if (fileType?.startsWith('image/')) {
    content = <img src={url} alt="Preview" className="max-w-full max-h-[80vh] mx-auto" />;
  } else if (fileType?.startsWith('video/')) {
    content = <video src={url} controls autoPlay className="max-w-full max-h-[80vh] mx-auto" />;
  } else if (fileType === 'application/pdf') {
    content = <iframe src={url} className="w-full h-[80vh]" title="PDF Preview" />;
  } else {
    content = (
      <div className="text-center p-8">
        <p>Cannot preview this file type.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Download File
        </a>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl w-full p-4", className)}>
        <DialogHeader>
          <div className="flex flex-row items-center justify-between">
            <DialogTitle>File Preview</DialogTitle>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-2">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
