/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed dynamic field config, matches the pattern in rwa.api.ts */
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import type { IFieldConfig, IFormInputConfig } from '@/interface';
import FormSelect from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';
import FormTextarea from '@/components/Form/FormTextarea';
import FormRadio from '@/components/Form/FormRadio';
import FormImageInput from '@/components/Form/FormImageInput';
import FormVideoInput from '@/components/Form/FormVideoInput';
import CustomButton, {
  type ICustomButtonProps,
} from '@/components/Base/CustomButton';
// import GeoLocationPickerWrapper from './GeoLocationPickerWrapper';
import { useEffect, useRef, useState } from 'react';
import { useCountries, useStates, useCities } from '@/api/location.api';
import FormWhyInvestedInput from './FormWhyInvestedInput';
import { getIconListApi } from '@/api';
import { resolveCountryIsoCode, resolveStateCode } from '@/utils/rwa.utils';

const UPLOAD_BASE_URL = import.meta.env.VITE_API_URL;

const hydrateMedia = (urls: string[] | undefined, type: 'image' | 'video') => {
  if (!Array.isArray(urls)) return [];

  return urls.map((filename, index) => ({
    id: `${type}-existing-${index}`,
    file: null,
    previewUrl: `${UPLOAD_BASE_URL}/storage/${filename}`,
    type,
    filename, // Ensure filename is kept for re-submission logic
    __isFile: false,
  }));
};

type RwaAssetFormValues = {
  assetImages?: {
    id: string;
    file: File | null;
    previewUrl: string;
    type: 'image' | 'video';
    filename?: string;
    __isFile: boolean;
  }[];
  assetVideos?: {
    id: string;
    file: File | null;
    previewUrl: string;
    type: 'image' | 'video';
    filename?: string;
    __isFile: boolean;
  }[];
  [key: string]: any;
};

interface IAssetFormProps {
  group1?: IFieldConfig[];
  group2?: IFieldConfig[];
  group3?: IFieldConfig[];
  group4?: IFieldConfig[];

  onSubmit: SubmitHandler<FieldValues>;
  isDisabled?: string;

  initialValues?: Record<string, any>;
  button?: {
    variant?: ICustomButtonProps['variant'];
    label?: React.ReactNode;
  };
  onBack?: () => void;
  isSubmitting?: boolean;
}

const isInputField = (type: string) =>
  ['text', 'email', 'password', 'number', 'contact', 'file', 'date'].includes(
    type
  );

export default function RwaAssetForm({
  group1,
  group2,
  group3,
  group4,
  initialValues = {},
  onSubmit,
  button = {
    variant: 'primary',
    label: 'Save & Continue',
  },
  onBack,
  isSubmitting,
}: IAssetFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { isValid },
  } = useForm<RwaAssetFormValues>({
    mode: 'onChange',
    defaultValues: {
      geoLocation: '',
      extraMarkers: [],
      polygonPath: [],
      polygonArea: null,

      city: '',
      state: '',
      country: '',
      pincode: '',
      whyInvested: [
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
      ],

      ...initialValues,

      assetImages: hydrateMedia(initialValues?.assetImages, 'image'),
      assetVideos: hydrateMedia(initialValues?.assetVideos, 'video'),
    },
  });

  const selectedCountry = watch('country');
  const selectedState = watch('state');

  const { data: countriesRes } = useCountries();

  // Older submits stored the human-readable country/state name (see the
  // country/state transform in the submit handler below) instead of the
  // select's isoCode/code. Resolve `selectedCountry`/`selectedState` to a
  // real code *before* calling the states/cities APIs, so a raw name like
  // "India" never goes out as countryCode. Until the countries/states list
  // has loaded (so we can actually resolve it), keep the code empty rather
  // than falling back to the raw value — otherwise the states/cities query
  // fires once with the raw name and again with the resolved code.
  const resolvedCountryCode =
    countriesRes?.success === true
      ? (resolveCountryIsoCode(countriesRes.data, selectedCountry) ??
        selectedCountry)
      : '';

  const { data: statesRes } = useStates(resolvedCountryCode);

  const resolvedStateCode =
    statesRes?.success === true
      ? (resolveStateCode(statesRes.data, selectedState) ?? selectedState)
      : '';

  const { data: citiesRes } = useCities(resolvedCountryCode, resolvedStateCode);

  const [iconOptions, setIconOptions] = useState<
    { label: string; value: string; url: string }[]
  >([]);
  const fetchIcons = async () => {
    try {
      const response = await getIconListApi();

      if (response?.success && response?.data) {
        const list = response.data || [];

        const mapped = list.map((item: any) => ({
          label: item.name,
          value: String(item.id),
          url: item.url,
        }));

        setIconOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching icons:', error);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const lastCountry = useRef(selectedCountry);
  useEffect(() => {
    if (selectedCountry !== lastCountry.current) {
      if (lastCountry.current && lastCountry.current !== '') {
        setValue('state', '', { shouldValidate: false, shouldDirty: true });
        setValue('city', '', { shouldValidate: false, shouldDirty: true });
      }
      lastCountry.current = selectedCountry;
    }
  }, [selectedCountry, setValue]);

  const lastState = useRef(selectedState);
  useEffect(() => {
    if (selectedState !== lastState.current) {
      if (lastState.current && lastState.current !== '') {
        setValue('city', '', { shouldValidate: false, shouldDirty: true });
      }
      lastState.current = selectedState;
    }
  }, [selectedState, setValue]);

  const didHydrateInitialValues = useRef(false);
  useEffect(() => {
    if (didHydrateInitialValues.current) return;
    if (!initialValues || Object.keys(initialValues).length === 0) return;
    didHydrateInitialValues.current = true;

    reset({
      geoLocation: '',
      extraMarkers: [],
      polygonPath: [],
      polygonArea: null,
      city: '',
      state: '',
      country: '',
      pincode: '',

      ...initialValues,
      assetImages: hydrateMedia(initialValues?.assetImages, 'image'),
      assetVideos: hydrateMedia(initialValues?.assetVideos, 'video'),
    });
  }, [initialValues, reset]);

  // Older submits stored the human-readable country/state name (see the
  // country/state transform in the submit handler below) instead of the
  // select's isoCode/code. When editing such an asset, resolve that name
  // back to the code the Country/State/City selects expect, otherwise they
  // render empty even though the data exists.
  const didResolveCountry = useRef(false);
  useEffect(() => {
    if (didResolveCountry.current) return;
    // initialValues starts as {} until the parent's asset fetch resolves
    // (e.g. on a page refresh at ?id=X&step=3) — don't treat that as "no
    // country to resolve", or it locks out the real value once it arrives.
    if (!initialValues || Object.keys(initialValues).length === 0) return;
    const raw = initialValues?.country;
    if (!raw) {
      didResolveCountry.current = true;
      return;
    }
    if (countriesRes?.success !== true) return;
    didResolveCountry.current = true;
    const resolved = resolveCountryIsoCode(countriesRes.data, raw);
    if (resolved && resolved !== raw) {
      lastCountry.current = resolved;
      setValue('country', resolved, { shouldValidate: false });
    }
  }, [countriesRes, initialValues, setValue]);

  // Only trust `statesRes` once `resolvedCountryCode` is confirmed to be a
  // real ISO code — otherwise the states query mid-flight for the raw
  // country name (e.g. "India") can resolve first with an empty/irrelevant
  // list and permanently lock in "no match".
  const isResolvedCountryValid =
    countriesRes?.success === true &&
    !!resolvedCountryCode &&
    countriesRes.data?.some((c: any) => c.isoCode === resolvedCountryCode);

  const didResolveState = useRef(false);
  useEffect(() => {
    if (didResolveState.current) return;
    if (!initialValues || Object.keys(initialValues).length === 0) return;
    const raw = initialValues?.state;
    if (!raw) {
      didResolveState.current = true;
      return;
    }
    if (!isResolvedCountryValid) return;
    if (statesRes?.success !== true) return;
    didResolveState.current = true;
    const resolved = resolveStateCode(statesRes.data, raw);
    if (resolved && resolved !== raw) {
      lastState.current = resolved;
      setValue('state', resolved, { shouldValidate: false });
    }
  }, [statesRes, initialValues, setValue, isResolvedCountryValid]);

  const renderField = (field: IFieldConfig) => {
    const localField = { ...field };
    const dynamicRules: any = { ...localField.validation };

    if (localField.conditionalRequired) {
      const dependsValue = watch(localField.conditionalRequired.dependsOn);
      const shouldBeRequired =
        dependsValue === localField.conditionalRequired.value;

      if (shouldBeRequired) {
        dynamicRules.required = localField.conditionalRequired.message;
      } else {
        delete dynamicRules.required;
      }
    }

    let isDisabledForField = Boolean(localField.disabledByDefault);

    if (localField.conditionalEnable) {
      const dependsValue = watch(localField.conditionalEnable.dependsOn);
      isDisabledForField = dependsValue !== localField.conditionalEnable.value;
    }

    const addressFields = ['city', 'state', 'pincode', 'country'];
    const isRow3 = addressFields.includes(localField.name);

    if (localField.name === 'country') {
      (localField as any).options =
        countriesRes?.success === true
          ? countriesRes?.data?.map((c: any) => ({
              label: c.name,
              value: c.isoCode,
              fullName: c.name,
            }))
          : [];
    } else if (localField.name === 'state') {
      (localField as any).options =
        statesRes?.success === true
          ? statesRes?.data?.map((s: any) => ({
              label: s.name,
              value: s.code,
            }))
          : [];
    } else if (localField.name === 'city') {
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
      : localField.fullWidth
        ? 'col-span-12'
        : 'col-span-12 md:col-span-6';

    if (localField.type === 'image') {
      return (
        <div key={localField.name} className="col-span-12">
          <FormImageInput
            field={localField}
            control={control}
            rules={dynamicRules}
          />
        </div>
      );
    }

    if (localField.type === 'video') {
      return (
        <div key={localField.name} className="col-span-12">
          <FormVideoInput
            field={localField}
            control={control}
            rules={dynamicRules}
          />
        </div>
      );
    }

    if (localField.type === 'geo') {
      // Google Map picker hidden for now — commented out, not deleted.
      // return (
      //   <div key={localField.name} className="col-span-12">
      //     <GeoLocationPickerWrapper
      //       field={localField}
      //       control={control}
      //       setValue={setValue}
      //     />
      //   </div>
      // );
      return null;
    }

    if (localField.type === 'whyInvested') {
      return (
        <div key={localField.name} className="col-span-12">
          <FormWhyInvestedInput
            field={localField}
            control={control}
            iconOptions={iconOptions}
          />
        </div>
      );
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
                watch={watch}
              />
            </div>
          );
        }
    }
  };

  const renderSection = (fields?: IFieldConfig[]) =>
    fields && fields.length > 0 ? (
      <div className="grid grid-cols-12  md:gap-6 mb-4 md:mb-10 ">
        {fields.map(renderField)}
      </div>
    ) : null;

  type FormValues = Record<string, any>;

  const isFieldRequired = (
    field: IFieldConfig,
    values: FormValues
  ): boolean => {
    // Geo location picker is currently hidden (commented out above) — don't
    // count it toward required-fields progress, it can never be filled.
    if (field.type === 'geo') return false;
    if (field.required || field.validation?.required) return true;
    if (field.conditionalRequired) {
      return (
        values[field.conditionalRequired.dependsOn] ===
        field.conditionalRequired.value
      );
    }
    return false;
  };

  const getRequiredFields = (
    groups: (IFieldConfig[] | undefined)[],
    values: FormValues
  ): IFieldConfig[] => {
    return groups
      .flat()
      .filter((field): field is IFieldConfig =>
        Boolean(field && isFieldRequired(field, values))
      );
  };

  // const getFilledCount = (
  //   fields: IFieldConfig[],
  //   values: FormValues
  // ): number => {
  //   let count = 0;

  //   fields.forEach((field) => {
  //     const val = values[field.name];

  //     if (Array.isArray(val)) {
  //       if (val.length > 0) count++;
  //     } else if (val !== undefined && val !== null && val !== '') {
  //       count++;
  //     }
  //   });

  //   return count;
  // };

  const getFilledCount = (
    fields: IFieldConfig[],
    values: FormValues
  ): number => {
    let count = 0;
    fields.forEach((field) => {
      const val = values[field.name];
      if (field.type === 'whyInvested') {
        // Only the first entry (index 0) is required — the other 3 are
        // optional, so the progress bar should be satisfied by just that one.
        const first = Array.isArray(val) ? val[0] : undefined;
        if (first?.icon && first?.title && first?.description) {
          count++;
        }
      } else if (Array.isArray(val)) {
        if (val.length > 0) count++;
      } else if (val !== undefined && val !== null && val !== '') {
        count++;
      }
    });

    return count;
  };
  const values = watch();

  const requiredFields = getRequiredFields(
    [group1, group2, group3, group4],
    values
  );

  const filledCount = getFilledCount(requiredFields, values);

  const progress =
    requiredFields.length === 0
      ? 0
      : Math.round((filledCount / requiredFields.length) * 100);

  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
      // onSubmit={handleSubmit(async (data) => {
      //   await trigger(); // ✅ pehle saari errors show karo
      //   onSubmit(data);
      // })}
      onSubmit={handleSubmit(async (data) => {
        await trigger();

        const countryObj =
          countriesRes?.success === true
            ? countriesRes.data?.find((c: any) => c.isoCode === data.country)
            : undefined;

        const stateObj =
          statesRes?.success === true
            ? statesRes.data?.find((s: any) => s.code === data.state)
            : undefined;

        const transformedData = {
          ...data,
          country: countryObj?.name ?? data.country,
          state: stateObj?.name ?? data.state,
        };

        onSubmit(transformedData);
      })}
      className="w-full mx-auto  font-work bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] p-4 md:p-6 rounded-2xl"
    >
      <div className="mb-6">
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
      {renderSection(group1)}
      {renderSection(group2)}
      {renderSection(group3)}
      {renderSection(group4)}
      {!isValid && (
        <p className="text-red-600 text-14">
          * Please fill all required fields
        </p>
      )}
      <div className="w-full flex justify-end gap-4 mt-8">
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
          type="submit"
          variant={button.variant}
          // disabled={!isValid || isSubmitting}
          disabled={isSubmitting}
          className={`${onBack ? 'w-full sm:w-auto' : 'w-full sm:w-1/4'} px-10`}
        >
          {isSubmitting ? 'Uploading...' : button.label}
        </CustomButton>
      </div>
    </form>
  );
}
