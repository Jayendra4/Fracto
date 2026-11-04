import { useRef } from 'react';
import FormRadio from '@/components/Form/FormRadio';
// import type { IFormRadioConfig } from '@/interface'; 
// import KycFileNameViewer from './KycDocUploadStep/KycFileNameViewer';
import type { UseFormWatch, Control } from 'react-hook-form';
import FileNameViewer from '../UploadFile/FileNameViewer';

interface BaseProps {
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  error?: string;
}

interface NormalFileUploadProps extends BaseProps {
  mode?: 'normal';
  file: File | null;
  onChange: (file: File | null) => void;
}
interface RadioFileUploadProps extends BaseProps {
  mode: 'radio';
  docId: string;
  options: { label: string; value: string }[];
  files: Record<string, File | null>;
  onChange: (docId: string, file: File | null) => void;
  watch: UseFormWatch<any>;
  control: Control<any>;
}

type FileUploadProps = NormalFileUploadProps | RadioFileUploadProps;

export default function FileUpload(props: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    label,
    description,
    required = false,
    accept = '*',
    maxSizeMB = 4,
    error,
  } = props;

  let derivedDocId: string | null = null;
  let file: File | null = null;
  let disabled = false;

  if (props.mode === 'radio') {
    const selectedValue = props.watch(props.docId);
    derivedDocId = selectedValue ? `${props.docId}_${selectedValue}` : null;
    file = derivedDocId ? (props.files[derivedDocId] ?? null) : null;
    disabled = !selectedValue;
  } else {
    file = props.file;
  }

const handleFileChange = (f: File | null) => {
  if (props.mode === 'radio') {
    if (!derivedDocId) return;

    if (!f || f.size > maxSizeMB * 1024 * 1024) {
      props.onChange(derivedDocId, null);
      return;
    }

    props.onChange(derivedDocId, f);
  } else {
    if (!f || f.size > maxSizeMB * 1024 * 1024) {
      props.onChange(null);
      return;
    }

    props.onChange(f);
  }
};

  return (
    <div className="mt-8 flex flex-col gap-4">
      {props.mode === 'radio' && (
        <FormRadio
          field={{
            name: props.docId,
            label,
            type: 'radio',
            options: props.options,
            validation: required ? { required: `${label} is required` } : {},
          }}
          control={props.control}
        />
      )}

      {props.mode !== 'radio' && (
        <>
          <label className="font-24 block mb-1 text-white">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <p className="font-16 text-white/40 mb-3">{description}</p>
        </>
      )}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          if (disabled) return;
          fileInputRef.current?.click();
        }}
        className={`
          flex flex-col items-center justify-center gap-3
          border border-dashed rounded-xl px-4 py-7 lg:py-10
          transition text-center
          ${
            disabled
              ? 'cursor-not-allowed opacity-60 border-white/20'
              : 'cursor-pointer border-white/20 hover:border-[#F5F5F5]'
          }
        `}
      >
        {!file && (
          <>
            <p className="font-16 text-white/50">
              Choose a File or Drag & Drop It Here
            </p>
            <p className="text-sm text-white/30">
              {accept.replaceAll('.', '').toUpperCase()} • Max {maxSizeMB}MB
            </p>
            <span className="px-4 py-1.5 lg:px-7 lg:py-3 rounded-md border border-white/20 font-16 text-white">
              Browse Files
            </span>
          </>
        )}

        {file && (
          <FileNameViewer
            file={file}
            onRemove={() => {
              handleFileChange(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
