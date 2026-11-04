import { useBankSubmit } from '@/api';
import { useState, useRef } from 'react';
import StatusModal from '@/components/Modals/Status';
import CommonModal from '@/components/CommonModal';
import CustomInput from '@/components/Base/CustomInput';
import CustomSelect from '@/components/Base/CustomSelect';
import { useBanks } from '@/api/bank.api';

interface AddBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddBankAccountModal({
  open,
  onClose,
  onSuccess,
}: AddBankAccountModalProps) {
  const { mutateAsync, isPending } = useBankSubmit();
  const { data: banksRes } = useBanks({ skip: 0, take: 100 });
  const bankOptions =
    banksRes?.success === true
      ? (banksRes.data?.data || []).map((b: any) => ({
        label: b.name,
        value: b.name,
      }))
      : [];

  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const formRef = useRef(form);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [statusMessage, setStatusMessage] = useState('');

  const [errors, setErrors] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [touched, setTouched] = useState({
    accountHolderName: false,
    bankName: false,
    accountNumber: false,
    ifscCode: false,
  });
  const getError = (key: keyof typeof errors) =>
    touched[key] ? errors[key] : '';

  const validateField = (key: keyof typeof form, value: string) => {
    let error = '';

    if (!value.trim()) {
      error = 'This field is required';
    } else {
      if (key === 'accountHolderName' && !/^[A-Za-z ]+$/.test(value)) {
        error = 'Only letters and spaces allowed';
      }

      if (key === 'bankName' && !/^[A-Za-z ]+$/.test(value)) {
        error = 'Only letters and spaces allowed';
      }

      if (key === 'accountNumber' && !/^\d{9,18}$/.test(value)) {
        error = 'Enter a valid account number';
      }

      if (
        key === 'ifscCode' &&
        !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())
      ) {
        error = 'Enter a valid IFSC code';
      }
    }

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const isFieldValid = (key: keyof typeof form, value: string) => {
    if (!value.trim()) return false;

    if (key === 'accountHolderName') return /^[A-Za-z ]+$/.test(value);
    if (key === 'accountNumber') return /^\d{9,18}$/.test(value);
    if (key === 'ifscCode')
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase());

    return true;
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    const newValue =
      key === 'ifscCode' ? value.replace(/\s/g, '').toUpperCase() : value;

    formRef.current[key] = newValue;

    setForm((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    validateField(key, newValue);
  };

  const isDisabled =
    !isFieldValid('accountHolderName', form.accountHolderName) ||
    !isFieldValid('bankName', form.bankName) ||
    !isFieldValid('accountNumber', form.accountNumber) ||
    !isFieldValid('ifscCode', form.ifscCode) ||
    isPending;

  const handleSubmit = async () => {
    try {
      const res = await mutateAsync(form);

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to add bank account');
      }

      setStatusType('success');
      setStatusMessage('Your bank account has been added successfully.');
      setStatusOpen(true);
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(
        err?.message || 'Failed to add bank account. Please try again.'
      );
      setStatusOpen(true);
    }
  };

  return (
    <div className="font-work">
      <CommonModal
        isOpen={open}
        onClose={onClose}
        title="Add Bank Account"
        className="max-w-[500px]"
        contentClassName="space-y-4 p-6"
      >
        {isPending && (
          <div className="absolute inset-[0px] z-[60] flex flex-col items-center justify-center bg-[var(--bg)]/70 backdrop-blur-md rounded-b-xl rounded-t-none">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">
              Securely linking account...
            </p>
          </div>
        )}
        <div className="mb-8">
          <p className="text-[var(--fg)]/60 font-16 tracking-wide">
            Link your bank account to start receiving payouts and managing
            investments seamlessly.
          </p>
        </div>

        <div className="space-y-4">
          <CustomInput
            label="Account Holder Name"
            type="text"
            placeholder="Enter The Account Holder Name"
            value={form.accountHolderName}
            error={getError('accountHolderName')}
            onChange={(v) => handleChange('accountHolderName', v)}
            onBlur={() => {
              setTouched((t) => ({ ...t, accountHolderName: true }));
              validateField(
                'accountHolderName',
                formRef.current.accountHolderName
              );
            }}
            required
          />

          <CustomSelect
            label="Bank Name"
            placeholder="Select Your Bank Name"
            value={form.bankName}
            options={bankOptions}
            error={getError('bankName')}
            onChange={(v) => handleChange('bankName', String(v))}
            onBlur={() => {
              setTouched((t) => ({ ...t, bankName: true }));
              validateField('bankName', formRef.current.bankName);
            }}
            required
          />

          <CustomInput
            label="Bank Account Number"
            type="text"
            placeholder="Enter Your Bank Account Number"
            value={form.accountNumber}
            error={getError('accountNumber')}
            onChange={(v) => handleChange('accountNumber', v)}
            onBlur={() => {
              setTouched((t) => ({ ...t, accountNumber: true }));
              validateField('accountNumber', formRef.current.accountNumber);
            }}
            required
          />

          <CustomInput
            label="IFSC Code"
            type="text"
            placeholder="Enter Your IFSC Code"
            value={form.ifscCode}
            error={getError('ifscCode')}
            onChange={(v) => handleChange('ifscCode', v)}
            onBlur={() => {
              setTouched((t) => ({ ...t, ifscCode: true }));
              validateField('ifscCode', formRef.current.ifscCode);
            }}
            required
          />
        </div>

        <button
          disabled={isDisabled}
          onClick={handleSubmit}
          className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3.5 font-16 font-semibold rounded-xl text-white bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] hover:shadow-lg hover:shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </CommonModal>

      <StatusModal
        open={statusOpen}
        status={statusType}
        title={statusType === 'success' ? 'Bank Added' : 'Error'}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
        onContinue={() => {
          setStatusOpen(false);

          if (statusType === 'success') {
            onClose();
            onSuccess?.();
          }
        }}
      />
    </div>
  );
}
