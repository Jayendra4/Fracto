
import { useForm, type FieldValues } from 'react-hook-form';
import CustomButton from '@/components/Base/CustomButton';
import {
  DocumentRow,
  PreviewPanel,
  UploadedList,
} from '@/components/DocUploadComps';
import { useKycDocumentsUpload } from '@/hooks/useKycDocumentsUpload';
import { USER_KYC_DOCUMENTS } from '@/constants/UserKyc';
import { useEffect, useState, useRef, useMemo } from 'react';
import CameraCapture from '@/components/CameraCapture';

interface DocumentsUploadStepProps {
  onSubmit?: (payload: { documents: any[]; extra?: any }) => Promise<any>;
  onBack?: () => void;
  externalValues?: Record<string, any>;
  loading?: boolean;
}

export default function UserKycDocumentsUploadStep({
  onSubmit,
  onBack,
  externalValues = {},
}: DocumentsUploadStepProps) {
  const initialFilesMeta = useMemo(() => {
    try {
      const data = JSON.parse(localStorage.getItem('director_kyc_data') || '{}');
      return data.filesMeta || {};
    } catch {
      return {};
    }
  }, []);

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
  } = useKycDocumentsUpload(initialFilesMeta);

  useEffect(() => {
    if (filesMeta && Object.keys(filesMeta).length > 0) {
      try {
        const data = JSON.parse(localStorage.getItem('director_kyc_data') || '{}');
        data.filesMeta = filesMeta;
        localStorage.setItem('director_kyc_data', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to sync filesMeta to local storage', err);
      }
    }
  }, [filesMeta]);

  // Local State for Preview/Interaction (formerly in V1 hook)
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Derived error
  const currentFileError = activeDoc ? (localFileError || hookFileErrors[activeDoc] || null) : null;

  // Handlers mimicking V1 behavior but using V2 hook for data
  const handleUploadClick = (docId: string) => {
    setActiveDoc(docId);
    setLocalFileError(null);

    const existing = files[docId];
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

    // Basic validation (size/type) could go here if not in hook
    // For now, trusting the hook's validation on upload, or we can pre-validate

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLocalFileError(null);
    setTempFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmUpdate = async (_extra?: Record<string, any>) => {
    if (!activeDoc || !tempFile) return;

    try {
      setLocalFileError(null);
      // V2 hook handles the actual upload and state update
      await uploadFileToHook(activeDoc, tempFile);

      // Clear local temp state on success
      setTempFile(null);
      setPreviewUrl(null);
      // We keep activeDoc to show success or let user continue? 
      // V1 cleared it, but maybe better to keep modal open? 
      // V1: setTempFile(null), setPreviewUrl(null). 
      // Let's stick to V1 behavior of clearing temp but maybe keeping modal if we want.
      // Actually V1 handleUpdate didn't close modal, it just cleared tempFile.

      // If we seek to close the modal automatically:
      // setIsPreviewOpen(false); 
      // But V1 didn't enforce that in handleUpdate. 

    } catch (e: any) {
      setLocalFileError(e?.message || 'Upload failed');
    }
  };

  const handleLocalClearFile = () => {
    if (!activeDoc) return;
    clearFileFromHook(activeDoc);
    setTempFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalFileError(null);
  };

  // --------------------------------------------------------

  const nationality = externalValues?.nationality ?? null;

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

  const visibleDocs = USER_KYC_DOCUMENTS.filter((doc) => {
    if (!doc.externalConditionalShow) return true;

    const { key, value } = doc.externalConditionalShow;
    return externalValues?.[key] === value;
  });

  const areRequiredDocsUploaded = visibleDocs
    .filter((doc) => doc.required)
    .every((doc) => {
      // Logic from V1: check files or filesMeta
      if (doc.type === 'radio-image') {
        return Object.keys(files).some((k) => k.startsWith(doc.id));
      }
      return files[doc.id] || filesMeta[doc.id];
    });

  const canSubmit = isValid && areRequiredDocsUploaded;

  const onFinalSubmit = async () => {
    if (!onSubmit) return;

    await handleSubmitAll(onSubmit, {
      filesMeta,
    });
  };
  // const [openCamera, setOpenCamera] = useState(false); // Moved to local state above

  return (
    <div className="w-full font-work">
      {openCamera && (
        <CameraCapture
          onCapture={(file) => {
            handleLocalFileSelected(file);
            setOpenCamera(false);
          }}
          onClose={() => setOpenCamera(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full">
        <div className="lg:col-span-1 flex flex-col gap-8">
          {USER_KYC_DOCUMENTS.map((doc) => {
            if (doc.externalConditionalShow) {
              const { key, value } = doc.externalConditionalShow;

              if (key === 'nationality' && nationality !== value) {
                return null;
              }
            }

            return (
              <DocumentRow
                key={doc.id}
                doc={doc}
                control={control}
                files={files}
                hasFile={hasDocFile(doc.id)}
                handleUploadClick={(id) => {
                  handleUploadClick(id);
                  setIsPreviewOpen(true);
                }}
                handleViewClick={(id) => {
                  handleUploadClick(id);
                  setIsPreviewOpen(true);
                }}
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
              handleClearFile={handleLocalClearFile}
              handleChooseFileClick={() => fileInputRef.current?.click()}
              handleDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleLocalFileSelected(file);
              }}
              handleDragOver={(e) => e.preventDefault()}
              handleUpdate={handleConfirmUpdate}
              isUploading={isUploading}
            />

            <UploadedList
              filesMeta={filesMeta}
              documents={USER_KYC_DOCUMENTS}
              watch={watch}
              externalValues={externalValues}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 justify-between items-center gap-8 mt-10 p-6 md:p-10 rounded-xl border border-inactive-gray bg-dark-black">
        <div className="col-span-1 md:col-span-3 flex flex-col gap-8 h-full justify-between">
          <div className="flex flex-col w-full items-center">
            <h3 className="text-white font-44 leading-[56px] tracking-[-6%] font-medium">
              Selfie Photo (Live Capture)
            </h3>

            <p className="text-dark-grey font-16 font-medium leading-[20px] tracking-[0%] text-center max-w-[420px]">
              Selfie photo text. It only takes a few minutes...
            </p>
          </div>

          <div className="flex flex-col gap-6 text-dark-grey text-sm border border-inactive-gray p-10 rounded-[10px]">
            <h3 className="font-16 font-normal leading-[20px] tracking-[0%] text-white text-center">
              In order to improve the success rate of face recognition, please
              follow these requirements below!
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center justify-between h-full md:border-r md:pr-10">
                <img
                  src="/images/kyc/upright.svg"
                  alt="Upright"
                  className="w-15 h-15"
                />
                <p className="font-normal font-16 leading-[100%] tracking-[0%] text-white text-center">
                  Hold Phone Upright
                </p>
              </div>
              <div className="flex flex-col items-center justify-between h-full">
                <img
                  src="/images/kyc/well-lit.svg"
                  alt="Well Lit"
                  className="w-15 h-15"
                />
                <p className="font-normal font-16 leading-[100%] tracking-[0%] text-white text-center">
                  Well-Lit
                </p>
              </div>
              <div className="flex flex-col items-center justify-between h-full md:border-l md:pl-10">
                <img
                  src="/images/kyc/occluded.svg"
                  alt="Occluded"
                  className="w-15 h-15"
                />
                <p className="font-normal font-16 leading-[100%] tracking-[0%] text-white text-center">
                  Don’t Occlude Face
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-center border border-inactive-gray p-8 rounded-[10px]">
            <div
              onClick={() => setOpenCamera(true)}
              className="w-[300px] h-[270px] font-normal font-18 leading-[120%] tracking-[0%] bg-gradient-to-b from-[#112233] to-[#090E15] rounded-lg flex items-center justify-center text-[#7F9BB6] cursor-pointer"
            >
              <img src="/images/kyc/camera.svg" alt="Camera" />
              Click Here to Take Photo
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-end items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--fg)] font-medium cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent font-16 px-10 border border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition w-full sm:w-auto"
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
          Submit
        </CustomButton>
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="w-[92%] max-h-[90vh] bg-[#05070B] border border-inactive-gray rounded-xl overflow-hidden"
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
