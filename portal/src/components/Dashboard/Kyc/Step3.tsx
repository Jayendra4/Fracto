/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';
import CustomSelect from '@/components/Base/CustomSelect';
import { useCountries, useStates, useCities } from '@/api/location.api';
import { useKycDocumentsUpload } from '@/hooks/useKycDocumentsUpload';
import type { Option } from './Step2';

import { useForm } from 'react-hook-form';
import RadioFileUpload from '@/components/DocumentsUploadStep/RadioFileUpload';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  updateKycData: (data: any) => void;
}

const INCOME_OPTIONS: Option[] = [
  { label: '₹25,000 or Less', value: '0-25000' },
  { label: '₹25,000 - ₹50,000', value: '25000-50000' },
  { label: '₹50,000 - ₹100,000', value: '50000-100000' },
  { label: '₹100,000 - ₹200,000', value: '100000-200000' },
  { label: '₹200,000 - ₹300,000', value: '200000-300000' },
  { label: '₹300,000 - ₹400,000', value: '300000-400000' },
  { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
];

export default function Step3({ onNext, onBack, updateKycData }: StepProps) {
  const kycData = useSelector((state: any) => state.userKycNew);
  const residentialAddress = kycData?.residentialAddress || {};

  const [address1, setAddress1] = useState(
    residentialAddress.addressLine1 || ''
  );
  const [address2, setAddress2] = useState(
    residentialAddress.addressLine2 || ''
  );
  const [country, setCountry] = useState<Option | null>(null);
  const [state, setState] = useState(residentialAddress.state || '');
  const [city, setCity] = useState(residentialAddress.city || '');
  const [pincode, setPincode] = useState(residentialAddress.pincode || '');
  const [income, setIncome] = useState<Option | null>(() =>
    kycData?.monthlyIncome
      ? INCOME_OPTIONS.find((o) => o.value === kycData.monthlyIncome) || null
      : null
  );

  const { data: countriesRes } = useCountries();
  const { data: statesRes } = useStates(country?.value as string);
  const { data: citiesRes } = useCities(country?.value as string, state);

  const countries =
    (countriesRes?.success === true ? countriesRes.data : []) || [];
  const states = (statesRes?.success === true ? statesRes.data : []) || [];
  const cities = (citiesRes?.success === true ? citiesRes.data : []) || [];

  const countryOptionsMap = useMemo(() => {
    return countries.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
  }, [countries]);

  const stateOptions = states.map((s: any) => ({
    label: s.name,
    value: s.code,
  }));

  const cityOptions = cities.map((c: any) => ({
    label: c.name,
    value: c.name,
  }));

  const [errors, setErrors] = useState({
    address1: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    income: '',
  });

  const { control, watch, setValue } = useForm({
    mode: 'onTouched',
  });

  useEffect(() => {
    setAddress1(residentialAddress.addressLine1 || '');
    setAddress2(residentialAddress.addressLine2 || '');
    setState(residentialAddress.state || '');
    setCity(residentialAddress.city || '');
    setPincode(residentialAddress.pincode || '');
  }, [
    residentialAddress.addressLine1,
    residentialAddress.addressLine2,
    residentialAddress.city,
    residentialAddress.pincode,
    residentialAddress.state,
  ]);

  useEffect(() => {
    setIncome(
      kycData?.monthlyIncome
        ? INCOME_OPTIONS.find((o) => o.value === kycData.monthlyIncome) || null
        : null
    );
  }, [kycData?.monthlyIncome]);

  const initialFilesMeta = useMemo(() => {
    if (kycData?.addressProofFile && kycData?.addressProofType) {
      return {
        addressProof: {
          url: URL.createObjectURL(kycData.addressProofFile),
          derivedId: kycData.addressProofType,
        },
      };
    }
    if (kycData?.addressProofFileUrl) {
      return {
        addressProof: {
          url: kycData.addressProofFileUrl,
          derivedId: kycData.addressProofType || undefined,
        },
      };
    }
    return undefined;
  }, [
    kycData?.addressProofFile,
    kycData?.addressProofFileUrl,
    kycData?.addressProofType,
  ]);

  const { files, filesMeta, fileError, handleFileSelected, handleClearFile } =
    useKycDocumentsUpload(initialFilesMeta);

  useEffect(() => {
    if (initialFilesMeta?.addressProof?.derivedId) {
      setValue('addressProof', initialFilesMeta.addressProof.derivedId);
    }
  }, [initialFilesMeta, setValue]);

  const addressProofDoc = {
    id: 'addressProof',
    label: 'Address Proof',
    required: true,
    type: 'radio-image' as const,
    options: [
      { label: 'Bank Statement', value: 'Bank Statement' },
      { label: 'Utility Bill', value: 'Utility Bill' },
      { label: 'Aadhaar XML', value: 'Aadhaar XML' },
    ],
  };

  function handleNext() {
    const newErrors = {
      address1: address1.length >= 5 ? '' : 'Address is required',
      city: city ? '' : 'City is required',
      state: state ? '' : 'State is required',
      pincode: /^\d{6}$/.test(pincode) ? '' : 'Pincode must be 6 digits',
      country: country ? '' : 'Country is required',
      income: income ? '' : 'Please select monthly income',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean) || !hasAddressProof) return;

    onNext();
  }

  const hasAddressProof = Boolean(
    files.addressProof || filesMeta.addressProof?.url
  );

  const isValid =
    address1 &&
    city &&
    state &&
    pincode.length === 6 &&
    hasAddressProof &&
    !!income;

  useEffect(() => {
    if (!countryOptionsMap.length) return;

    const preferredCountry =
      residentialAddress.country || residentialAddress.countryCode || 'India';
    const matchedCountry =
      countryOptionsMap.find(
        (c: any) =>
          c.value === preferredCountry ||
          c.label.toLowerCase() === String(preferredCountry).toLowerCase()
      ) ||
      countryOptionsMap.find(
        (c: any) => c.value === 'IN' || c.label === 'India'
      ) ||
      null;

    setCountry(matchedCountry);
  }, [
    countryOptionsMap,
    residentialAddress.country,
    residentialAddress.countryCode,
  ]);

  return (
    <div className="rounded-2xl border border-[var(--fg)]/10 p-4 lg:p-8 xl:p-10 bg-[var(--card)] text-[var(--fg)] font-work">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomInput
          label="Permanent Address"
          type="text"
          value={address1}
          onChange={(v) => {
            setAddress1(v);
            updateKycData({
              residentialAddress: { addressLine1: v },
            });
            setErrors((e) => ({
              ...e,
              address1:
                v.length >= 5 ? '' : 'Address must be at least 5 characters',
            }));
          }}
          onBlur={() => {
            setErrors((e) => ({
              ...e,
              address1: address1 ? '' : 'Address is required',
            }));
          }}
          placeholder="Enter Building / Street / Plot Number"
          error={errors.address1}
          required
        />

        <CustomInput
          label="Address Line 2"
          type="text"
          value={address2}
          onChange={(v) => {
            setAddress2(v);
            updateKycData({
              residentialAddress: {
                addressLine2: v,
              },
            });
          }}
          placeholder="Enter Landmark / Area"
        />

        <div>
          <label className="block h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
            Country <span className="text-red">*</span>
          </label>
          <CustomSelect
            isSearchable={true}
            value={country?.value || ''}
            options={countryOptionsMap}
            onChange={(selected) => {
              const opt =
                countryOptionsMap.find((c) => c.value === selected) || null;
              setCountry(opt);
              setState(''); // Reset state when country changes
              setCity(''); // Reset city when country changes
              setErrors((e) => ({ ...e, country: '' }));
              updateKycData({
                residentialAddress: {
                  country: opt?.label,
                  state: '',
                  city: '',
                },
              });
            }}
            placeholder="Select Country"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-500">{errors.country}</p>
          )}
        </div>

        <CustomSelect
          label="State"
          placeholder="Select State"
          isSearchable={true}
          value={state}
          options={stateOptions}
          error={errors.state}
          onChange={(v) => {
            const val = String(v);
            setState(val);
            setCity(''); // Reset city when state changes
            updateKycData({ residentialAddress: { state: val, city: '' } });

            setErrors((e: any) => ({
              ...e,
              state: val ? '' : 'State is required',
            }));
          }}
          required
        />

        <CustomSelect
          label="City"
          placeholder="Select City"
          isSearchable={true}
          value={city}
          options={cityOptions}
          error={errors.city}
          onChange={(v) => {
            const val = String(v);
            setCity(val);
            updateKycData({
              residentialAddress: { city: val },
            });
            setErrors((e: any) => ({
              ...e,
              city: val ? '' : 'City is required',
            }));
          }}
          required
        />

        <CustomInput
          label="Pincode"
          type="text"
          value={pincode}
          onChange={(v) => {
            const val = v.replace(/\D/g, '');
            setPincode(val);
            updateKycData({
              residentialAddress: { pincode: val },
            });
            setErrors((e) => ({
              ...e,
              pincode: /^\d{6}$/.test(val)
                ? ''
                : 'Pincode must be exactly 6 digits',
            }));
          }}
          onBlur={() => {
            setErrors((e) => ({
              ...e,
              pincode: pincode ? '' : 'Pincode is required',
            }));
          }}
          placeholder="Enter Pincode"
          error={errors.pincode}
          required
        />

        <div>
          <label className="block h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
            Monthly Income <span className="text-red">*</span>
          </label>
          <CustomSelect
            value={income?.value || ''}
            options={INCOME_OPTIONS}
            onChange={(val) => {
              const v = val as string;
              const opt = INCOME_OPTIONS.find((o) => o.value === v) || null;
              setIncome(opt);
              updateKycData({ monthlyIncome: v });
              setErrors((e) => ({ ...e, income: '' }));
            }}
            placeholder="Select Your Monthly Income"
          />
          {errors.income && (
            <p className="mt-1 text-sm text-red-500">{errors.income}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <RadioFileUpload
          docId={addressProofDoc.id}
          label={addressProofDoc.label}
          required
          options={addressProofDoc.options}
          files={files}
          filesMeta={filesMeta}
          error={fileError?.[addressProofDoc.id]}
          watch={watch}
          control={control}
          setValue={setValue}
          onChange={(derivedId, file) => {
            if (!file) {
              handleClearFile(derivedId, true);
              setValue(addressProofDoc.id, undefined);
              updateKycData({
                addressProofFile: null,
                addressProofType: '',
                addressProofFileUrl: undefined,
              });
              return;
            }

            // `derivedId` here is RadioFileUpload's constant docId
            // ("addressProof"), not the selected radio option — read the
            // actually-selected option (e.g. "Bank Statement") instead of
            // overwriting it, otherwise the radio's checked state is lost
            // right after upload.
            handleFileSelected(derivedId, file);

            updateKycData({
              addressProofFile: file,
              addressProofType: watch(addressProofDoc.id),
              addressProofFileUrl: undefined,
            });
          }}
        />
      </div>

      <div className="mt-10 flex justify-between">
        <button
          onClick={onBack}
          className="px-10 py-2.5 lg:px-14 rounded-xl border border-[var(--fg)]/10 hover:bg-[var(--fg)]/5 transition-all duration-300 font-medium"
        >
          Back
        </button>

        <CustomButton
          disabled={!isValid}
          onClick={handleNext}
          className="!mt-0 !px-16"
        >
          Next
        </CustomButton>
      </div>
    </div>
  );
}
