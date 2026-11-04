import { useRef, useState } from 'react';
import type { AssetFileItem, AssetFileType } from '@/interface';
import { createPreviewItem } from '@/utils/createPreviewItem';
import { AiOutlineUpload } from 'react-icons/ai';
import Tooltip from '@/components/Common/Tooltip';
import { FiInfo } from 'react-icons/fi';
// import { BiSupport } from 'react-icons/bi';

interface Props {
  label: string;
  helperText?: string;
  value: AssetFileItem[];
  onChange: (items: AssetFileItem[]) => void;
  accept: string;
  type: AssetFileType;
  maxFiles?: number;
  error?: string;
  rules?: {
    required?: boolean | string;
    validate?: (value: AssetFileItem[]) => boolean | string;
  };
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
}

export default function CustomUploadBase({
  label,
  helperText,
  value,
  onChange,
  accept,
  type,
  maxFiles,
  error,
  rules,
  tooltip,
  toolTipContent,
  helpDesk,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isAllowedFile = (file: File) => {
    // Some browsers/OS combos fail to detect MIME type for less common
    // formats (e.g. .webm), leaving file.type empty — fall back to extension.
    if (type === 'image') {
      return (
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp)$/i.test(file.name)
      );
    }
    return (
      file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/i.test(file.name)
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const allowed = maxFiles ? maxFiles - value.length : files.length;
    if (allowed <= 0) return;

    const validFiles = Array.from(files)
      .slice(0, allowed)
      .filter(isAllowedFile);

    const added: AssetFileItem[] = validFiles.map((file) => ({
      ...createPreviewItem(file, type),
      file,
      __isFile: true,
    }));

    const next = [...value, ...added];

    if (rules?.validate) {
      const result = rules.validate(next);
      if (
        typeof result === 'string' &&
        result.toLowerCase().includes('maximum')
      ) {
        return;
      }
    }

    onChange(next);
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  const reorder = (from: number, to: number) => {
    const arr = [...value];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onChange(arr);
  };

  const getUploadHint = (type: AssetFileType) => {
    switch (type) {
      case 'image':
        return 'JPEG, PNG formats, up to 4MB';
      case 'video':
        return 'MP4, MOV formats, up to 10MB';
      default:
        return '';
    }
  };

  return (
    <div className="flex  flex-col gap-4">
      <div className="flex md:flex-row flex-col justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full font-20 font-medium mb-2 text-[var(--fg)]">
          <span className="flex items-center gap-1">
            {label}
            {Boolean(rules?.required) && <span className="text-red">*</span>}
          </span>

          {tooltip && (
            <Tooltip content={toolTipContent || ''}>
              <FiInfo className="text-gray-400 cursor-pointer shrink-0" />
            </Tooltip>
          )}

          {helpDesk && (
            <span
              // onClick={() => window.open('/dashboard/rwa/vendors', '_blank')}
              className="cursor-pointer shrink-0"
              title="Help"
            >
              {/* <BiSupport size={20} /> */}
            </span>
          )}
        </div>
        <div className="flex gap-10">
          {helperText && <p className="font-16 text-[#5C6C7C]">{helperText}</p>}

          {maxFiles && (
            <p className="font-16 text-[#5C6C7C]">
              {value.length}/{maxFiles}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 space-y-6 lg:space-x-10 mt-3">
        <div className="grid col-span-1 h-52">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
              if (inputRef.current) {
                inputRef.current.value = '';
              }
            }}
            className={`cursor-pointer border border-dashed rounded-xl px-4 md:px-6 py-6 md:py-10 text-center transition ${
              isDragging ? 'border-blue-600 bg-white/5' : 'border-gray-600'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
            />

            <div className="flex flex-col items-center gap-2 text-gray-300">
              <div className="w-[60px] h-[60px] flex items-center justify-center rounded-xl text-2xl">
                <AiOutlineUpload className="text-[var(--fg)]" />
              </div>
              <span className="font-16 text-[#5C6C7C] ">
                Choose a file or drag & drop it here
              </span>
              <span className="font-12 text-[#2F3C4A]">
                {getUploadHint(type)}
              </span>
            </div>
          </label>
        </div>
        <div className="grid col-span-3 ">
          <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {value.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggingId) return;
                  reorder(
                    value.findIndex((i) => i.id === draggingId),
                    index
                  );
                  setDraggingId(null);
                }}
                className="relative group border border-gray-700 rounded-xl overflow-hidden h-52"
              >
                {type === 'image' ? (
                  <img
                    src={item.previewUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.previewUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                  />
                )}

                {item.file && (
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 bg-black/70 text-white h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : value.length > 0 && value.length < 5 && type === 'image' ? (
        <p className="text-xs text-red-500">Please Select Atleast 5 Image</p>
      ) : null}
    </div>
  );
}
