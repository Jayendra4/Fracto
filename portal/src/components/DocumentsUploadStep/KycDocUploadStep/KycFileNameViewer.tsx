import { useEffect, useState } from 'react';
import { FiFileText, FiX } from 'react-icons/fi';

interface Props {
  file: File | null;
  onRemove: () => void;
}

export default function FileNameViewer({ file, onRemove }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !fileUrl) return null;

  return (
    <div
      className="
        w-full flex items-center justify-between gap-3
        border border-white/10 rounded-lg
        px-3 py-2 md:px-4 md:py-3
        bg-black/30 min-w-[210px] max-w-[550px]
      "
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <FiFileText className="text-white/60 shrink-0 text-base md:text-lg" />

        <button
          type="button"
          onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
          className="
            text-sm md:text-base
            text-[#F5F5F5] hover:underline
            truncate text-left
            max-w-full
          "
          title={file.name}
        >
          {file.name}
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="
          p-1.5 md:p-2
          rounded-full
          text-white/50 hover:text-red-400
          transition
          shrink-0
        "
        aria-label="Remove file"
      >
        <FiX className="text-base md:text-lg" />
      </button>
    </div>
  );
}
