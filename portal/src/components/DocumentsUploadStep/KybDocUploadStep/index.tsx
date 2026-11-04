import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
// import type { RootState } from '@/redux/store';
import { saveStepData } from '@/redux/slices/kybSlice';
import { useForm, type FieldValues } from 'react-hook-form';
import CustomButton from '@/components/Base/CustomButton';
import FormInput from '@/components/Form/FormInput';
import FormRadio from '@/components/Form/FormRadio';
import { DOCUMENTS } from '@/constants/kyb';
import type { IFieldConfig } from '@/interface';
import { useDocumentsUpload } from '@/hooks/useDocumentsUpload';
import FileUpload from '@/components/UploadFile/FileUploadrwa';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

type DocumentType = {
  id: number;
  documentTypeId: number;
  companyId: number;
  directorId: number | null;
  accountId: number;
  url: string;
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
  documents?: DocumentType[];
}

export default function KybDocUploadStep({
  onSubmit,
  onBack,
  externalValues = {},
  documents,
}: DocumentsUploadStepProps) {
  const dispatch = useDispatch();
  // const step4Data = useSelector((state: RootState) => state.kyb.step4Data);

  const {
    files,
    filesMeta,
    fileError,
    // handleUploadClick,
    handleFileSelected,
    // handleUpdate,
    handleClearFile,
    handleSubmitAll,
    hydrateFromMeta,
    uploadingDocId,
  } = useDocumentsUpload(undefined);

  useEffect(() => {
    if (!documents || documents.length === 0) return;

    hydrateFromMeta(
      documents.map((doc) => ({
        documentIdentifier: doc.documentIdentifier,
        url: doc.url,
      })),
      DOCUMENTS.map((d) => ({
        id: d.id,
        documentType: d.id, // ✅ IMPORTANT
      }))
    );
  }, [documents]);

  const prevMetaRef = useRef('');

  useEffect(() => {
    const current = JSON.stringify(filesMeta);

    if (prevMetaRef.current !== current) {
      prevMetaRef.current = current;
      dispatch(saveStepData({ step: 4, data: { filesMeta } }));
    }
  }, [filesMeta, dispatch]);

  const visibleDocuments = DOCUMENTS.filter((doc) => {
    if (doc.externalConditionalShow) {
      const actual = externalValues[doc.externalConditionalShow.key];
      return actual === doc.externalConditionalShow.value;
    }
    return true;
  });

  const {
    control,
    watch,
    trigger,
  } = useForm<FieldValues>({
    mode: 'onTouched',
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const authorizeCompany = watch('authorizeCompany');
  const signatoryName = watch('signatoryName');

  const resolveRequired = (doc: (typeof DOCUMENTS)[number]) => {
    if (!!doc.required) return true;
    if (doc.externalConditionalRequired) {
      const val = externalValues[doc.externalConditionalRequired.key];
      return val === doc.externalConditionalRequired.value;
    }
    return false;
  };

  const areRequiredDocsUploaded = DOCUMENTS.every((doc) => {
    if (doc.externalConditionalShow) {
      const val = externalValues[doc.externalConditionalShow.key];
      if (val !== doc.externalConditionalShow.value) return true;
    }

    if (!resolveRequired(doc) || doc.isTextField) return true;

    return files[doc.id] || filesMeta[doc.id];
  });

  const getDocError = (doc: (typeof DOCUMENTS)[number]) => {
    if (fileError?.[doc.id]) return fileError[doc.id];
    if (!submitAttempted || doc.isTextField) return undefined;

    if (doc.externalConditionalShow) {
      const val = externalValues[doc.externalConditionalShow.key];
      if (val !== doc.externalConditionalShow.value) return undefined;
    }

    if (resolveRequired(doc) && !files[doc.id] && !filesMeta[doc.id]) {
      return `${doc.label} is required`;
    }

    return undefined;
  };

  const authorizeCompanyField: IFieldConfig = {
    name: 'authorizeCompany',
    label: 'Authorizing Company to register on House of Frac',
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
    setSubmitAttempted(true);
    const isFormValid = await trigger();
    if (!isFormValid || !areRequiredDocsUploaded) return;
    if (!onSubmit) return;

    await handleSubmitAll(onSubmit, {
      authorizeCompany,
      signatoryName,
      filesMeta,
    });
  };

  return (
    <div className="w-full font-work">
      <div className=" w-full bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] p-4 lg:p-8 rounded-2xl ">
        <div className="grid grid-cols-1 gap-8">
          {visibleDocuments.map((doc) => {
            if (doc.isTextField && doc.id === 'shareholdingPattern') {
              return (
                <FormInput
                  key={doc.id}
                  field={shareholdingPatternField}
                  control={control}
                  rules={shareholdingPatternField.validation}
                />
              );
            }

            return (
              <FileUpload
                key={doc.id}
                required
                accept=".jpg,.jpeg,.png,.pdf"
                maxSizeMB={100}
                // error={error}
                label={doc.label}
                file={files[doc.id] ?? null}
                existingUrl={filesMeta?.[doc.id]?.url}
                error={getDocError(doc)}
                isUploading={uploadingDocId === doc.id}
                onChange={(file) => {
                  if (!file) {
                    handleClearFile(doc.id, doc.required);
                  } else {
                    handleFileSelected(doc.id, file);
                  }
                  // handleUploadClick(doc.id);
                  // handleFileSelected(doc.id, file);

                  // handleUpdate();
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:gap-6 mt-6 p-6 rounded-xl  bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)]">
        <h3 className="text-[var(--fg)] font-44 font-medium">
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
            className="text-[var(--fg)] font-medium cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent font-16 px-8 border border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition w-full sm:w-auto"
          >
            Back
          </button>
        )}

        <CustomButton
          type="button"
          disabled={false}
          onClick={onFinalSubmit}
          variant="formButton"
          className="w-full sm:w-auto px-10"
        >
          Submit Documents
        </CustomButton>
      </div>
    </div>
  );
}
