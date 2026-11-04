import { useState } from 'react';
import { ExternalLink, FileText, ImageOff } from 'lucide-react';

interface DocCardProps {
  url: string;
  label?: string;
}

/**
 * Renders a document thumbnail card.
 * - Shows a loading skeleton while the image loads
 * - Shows a PDF placeholder for PDF files
 * - Shows a fallback icon if the image fails to load
 * - Clicking opens the URL in a new tab
 */
export function DocCard({ url, label }: DocCardProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const isPdf =
    url?.toLowerCase().includes('.pdf') ||
    url?.toLowerCase().includes('pdf');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition"
    >
      {/* Thumbnail area */}
      <div className="relative h-48 w-full bg-muted flex items-center justify-center">
        {isPdf ? (
          /* PDF placeholder */
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <span className="text-xs font-medium">PDF Document</span>
            <span className="text-xs">Click to open</span>
          </div>
        ) : (
          <>
            {/* Loading skeleton — visible until image loads or errors */}
            {status === 'loading' && (
              <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
            )}

            {/* Error state */}
            {status === 'error' && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">Preview unavailable</span>
                <span className="text-xs text-primary underline">Click to open</span>
              </div>
            )}

            {/* Actual image — hidden until loaded */}
            <img
              src={url}
              alt={label ?? 'Document'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                status === 'loaded' ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
            />
          </>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <ExternalLink className="text-white h-6 w-6" />
        </div>
      </div>

      {/* Label bar */}
      {label && (
        <div className="px-2 py-1.5 text-xs font-medium bg-muted border-t truncate">
          {label}
        </div>
      )}
    </a>
  );
}
