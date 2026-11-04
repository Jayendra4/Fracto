import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
// import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';
import CustomSelect from '@/components/Base/CustomSelect';

type KycUpdatePayload = {
  occupation?: string;
  occupationIndustry?: string;
  monthlyIncome?: string;
};

export interface Option {
  label: string;
  value: string;
}

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  updateKycData: (data: KycUpdatePayload) => void;
}

export default function Step2({ onNext, onBack, updateKycData }: StepProps) {
  const incomeOptions: Option[] = useMemo(
    () => [
      { label: '₹25,000 or Less', value: '0-25000' },
      { label: '₹25,000 - ₹50,000', value: '25000-50000' },
      { label: '₹50,000 - ₹100,000', value: '50000-100000' },
      { label: '₹100,000 - ₹200,000', value: '100000-200000' },
      { label: '₹200,000 - ₹300,000', value: '200000-300000' },
      { label: '₹300,000 - ₹400,000', value: '300000-400000' },
      { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
    ],
    []
  );

  const kycData = useSelector((state: RootState) => state.userKycNew);
  // Occupation / Occupation Industry fields are no longer collected in this
  // step (moved out per product request) — state kept commented for reference.
  // const [occupation, setOccupation] = useState<string>(kycData.occupation || '');
  // const [industry, setIndustry] = useState<string>(kycData.occupationIndustry || '');
  const [income, setIncome] = useState<Option | null>(() => {
    return kycData.monthlyIncome
      ? incomeOptions.find((o) => o.value === kycData.monthlyIncome) || null
      : null;
  });

  const [errors, setErrors] = useState({
    // occupation: '',
    // industry: '',
    income: '',
  });

  // const onlyLettersAndSpaces = /^[A-Za-z ]*$/;
  const isValid = !!income;

  useEffect(() => {
    setIncome(
      kycData.monthlyIncome
        ? incomeOptions.find((o) => o.value === kycData.monthlyIncome) || null
        : null
    );
  }, [incomeOptions, kycData.monthlyIncome]);

  function handleNext() {
    const newErrors = {
      // occupation: '',
      // industry: '',
      income: '',
    };

    // if (!occupation.trim()) {
    //   newErrors.occupation = 'Please enter occupation';
    // }

    // if (!industry.trim()) {
    //   newErrors.industry = 'Please enter occupation industry';
    // }

    if (!income) {
      newErrors.income = 'Please select monthly income';
    }

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }
    onNext();
  }

  return (
    <div className="rounded-2xl border border-[var(--fg)]/10 p-4 lg:p-8 xl:p-10 bg-[var(--card)] text-[var(--fg)] font-work">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occupation / Occupation Industry — no longer collected here.
        <CustomInput
          label="Occupation"
          type="text"
          value={occupation}
          onChange={(v) => {
            if (!onlyLettersAndSpaces.test(v)) {
              setErrors((e) => ({
                ...e,
                occupation: 'Only alphabets and spaces are allowed',
              }));
              return;
            }
            setOccupation(v);
            updateKycData({ occupation: v });
            setErrors((e) => ({ ...e, occupation: '' }));
          }}
          onBlur={() => {
            if (!occupation.trim()) {
              setErrors((e) => ({
                ...e,
                occupation: 'Occupation is required',
              }));
            }
          }}
          placeholder="Enter your occupation"
          error={errors.occupation}
          required
        />

        <CustomInput
          label="Occupation Industry"
          type="text"
          value={industry}
          onChange={(v) => {
            if (!onlyLettersAndSpaces.test(v)) {
              setErrors((e) => ({
                ...e,
                industry: 'Only alphabets and spaces are allowed',
              }));
              return;
            }
            setIndustry(v);
            updateKycData({ occupationIndustry: v });
            setErrors((e) => ({ ...e, industry: '' }));
          }}
          onBlur={() => {
            if (!industry.trim()) {
              setErrors((e) => ({
                ...e,
                industry: 'Occupation industry is required',
              }));
            }
          }}
          placeholder="Enter your occupation industry"
          error={errors.industry}
          required
        />
        */}

        <div className="md:col-span-1">
          <label className="block h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
            Monthly Income <span className="text-red">*</span>
          </label>
          <CustomSelect
            value={income?.value || ''}
            options={incomeOptions}
            onChange={(val) => {
              const v = val as string;
              const opt = incomeOptions.find((o) => o.value === v) || null;
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
