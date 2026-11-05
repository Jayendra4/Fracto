import { useForm, type FieldValues } from 'react-hook-form';
import CustomButton from '@/components/Base/CustomButton';
import FormInput from '@/components/Form/FormInput';
import FormRadio from '@/components/Form/FormRadio';
import {
  DocumentRow,
  PreviewPanel,
  UploadedList,
} from '@/components/DocUploadComps';
import { DOCUMENTS } from '@/constants/kyb';
import type { IFieldConfig } from '@/interface';
import { useDocumentsUpload } from '@/hooks/useDocumentsUpload';
import { useEffect, useState, useRef } from 'react';
import type { DocumentId } from '@/interface';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

interface DocumentsUploadStepProps {
  onSubmit?: (payload: { documents: any[]; extra?: any }) => Promise<any>;
  onBack?: () => void;
  externalValues?: Record<string, any>;
}

export default function KybDocumentsUploadStep({
  onSubmit,
  onBack,
  externalValues = {},
}: DocumentsUploadStepProps) {
  // Use V2 Hook
  const {
    files,
    filesMeta,
    fileError: hookFileErrors,
    isUploading,
    handleFileSelected: uploadFileToHook,
    handleClearFile: clearFileFromHook,
    hasDocFile,
    handleSubmitAll,
  } = useDocumentsUpload();

  // Local State
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Derived error
  const currentFileError = activeDoc
    ? localFileError || hookFileErrors[activeDoc as DocumentId] || null
    : null;

  // Handlers
  const handleUploadClick = (docId: string) => {
    setActiveDoc(docId);
    setLocalFileError(null);

    const existing = files[docId as DocumentId];
    if (existing) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setTempFile(existing);
      setPreviewUrl(URL.createObjectURL(existing));
    } else {
      setTempFile(null);
      setPreviewUrl(null);
    }
  };

  const handleLocalFileSelected = (file: File) => {
    if (!activeDoc) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLocalFileError(null);
    setTempFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmUpdate = async (_extra?: Record<string, any>) => {
    if (!activeDoc || !tempFile) return;

    try {
      setLocalFileError(null);
      await uploadFileToHook(activeDoc as DocumentId, tempFile);

      setTempFile(null);
      setPreviewUrl(null);
    } catch (e: any) {
      setLocalFileError(e?.message || 'Upload failed');
    }
  };

  const handleLocalClearFile = () => {
    if (!activeDoc) return;
    clearFileFromHook(activeDoc as DocumentId);
    setTempFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalFileError(null);
  };

  // -------------------------------------------------------------

  const visibleDocuments = DOCUMENTS.filter((doc) => {
    if (doc.externalConditionalShow) {
      const actual = externalValues[doc.externalConditionalShow.key];
      return actual === doc.externalConditionalShow.value;
    }
    return true;
  });

  useEffect(() => {
    if (isPreviewOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      if (top) {
        window.scrollTo(0, parseInt(top || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPreviewOpen]);

  const {
    control,
    watch,
    formState: { isValid },
  } = useForm<FieldValues>({
    mode: 'onTouched',
  });

  const authorizeCompany = watch('authorizeCompany');
  const signatoryName = watch('signatoryName');

  const areRequiredDocsUploaded = DOCUMENTS.every((doc) => {
    if (doc.externalConditionalShow) {
      const val = externalValues[doc.externalConditionalShow.key];
      if (val !== doc.externalConditionalShow.value) return true;
    }

    let isRequired = doc.required;
    if (doc.externalConditionalRequired) {
      const val = externalValues[doc.externalConditionalRequired.key];
      isRequired = val === doc.externalConditionalRequired.value;
    }

    if (!isRequired || doc.isTextField) return true;

    return files[doc.id as DocumentId] || filesMeta[doc.id as DocumentId];
  });

  const canSubmit = isValid && areRequiredDocsUploaded;

  const authorizeCompanyField: IFieldConfig = {
    name: 'authorizeCompany',
    label: 'Authorizing Company to register on Fracto',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    validation: {
      required: 'Please select an option',
    },
  };

  const signatoryNameField: IFieldConfig = {
    name: 'signatoryName',
    label: 'Name of Authorized Signatory',
    placeholder: 'Enter Full Name',
    type: 'text',
    validation: {
      required: 'Signatory name is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only letters are allowed',
      },
      minLength: {
        value: 3,
        message: 'Name must be at least 3 characters',
      },
    },
  };

  const shareholdingPatternField: IFieldConfig = {
    name: 'shareholdingPattern',
    label: 'Shareholding Pattern',
    type: 'text',
    placeholder: 'Enter Shareholding Pattern',
    required: true,
    validation: {
      required: 'Shareholding pattern is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed',
      },
    },
  };

  const onFinalSubmit = async () => {
    if (!onSubmit) return;

    await handleSubmitAll(onSubmit, {
      authorizeCompany,
      signatoryName,
      filesMeta,
    });
  };

  return (
    <div className="w-full font-work">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full">
        <div className="lg:col-span-1 flex flex-col gap-8">
          {DOCUMENTS.filter((doc) => {
            if (doc.externalConditionalShow) {
              const actual = externalValues[doc.externalConditionalShow.key];
              if (actual !== doc.externalConditionalShow.value) return false;
            }
            return true;
          }).map((doc) => {
            return (
              <DocumentRow
                key={doc.id}
                doc={doc}
                control={control}
                hasFile={hasDocFile(doc.id as DocumentId)}
                files={files}
                handleUploadClick={(id) => {
                  handleUploadClick(id);
                  setIsPreviewOpen(true);
                }}
                handleViewClick={(id) => {
                  handleUploadClick(id);
                  setIsPreviewOpen(true);
                }}
                shareholdingPatternField={
                  doc.id === 'shareholdingPattern'
                    ? shareholdingPatternField
                    : undefined
                }
                watch={watch}
              />
            );
          })}
        </div>
        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-[100px] h-fit">
          <div className="border border-inactive-gray bg-[#05070B]/60 min-h-[500px] flex flex-col">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLocalFileSelected(file);
                e.target.value = '';
              }}
            />

            <PreviewPanel
              activeDoc={activeDoc}
              previewUrl={previewUrl}
              tempFile={tempFile}
              files={files}
              fileError={currentFileError}
              handleClearFile={() => {
                handleLocalClearFile();
                setIsPreviewOpen(false);
              }}
              handleChooseFileClick={() => fileInputRef.current?.click()}
              handleDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleLocalFileSelected(file);
              }}
              handleDragOver={(e) => e.preventDefault()}
              handleUpdate={() => {
                handleConfirmUpdate();
                setIsPreviewOpen(false);
              }}
              isUploading={isUploading}
            />

            <UploadedList
              filesMeta={filesMeta}
              documents={visibleDocuments}
              watch={watch}
              externalValues={externalValues}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:gap-6 mt-6 p-6 rounded-xl  bg-gradient-to-r from-[#041221] to-[#00060C]">
        <h3 className="text-white font-44 leading-[100%] tracking-[-6%] font-medium">
          Board Resolution (digi sign)
        </h3>

        <p className="text-dark-grey text-sm">
          Digi Sign, it only takes a few minutes...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <FormRadio
              field={authorizeCompanyField}
              control={control}
              disabled={false}
              rules={authorizeCompanyField.validation}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FormInput
              field={signatoryNameField}
              control={control}
              disabled={false}
              rules={signatoryNameField.validation}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-end items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--fg)] font-medium cursor-pointer flex items-center justify-center gap-2 py-2 rounded-xl bg-transparent font-16 px-8 border border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition w-full sm:w-auto"
          >
            Back
          </button>
        )}

        <CustomButton
          type="button"
          disabled={!canSubmit}
          onClick={canSubmit ? onFinalSubmit : undefined}
          variant="formButton"
          className="w-full sm:w-auto px-10"
        >
          Submit Documents
        </CustomButton>
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-[92%] max-h-[90vh] bg-[#05070B] border border-inactive-gray rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full
                   bg-black/70 text-white hover:bg-black transition"
              aria-label="Close preview"
            >
              ✕
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLocalFileSelected(file);
                e.target.value = ''; // keep same-file reupload working
              }}
            />

            <PreviewPanel
              activeDoc={activeDoc}
              previewUrl={previewUrl}
              tempFile={tempFile}
              files={files}
              fileError={currentFileError}
              handleClearFile={() => {
                handleLocalClearFile();
                setIsPreviewOpen(false);
              }}
              handleChooseFileClick={() => fileInputRef.current?.click()}
              handleDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleLocalFileSelected(file);
              }}
              handleDragOver={(e) => e.preventDefault()}
              handleUpdate={() => {
                handleConfirmUpdate();
                setIsPreviewOpen(false);
              }}
              isUploading={isUploading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
