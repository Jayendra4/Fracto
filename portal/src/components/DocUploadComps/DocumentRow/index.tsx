import { MdOutlineFileUpload } from 'react-icons/md';
import FormInput from '@/components/Form/FormInput';
import FormRadio from '@/components/Form/FormRadio';
import type { IFormInputConfig, IFormRadioConfig } from '@/interface';

interface DocumentRowProps {
  doc: any;
  control: any;
  hasFile: boolean;
  handleUploadClick?: (id: any) => void;
  handleViewClick?: (id: any) => void;
  secondaryIdField?: IFormRadioConfig;
  registeredAddressProofField?: IFormRadioConfig;
  shareholdingPatternField?: IFormInputConfig;
  files?: Record<string, any>;
  watch: (name: string) => any;
}

export default function DocumentRow({
  doc,
  control,
  hasFile,
  handleUploadClick,
  handleViewClick,
  shareholdingPatternField,
  files,
  watch,
}: DocumentRowProps) {
  if (doc.isTextField && shareholdingPatternField) {
    return (
      <div className="flex flex-col gap-2">
        <FormInput
          field={shareholdingPatternField}
          control={control}
          disabled={false}
          rules={shareholdingPatternField.validation}
        />
      </div>
    );
  }

  if (doc.type === 'radio-image') {
    const radioField: IFormRadioConfig = {
      name: doc.id,
      label: doc.label,
      type: 'radio',
      options: doc.options || [],
      validation: doc.required ? { required: `${doc.label} is required` } : {},
    };

    const selectedValue = watch(doc.id);

    const isUploaded = Boolean(files?.[doc.id]);

    return (
      <div className="flex flex-col gap-4">
        <FormRadio
          field={radioField}
          control={control}
          rules={radioField.validation}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!selectedValue}
            onClick={() => handleUploadClick?.(doc.id)}
            className={`px-[12px] md:px-[18px] py-2 md:py-4 rounded-md w-full sm:w-fit md:min-w-[200px] lg:min-w-[266px]
          flex items-center justify-center gap-2 border-[1.4px] font-19
          ${
            selectedValue
              ? 'bg-dark-black text-white'
              : 'bg-[#1A1A1A] text-[#555] cursor-not-allowed opacity-60'
          }
          ${isUploaded ? 'border-green' : 'border-inactive-gray'}`}
          >
            <MdOutlineFileUpload />
            {isUploaded ? 'Re-upload' : 'Upload'}
          </button>

          <button
            type="button"
            disabled={!isUploaded}
            onClick={() => handleUploadClick?.(doc.id)}
            className={`px-[12px] md:px-[18px] py-2 md:py-4 rounded-md w-full sm:w-fit md:min-w-[200px] lg:min-w-[266px]
          border-[1.4px] bg-dark-black font-19 border-inactive-gray
          ${
            isUploaded
              ? 'text-white'
              : 'text-dark-grey cursor-not-allowed opacity-60'
          }`}
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="font-20 font-medium text-white">
        {doc.label}
        {doc.helperText && (
          <span className="text-white/50 font-normal"> {doc.helperText}</span>
        )}
        {doc.required && <span className="text-red"> *</span>}
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleUploadClick?.(doc.id)}
          className={`px-[12px] md:px-[18px] py-2 md:py-4 rounded-md w-full sm:w-fit md:min-w-[200px] lg:min-w-[266px]
            cursor-pointer font-19 border-[1.4px] bg-dark-black text-white
            ${hasFile ? 'border-green' : 'border-inactive-gray'}`}
        >
          <div className="flex justify-center items-center gap-2">
            <MdOutlineFileUpload />
            {hasFile ? 'Re-upload' : 'Upload'}
          </div>
        </button>

        <button
          type="button"
          disabled={!hasFile}
          onClick={() => handleViewClick?.(doc.id)}
          className={`px-[12px] md:px-[18px] md:py-4 py-2 rounded-md w-full sm:w-fit md:min-w-[200px] xl:min-w-[266px] font-19 
            border-[1.4px] border-inactive-gray bg-dark-black
            ${
              hasFile
                ? 'text-white'
                : 'text-dark-grey cursor-not-allowed opacity-60'
            }`}
        >
          View
        </button>
      </div>
    </div>
  );
}
