import { useState } from 'react';
import { useAddUpiAccount } from '@/api/upi.api';
import CommonModal from '@/components/CommonModal';
import CustomInput from '@/components/Base/CustomInput';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddUpiModal({ open, onClose }: Props) {
  const [upiId, setUpiId] = useState('');
  const { mutate, isPending } = useAddUpiAccount();

  const handleSubmit = () => {
    if (!upiId) return;
    mutate(upiId, {
      onSuccess: () => {
        setUpiId('');
        onClose();
      },
    });
  };

  return (
    <CommonModal
      isOpen={open}
      onClose={onClose}
      title="Link UPI ID"
      className="max-w-md"
      contentClassName="p-6 md:p-8 relative"
    >
      {isPending && (
        <div className="absolute inset-[-1px] z-[60] flex flex-col items-center justify-center bg-[var(--bg)]/70 backdrop-blur-md rounded-b-xl rounded-t-none">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">Linking UPI ID...</p>
        </div>
      )}
      <div className="mb-8">
        <p className="text-[var(--fg)]/60 font-16 tracking-wide">
          Link your UPI ID for quick and secure transactions directly to your account.
        </p>
      </div>

      <CustomInput
        label="UPI ID"
        type="text"
        value={upiId}
        onChange={(v) => setUpiId(v)}
        placeholder="e.g. username@bank"
        required
      />

      <div className="flex justify-end gap-3 mt-10">
        <button
          onClick={onClose}
          className="px-6 py-2.5 font-16 font-semibold rounded-xl text-[var(--fg)] border border-[var(--fg)]/10 bg-[var(--fg)]/5 hover:bg-[var(--fg)]/10 transition-all duration-300 active:scale-[0.98]"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isPending || !upiId}
          className="px-6 py-2.5 font-16 font-semibold rounded-xl text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:shadow-lg hover:shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
        >
          Link UPI ID
        </button>
      </div>
    </CommonModal>
  );
}
