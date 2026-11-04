import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormWatch,
} from 'react-hook-form';
import { useEffect } from 'react';
import type {
  IFieldConfig,
  IFormDatepickerConfig,
  IFormInputConfig,
} from '@/interface';
import FormSelect from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';
import FormTextarea from '@/components/Form/FormTextarea';
import FormRadio from '@/components/Form/FormRadio';
import CustomButton, {
  type ICustomButtonProps,
} from '@/components/Base/CustomButton';
import FormDatepicker from './FormDatePicker';
import { useCountries, useStates, useCities } from '@/api/location.api';

const isInputField = (type: string) =>
  ['text', 'email', 'password', 'number', 'contact', 'file', 'date'].includes(
    type
  );

const EMPTY_OBJ = {};

interface ICompanyFormProps {
  group1?: IFieldConfig[];
  group2?: IFieldConfig[];
  group3?: IFieldConfig[];
  group4?: IFieldConfig[];

  onSubmit: SubmitHandler<FieldValues>;
  isDisabled?: string;

  initialValues?: Record<string, any>;
  emailMask?: string;
  mobileMask?: string;
  externalValues?: Record<string, any>;
  isAssetOnboarding?: boolean;

  button?: {
    variant?: ICustomButtonProps['variant'];
    label?: React.ReactNode;
  };
  className?: string;
  onBack?: () => void;
}

export default function CompanyForm({
  group1,
  group2,
  group3,
  group4,
  initialValues = EMPTY_OBJ,
  externalValues = EMPTY_OBJ,
  isAssetOnboarding = false,
  onSubmit,
  button = {
    variant: 'primary',
    label: 'Continue',
  },
  className,
  onBack,
}: ICompanyFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const selectedCountry =
    watch('country') ||
    watch('registeredCountry') ||
    watch('countriesOfOperation');
  const selectedState = watch('state') || watch('registeredState');

  const { data: countriesRes } = useCountries();
  const { data: statesRes } = useStates(selectedCountry);
  const { data: citiesRes } = useCities(selectedCountry, selectedState);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    const initCountry =
      initialValues?.country ||
      initialValues?.registeredCountry ||
      initialValues?.countriesOfOperation;
    if (selectedCountry && selectedCountry !== initCountry) {
      setValue('state', '', { shouldValidate: false, shouldDirty: true });
      setValue('city', '', { shouldValidate: false, shouldDirty: true });
      setValue('registeredState', '', {
        shouldValidate: false,
        shouldDirty: true,
      });
      setValue('registeredCity', '', {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [
    selectedCountry,
    setValue,
    initialValues?.country,
    initialValues?.registeredCountry,
    initialValues?.countriesOfOperation,
  ]);

  useEffect(() => {
    const initState = initialValues?.state || initialValues?.registeredState;
    if (selectedState && selectedState !== initState) {
      setValue('city', '', { shouldValidate: false, shouldDirty: true });
      setValue('registeredCity', '', {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [
    selectedState,
    setValue,
    initialValues?.state,
    initialValues?.registeredState,
  ]);

  useEffect(() => {
    const allFields = [
      ...(group1 ?? []),
      ...(group2 ?? []),
      ...(group3 ?? []),
      ...(group4 ?? []),
    ];

    allFields.forEach((field) => {
      let isDisabled = false;

      if (field.disabledByDefault) isDisabled = true;

      if (field.conditionalEnable) {
        const dependsVal = watch(field.conditionalEnable.dependsOn);
        isDisabled = dependsVal !== field.conditionalEnable.value;
      }

      if (isDisabled) {
        setValue(field.name, '');
      }
    });
  }, [watch, setValue, group1, group2, group3, group4]);

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
        const { required, ...rest } = localField.validation;
        localField.validation = rest;
      }
    }

    let isDisabledForField = false;

    if (localField.disabledByDefault) {
      isDisabledForField = true;
    }

    if (localField.conditionalEnable) {
      const dependsVal = watch(localField.conditionalEnable.dependsOn);
      isDisabledForField = dependsVal !== localField.conditionalEnable.value;
    }

    // useEffect(() => {
    //   if (isDisabledForField) {
    //     setValue(field.name, '');
    //   }
    // }, [isDisabledForField, field.name, setValue]);

    const addressFields = [
      'city',
      'state',
      'pincode',
      'addressLine1',
      'addressLine2',
      'country',
      'registeredCity',
      'registeredState',
      'registeredPincode',
      'registeredAddressLine1',
      'registeredAddressLine2',
      'registeredCountry',
    ];

    const isRow3 = addressFields.includes(localField.name);

    if (
      ['country', 'registeredCountry', 'countriesOfOperation'].includes(
        localField.name
      )
    ) {
      (localField as any).options =
        countriesRes?.success === true
          ? countriesRes?.data?.map((c: any) => ({
              label: c.name,
              value: c.isoCode,
            }))
          : [];
    } else if (['state', 'registeredState'].includes(localField.name)) {
      (localField as any).options =
        statesRes?.success === true
          ? statesRes?.data?.map((s: any) => ({
              label: s.name,
              value: s.code,
            }))
          : [];
    } else if (['city', 'registeredCity'].includes(localField.name)) {
      (localField as any).options =
        citiesRes?.success === true
          ? citiesRes?.data?.map((c: any) => ({
              label: c.name,
              value: c.name,
            }))
          : [];
    }

    const colClass = isRow3
      ? 'col-span-12 md:col-span-4'
      : field.fullWidth
        ? 'col-span-12'
        : 'col-span-12 md:col-span-6';

    let shouldShowField = true;

    if (localField.conditionalShow) {
      const dependsValue = watch(localField.conditionalShow.dependsOn);
      shouldShowField = dependsValue === localField.conditionalShow.value;
    }

    if (localField.externalConditionalShow) {
      const externalVal =
        externalValues[localField.externalConditionalShow.key] ?? null;
      if (externalVal !== localField.externalConditionalShow.value) {
        shouldShowField = false;
      }
    }

    if (!shouldShowField) return null;

    let dynamicRules: any = { ...(localField.validation || {}) };

    if (localField.conditionalShow && localField.required) {
      dynamicRules.required = `${localField.label} is required`;
    }

    if (localField.externalConditionalRequired) {
      const externalVal =
        externalValues[localField.externalConditionalRequired.key];

      const shouldBeRequired =
        externalVal === localField.externalConditionalRequired.value;

      if (shouldBeRequired) {
        dynamicRules.required = localField.externalConditionalRequired.message;
      } else {
        delete dynamicRules.required;
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

      case 'datepicker':
        return (
          <div key={localField.name} className="col-span-12 md:col-span-6">
            <FormDatepicker
              field={localField as IFormDatepickerConfig}
              control={control}
              error={undefined}
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
            />
          </div>
        );

      default:
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
                isAssetOnboarding={isAssetOnboarding}
              />
            </div>
          );
        }
    }
  };

  const renderSection = (fields?: IFieldConfig[]) =>
    fields && fields.length > 0 ? (
      <div className="grid grid-cols-12 gap-4 mb-6">
        {fields.map(renderField)}
      </div>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={
        className ||
        'w-full mx-auto font-work bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] p-4 md:p-6 rounded-2xl'
      }
    >
      {renderSection(group1)}
      {renderSection(group2)}
      {renderSection(group3)}
      {renderSection(group4)}

      <div className="w-full flex justify-end gap-4 mt-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--fg)] font-medium cursor-pointer flex items-center justify-center gap-2 py-1 md:py-2.5 mt-3 rounded-xl bg-transparent font-16 px-8 border border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition"
          >
            Back
          </button>
        )}

        <CustomButton
          type="submit"
          variant={button.variant}
          disabled={false}
          className={`${onBack ? 'w-full sm:w-auto' : 'w-full sm:w-1/4'} px-10`}
        >
          {button.label}
        </CustomButton>
      </div>
    </form>
  );
}
