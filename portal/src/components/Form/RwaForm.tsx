/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed dynamic field config, matches the pattern in rwa.api.ts */
import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormWatch,
} from 'react-hook-form';

import type {
  IFieldConfig,
  IFormInputConfig,
  DocumentConfigKyc,
} from '@/interface';
import FormSelect from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';
import FormTextarea from '@/components/Form/FormTextarea';
import FormRadio from '@/components/Form/FormRadio';
import CustomInput from '@/components/Base/CustomInput';
import { FiX } from 'react-icons/fi';

import CustomButton, {
  type ICustomButtonProps,
} from '@/components/Base/CustomButton';
import { useEffect, useRef, useState } from 'react';
import { useKycDocumentsUpload } from '@/hooks/useKycDocumentsUpload';

import RadioFileUpload from '../DocumentsUploadStep/RadioFileUpload';
import FileUpload from '../UploadFile/FileUploadrwa';

interface IRwaFormProps {
  fields: IFieldConfig[];
  docFields: DocumentConfigKyc[];
  onSubmit: SubmitHandler<FieldValues>;
  initialValues?: Record<string, any>;
  initialDocuments?: any[];
  button?: {
    label?: React.ReactNode;
    variant?: ICustomButtonProps['variant'];
  };
  onBack?: () => void;
}

const isInputField = (type: string) =>
  ['text', 'email', 'password', 'number', 'contact', 'file', 'date'].includes(
    type
  );

export default function RwaForm({
  fields,
  docFields,
  initialValues = {},
  onSubmit,

  button = { label: 'Continue', variant: 'primary' },
  onBack,
  initialDocuments,
}: IRwaFormProps) {
  const {
    control,
    setValue,
    // handleSubmit,
    watch,
    reset,
    trigger,
  } = useForm<FieldValues>({
    mode: 'onTouched',
    defaultValues: {
      ...initialValues,
    },
  });

  const {
    files,
    filesMeta,
    fileError,
    handleFileSelected,
    handleClearFile,
    handleSubmitAll,
    hydrateFromMeta,
    uploadingDocId,
  } = useKycDocumentsUpload();

  // hydrateFromMeta is recreated every render (not memoized), so without a
  // one-time guard this effect re-fires on every render — including right
  // after the user removes a prefilled document — and re-populates the
  // removed doc from initialDocuments before they can pick a replacement.
  const didHydrateDocs = useRef(false);
  useEffect(() => {
    if (didHydrateDocs.current) return;
    if (!initialDocuments?.length) return;
    didHydrateDocs.current = true;

    hydrateFromMeta(initialDocuments, docFields);
  }, [initialDocuments, docFields, hydrateFromMeta]);

  // `initialValues` is a fresh object literal on every parent render (not
  // memoized), so without a one-time guard this effect re-fires constantly —
  // e.g. right after the user picks a radio option (like NOC type) and
  // uploads its file, a parent re-render calls reset(initialValues) again
  // with the still-unsaved server value, wiping the selection they just made.
  const didResetValues = useRef(false);
  useEffect(() => {
    if (didResetValues.current) return;
    if (initialValues && Object.keys(initialValues).length > 0) {
      didResetValues.current = true;
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const yearOfConstruction = watch('yearOfConstruction');

  useEffect(() => {
    const year = Number(yearOfConstruction);
    const currentYear = new Date().getFullYear();
    if (!year) return;
    // ✅ validation check
    if (year < 1825 || year > currentYear) {
      setValue('assetAge', '');
      return;
    }
    const age = currentYear - year;
    if (age >= 0) {
      setValue('assetAge', age);
    }
  }, [yearOfConstruction, setValue]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showDocError, setShowDocError] = useState(false);
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

  const areRequiredDocsUploaded = docFields.every((doc) => {
    if (!doc.required) return true;

    if (doc.type === 'radio-image') {
      const selected = watch(doc.id);
      if (!selected) return false;

      return Boolean(files[doc.id] || filesMeta[doc.id]?.url);
    }

    return Boolean(files[doc.id] || filesMeta[doc.id]?.url);
  });

  const handleFormSubmit: SubmitHandler<FieldValues> = async (values) => {
    if (!onSubmit) return;

    await handleSubmitAll(
      async ({ documents, extra }: any) => {
        const cleanedValues = {
          ...values,
          assetAge: values.assetAge ? Number(values.assetAge) : undefined,
        };

        await onSubmit({
          ...cleanedValues,
          documents,
          extra,
        });
      },
      {
        filesMeta,
      }
    );
  };

  const renderField = (field: IFieldConfig) => {
    const localField = { ...field };

    if (localField.conditionalRequired) {
      const dependsValue = watch(localField.conditionalRequired.dependsOn);

      const shouldBeRequired =
        dependsValue === localField.conditionalRequired.value;

      if (shouldBeRequired) {
        localField.validation = {
          ...localField.validation,
          required: localField.conditionalRequired.message,
        };
      } else if (localField.validation?.required) {
        const rest = { ...localField.validation };
        delete rest.required;
        localField.validation = rest;
      }
    }

    let isDisabledForField = Boolean(localField.disabledByDefault);

    if (localField.conditionalEnable) {
      const dependsValue = watch(localField.conditionalEnable.dependsOn);
      isDisabledForField = dependsValue !== localField.conditionalEnable.value;
    }

    if (localField.name === 'assetAge') {
      const age = watch('assetAge');
      if (!age) return null;
    }

    const colClass = localField.fullWidth
      ? 'col-span-12'
      : 'col-span-12 md:col-span-6';

    const dynamicRules = { ...(localField.validation || {}) };

    // Ownership Model — "Others" swaps the dropdown in place for a free-text
    // input (letters/spaces only), same UX as Step 1's Preliminary form.
    // formData.ownershipModel stays the literal 'Others'; the typed text
    // goes into the separate ownershipModelOther field.
    if (localField.name === 'ownershipModel') {
      const ownershipValue = watch('ownershipModel');
      const ownershipOtherValue = watch('ownershipModelOther') || '';

      if (ownershipValue === 'Others') {
        return (
          <div key={localField.name} className={colClass}>
            <CustomInput
              label={localField.label}
              type="text"
              required={localField.required}
              autoFocus
              value={ownershipOtherValue}
              onChange={(v) => {
                if (!/^[A-Za-z\s]*$/.test(v)) return;
                setValue('ownershipModelOther', v, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              placeholder="Enter ownership model"
              rightIcon={
                <button
                  type="button"
                  onClick={() => {
                    setValue('ownershipModel', '', {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue('ownershipModelOther', '', {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  aria-label="Clear custom ownership model"
                >
                  <FiX />
                </button>
              }
            />
          </div>
        );
      }
    }

    switch (localField.type) {
      case 'select':
        return (
          <div key={localField.name} className={colClass}>
            <FormSelect
              field={localField}
              control={control}
              disabled={isDisabledForField}
              rules={dynamicRules}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={localField.name} className="col-span-12">
            <FormTextarea
              field={localField}
              control={control}
              disabled={isDisabledForField}
              rules={dynamicRules}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={localField.name} className="col-span-12">
            <FormRadio
              field={localField}
              control={control}
              disabled={isDisabledForField}
              rules={dynamicRules}
              // tooltip={localField.tooltip}
              // toolTipContent={localField.tootTipContent}
            />
          </div>
        );
    }

    if (isInputField(localField.type)) {
      return (
        <div key={localField.name} className={colClass}>
          <FormInput
            field={localField as IFormInputConfig}
            control={control}
            rules={dynamicRules}
            disabled={isDisabledForField}
            extraText={localField.extraText}
            watch={watch as UseFormWatch<FieldValues>}
          />
        </div>
      );
    }

    return null;
  };

  type FormValues = Record<string, any>;

  const isFieldRequired = (
    field: IFieldConfig,
    values: FormValues
  ): boolean => {
    if (field.validation?.required) return true;

    if (field.conditionalRequired) {
      return (
        values[field.conditionalRequired.dependsOn] ===
        field.conditionalRequired.value
      );
    }

    return false;
  };

  const getRequiredFields = (
    fields: IFieldConfig[],
    values: FormValues
  ): IFieldConfig[] => {
    return fields.filter((field) => isFieldRequired(field, values));
  };

  const getFilledFieldsCount = (
    fields: IFieldConfig[],
    values: FormValues
  ): number => {
    let count = 0;

    fields.forEach((field) => {
      const val = values[field.name];

      if (val !== undefined && val !== null && val !== '') {
        count++;
      }
    });

    return count;
  };

  const getRequiredDocs = (docs: DocumentConfigKyc[]) => {
    return docs.filter((doc) => doc.required);
  };

  const getUploadedDocsCount = (docs: DocumentConfigKyc[]) => {
    let count = 0;

    docs.forEach((doc) => {
      if (files[doc.id] || filesMeta[doc.id]?.url) {
        count++;
      }
    });

    return count;
  };

  const values = watch() as FormValues;

  // 🔹 fields
  const requiredFields = getRequiredFields(fields, values);
  const filledFields = getFilledFieldsCount(requiredFields, values);

  // 🔹 documents
  const requiredDocs = getRequiredDocs(docFields);
  const uploadedDocs = getUploadedDocsCount(requiredDocs);

  // 🔹 total
  const totalRequired = requiredFields.length + requiredDocs.length;
  const totalFilled = filledFields + uploadedDocs;

  const progress =
    totalRequired === 0 ? 0 : Math.round((totalFilled / totalRequired) * 100);

  return (
    <form
      // onSubmit={handleSubmit(handleFormSubmit)}
      onSubmit={async (e) => {
        e.preventDefault();
        const valid = await trigger();
        setShowDocError(true); // ✅ doc error dikhao
        if (valid && areRequiredDocsUploaded)
          handleFormSubmit(watch() as FieldValues);
      }}
      className="w-full mx-auto font-work bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] p-6 rounded-2xl md:p-8 "
    >
      <div className="sticky top-0 z-20 bg-[var(--card)] pb-3">
        <div className="flex justify-between text-sm mb-1 text-[var(--fg)]">
          <span>Form Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-10">
        {fields.map(renderField)}
      </div>
      <div className="flex flex-col gap-2 mb-6 md:mb-10">
        <h2 className="font-medium font-44 text-[var(--fg)]">Documents</h2>
        <p className="text-gray-500 font-medium font-16 leading-[20px] tracking-[0%]">
          Upload documents. It only takes a few minutes
        </p>
      </div>
      <div className="grid grid-cols-1  gap-10 w-full mb-10">
        {docFields.map((doc) =>
          doc.type === 'radio-image' ? (
            <RadioFileUpload
              filesMeta={filesMeta}
              key={doc.id}
              docId={doc.id}
              label={doc.label}
              required={doc.required}
              options={doc.options!}
              files={files}
              watch={watch}
              control={control}
              setValue={setValue}
              tooltip={doc.tooltip}
              toolTipContent={doc.toolTipContent}
              helpDesk={doc.helpDesk}
              isUploading={uploadingDocId === doc.id}
              error={
                // ✅ add karo
                showDocError &&
                doc.required &&
                !files[doc.id] &&
                !filesMeta[doc.id]?.url
                  ? 'This document is required'
                  : undefined
              }
              // error={fileError ?? undefined}
              onChange={(derivedId, file) => {
                if (!file) {
                  handleClearFile(derivedId);
                  return;
                }
                handleFileSelected(derivedId, file);
                // setShowDocError(false);
              }}
            />
          ) : (
            <FileUpload
              key={doc.id}
              label={doc.label}
              existingUrl={filesMeta[doc.id]?.url}
              description={doc.description}
              required={doc.required}
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={100}
              tooltip={doc.tooltip}
              toolTipContent={doc.toolTipContent}
              helpDesk={doc.helpDesk}
              file={files[doc.id] ?? null}
              // error={fileError?.[doc.id]}
              error={
                // ✅ fileError ke saath doc error bhi
                fileError?.[doc.id] ||
                (showDocError &&
                doc.required &&
                !files[doc.id] &&
                !filesMeta[doc.id]?.url
                  ? 'This document is required'
                  : undefined)
              }
              isUploading={uploadingDocId === doc.id}
              onChange={(file) => {
                if (!file) {
                  handleClearFile(doc.id, doc.required);
                } else {
                  handleFileSelected(doc.id, file);
                  // setShowDocError(false);
                }
              }}
            />
          )
        )}
      </div>

      {showDocError && !areRequiredDocsUploaded && (
        <p className="text-red-600 text-14">
          * Please fill all required fields
        </p>
      )}

      <div className="mt-10 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--fg)] font-medium cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent font-16 px-10 border border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition w-full sm:w-auto "
          >
            Back
          </button>
        )}

        <CustomButton
          type="submit"
          variant={button.variant}
          // disabled={!canSubmit}
          className="w-full sm:w-auto px-10 !mt-0"
        >
          {button.label}
        </CustomButton>
      </div>
    </form>
  );
}
