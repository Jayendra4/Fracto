/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useForm, type FieldValues } from 'react-hook-form';
import CustomButton from '@/components/Base/CustomButton';
import { KYC_DOCUMENTS } from '@/constants/kyc';
import { useEffect, useMemo, useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import RadioFileUpload from '../RadioFileUpload';

import { useDirectorKycDocumentsUpload } from '@/hooks/useDirectorKycDocumentsUpload';
import FileUpload from '@/components/UploadFile/FileUploadrwa';
import FileNameViewer from '@/components/UploadFile/FileNameViewer';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

type DirectorDocument = {
  id: number;
  documentTypeId: number;
  companyId: number | null;
  directorId: number | null;
  accountId: number | null;
  url: string | null;
  documentIdentifier: string;
  isVerified: boolean;
  remark: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
};

interface DocumentsUploadStepProps {
  onSubmit?: (payload: { documents: any[]; extra?: any }) => Promise<any>;
  onBack?: () => void;
  externalValues?: Record<string, any>;
  directorDocs?: DirectorDocument[];
}

export default function KycDocUploadStep({
  onSubmit,
  onBack,
  externalValues = {},
  directorDocs = [],
}: DocumentsUploadStepProps) {
  const initialFilesMeta = useMemo(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem('director_kyc_data') || '{}'
      );
      return data.filesMeta || {};
    } catch {
      return {};
    }
  }, []);

  const {
    files,
    filesMeta,
    fileError,
    // tempFile,
    // previewUrl,
    // activeDoc,
    // fileInputRef,
    // handleUploadClick,
    handleFileSelected,
    // handleUpdate,
    handleClearFile,
    // handleChooseFileClick,
    // handleDrop,
    // handleDragOver,
    hasDocFile,
    handleSubmitAll,
    hydrateFromMeta,
    uploadingDocId,
  } = useDirectorKycDocumentsUpload(initialFilesMeta);

  useEffect(() => {
    if (!directorDocs || directorDocs.length === 0) return;

    hydrateFromMeta(
      directorDocs.map((doc) => ({
        documentIdentifier: doc.documentIdentifier,
        url: doc.url,
      })),
      KYC_DOCUMENTS.map((d) => ({
        id: d.id,
        documentType: d.id, // ✅ IMPORTANT
      }))
    );
  }, [directorDocs]);

  useEffect(() => {
    if (filesMeta && Object.keys(filesMeta).length > 0) {
      try {
        const data = JSON.parse(
          localStorage.getItem('director_kyc_data') || '{}'
        );
        data.filesMeta = filesMeta;
        localStorage.setItem('director_kyc_data', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to sync filesMeta to local storage', err);
      }
    }
  }, [filesMeta]);

  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const { control, watch, setValue } = useForm<FieldValues>({
    mode: 'onTouched',
  });
  const [openCamera, setOpenCamera] = useState(false);
  const [cameraDocId, setCameraDocId] = useState<string | null>(null);

  const visibleKycDocuments = KYC_DOCUMENTS.filter((doc) => {
    if ((doc as any).externalConditionalShow) {
      const cfg = (doc as any).externalConditionalShow;
      const actual = externalValues?.[cfg.key];
      return actual === cfg.value;
    }
    return true;
  });

  const areRequiredDocsUploaded = visibleKycDocuments.every((doc) => {
    if (!doc.required || doc.isTextField) return true;

    // if (doc.type === 'radio-image') {
    //   const selected = watch(doc.id);
    //   if (!selected) return false;

    //   const derivedKey = doc.id;
    //   return Boolean(files[derivedKey] || filesMeta[derivedKey]);
    // }

    if (doc.type === 'radio-image') {
      const selected = watch(doc.id);
      const hasExisting = Boolean(files[doc.id] || filesMeta[doc.id]);

      // ✅ existing doc hai → valid
      if (hasExisting) return true;

      // ❌ new case → radio required
      if (!selected) return false;

      return true;
    }

    return Boolean(files[doc.id] || filesMeta[doc.id]);
  });

  const isSelfieUploaded = Boolean(
    files['selfie_photo'] || filesMeta['selfie_photo']
  );
  // const canSubmit = isValid && areRequiredDocsUploaded && isSelfieUploaded;
  const canSubmit = areRequiredDocsUploaded && isSelfieUploaded;

  const onFinalSubmit = async () => {
    if (!onSubmit) return;

    await handleSubmitAll(onSubmit, {
      filesMeta,
    });
  };

  return (
    <div className="w-full font-work">
      <div className="grid grid-cols-1  gap-8 w-full p-4 md:p-6 bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)]rounded-2xl">
        {visibleKycDocuments.map((doc) =>
          doc.type === 'radio-image' ? (
            <RadioFileUpload
              key={doc.id}
              docId={doc.id}
              label={doc.label}
              required={doc.required}
              options={doc.options!}
              files={files}
              watch={watch}
              control={control}
              setValue={setValue}
              filesMeta={filesMeta}
              isUploading={uploadingDocId === doc.id}
              maxSizeMB={100}
              // error={fileError ?? undefined}
              onChange={(derivedId, file) => {
                if (!file) {
                  handleClearFile(derivedId, doc.required);
                } else {
                  handleFileSelected(derivedId, file);
                }
              }}
            />
          ) : (
            <FileUpload
              key={doc.id}
              label={doc.label}
              description={doc.description}
              required={doc.required}
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={100}
              file={files[doc.id] ?? null}
              error={fileError?.[doc.id]}
              isUploading={uploadingDocId === doc.id}
              existingUrl={filesMeta?.[doc.id]?.url}
              onChange={(file) => {
                if (!file) {
                  handleClearFile(doc.id, doc.required);
                } else {
                  handleFileSelected(doc.id, file);
                }
              }}
            />
          )
        )}
      </div>

      <div className="grid grid-cols-1 justify-between items-center gap-8 mt-10 p-6 md:p-10 bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] rounded-xl">
        <div className="col-span-1  flex flex-col gap-8 h-full justify-between">
          <div className="flex flex-col w-full">
            <h3 className="text-[var(--fg)] font-34  font-medium">
              Selfie Photo (Live Capture){' '}
              <span className="text-red-500">*</span>
            </h3>

            <p className="text-[var(--fg)]/80 font-16 font-medium  text-start max-w-[420px]">
              Selfie photo text. It only takes a few minutes...
            </p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-center items-center border border-inactive-gray p-8 rounded-[10px]">
            {!hasDocFile('selfie_photo') && !files['selfie_photo'] ? (
              <div
                onClick={() => {
                  setCameraDocId('selfie_photo');
                  setOpenCamera(true);
                }}
                className="flex flex-col items-center justify-center gap-3 text-[#7F9BB6] cursor-pointer"
              >
                <img
                  src="/images/kyc/camera.svg"
                  alt="Camera"
                  className={`h-14 ${isDark ? '' : 'invert'}`}
                />
                <p className="border border-[#475462] font-16 py-2 px-3 rounded-md">
                  Click Here to Take Photo
                </p>
              </div>
            ) : (
              <div className="w-full max-w-sm">
                <div className="border border-dashed border-white/20 rounded-xl p-3 mb-3">
                  <img
                    src={
                      files['selfie_photo']
                        ? URL.createObjectURL(files['selfie_photo'])
                        : filesMeta['selfie_photo']?.url
                    }
                    alt="Selfie preview"
                    className="w-full rounded-lg object-cover"
                  />
                </div>

                <FileNameViewer
                  file={files['selfie_photo'] || filesMeta['selfie_photo']}
                  onRemove={() => handleClearFile('selfie_photo', true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-end items-center gap-4">
        {onBack && (
          <CustomButton
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto px-10"
          >
            Back
          </CustomButton>
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
      {openCamera && cameraDocId && (
        <CameraCapture
          onCapture={(file) => {
            handleFileSelected(cameraDocId, file);
            setOpenCamera(false);
            setCameraDocId(null);
          }}
          onClose={() => {
            setOpenCamera(false);
            setCameraDocId(null);
          }}
        />
      )}
    </div>
  );
}
