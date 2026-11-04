import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import CommonModal from '@/components/CommonModal';
import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';
import CustomSelect from '@/components/Base/CustomSelect';

type Props = {
  onClose: () => void;
};

type ReferralType = 'asset' | 'investor' | '';

export default function ReferalFormModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<ReferralType>('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  const referralCode = 'RK-INV-961';

  // useEffect for overflow is handled by CommonModal

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStep2Valid = form.name.trim() !== '' && form.email.trim() !== '';

  const handleSubmit = () => {
    if (!isStep2Valid) return;

    // Payload logging removed

    onClose();
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Create New Referral"
      className="max-w-lg"
    >
      <div className="border-b border-white/10 mb-4" />

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="font-18 font-medium mb-2 block text-[var(--fg)]">
              How Referral Is For? <span className="text-red-500">*</span>
            </label>

            <CustomSelect
              value={type}
              onChange={(val) => setType(val as ReferralType)}
              options={[
                { label: 'Select The User Type', value: '' },
                { label: 'Asset Owner Referrals', value: 'asset' },
                { label: 'Investor Referrals', value: 'investor' },
              ]}
              placeholder="Select The User Type"
            />
          </div>

          <CustomButton
            disabled={!type}
            onClick={() => setStep(2)}
            className="w-full !mt-6"
          >
            Continue
          </CustomButton>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 text-[var(--fg)] max-h-[60vh] overflow-y-auto scrollbar-ui mb-6 w-full">
          <div className="space-y-2">
            <label className="font-20">
              How Referral Is For? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-between font-16 border border-[var(--fg)]/20 rounded-md px-4 py-2 bg-[var(--fg)]/5">
              {type === 'asset'
                ? 'Asset Owner Referrals'
                : 'Investor Referrals'}
            </div>
          </div>

          <CustomInput
            label={type === 'asset' ? 'Asset Owner’s Name' : 'Investor’s Name'}
            type="text"
            value={form.name}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                name: v,
              }))
            }
            placeholder="Enter Name"
            required
          />

          <CustomInput
            label={
              type === 'asset' ? 'Asset Owner’s Email' : 'Investor’s Email'
            }
            type="email"
            value={form.email}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                email: v,
              }))
            }
            placeholder="Enter Email"
            required
          />

          <CustomInput
            label="Mobile Number"
            type="contact"
            value={form.mobile}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                mobile: v,
              }))
            }
            placeholder="Enter Mobile Number"
          />

          <div className="space-y-2 p-4 mt-2 bg-[var(--fg)]/8 w-full rounded-lg">
            <label className="font-20">Your Referral Code</label>
            <div className="flex flex-row gap-2 mt-2 justify-between items-center w-full">
              <div className="flex items-center justify-between gap-3 bg-[var(--fg)]/5 border border-[var(--fg)]/10 rounded-md p-2 w-full">
                <span className="font-16">{referralCode}</span>
              </div>
              <CustomButton
                onClick={copyCode}
                className="!mt-0 !py-2 !px-6 !rounded-xl"
              >
                <div className="flex items-center gap-2">
                  {copied ? <FiCheck /> : <FiCopy />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </div>
              </CustomButton>
            </div>
          </div>

          <p className="font-14 text-[var(--fg)]/60">
            <span className="font-medium text-[var(--fg)]/80">Next Steps:</span>{' '}
            The Investor will receive an email to approve this referral.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[var(--fg)]/10 hover:bg-[var(--fg)]/5 transition-all duration-300"
            >
              Back
            </button>
            <CustomButton
              disabled={!isStep2Valid}
              onClick={handleSubmit}
              className="w-full sm:w-1/2 !mt-0"
            >
              Send Referral
            </CustomButton>
          </div>
        </div>
      )}
    </CommonModal>
  );
}

//----------------- via custom form ----------------

// import { useState } from 'react';
// import { FiX } from 'react-icons/fi';

// import ReferralStepForm from './ReferralStepForm';
// import { getReferralStep1Fields } from '../referralStep1.fields';
// import { getReferralStep2Fields } from '../referralStep2.fields';
// import type { ReferralPayload, ReferralType } from '../referalType';

// export default function ReferralModal({ onClose }: { onClose: () => void }) {
//   const [step, setStep] = useState<1 | 2>(1);
//   const [formData, setFormData] = useState<Partial<ReferralPayload>>({});

//   const handleStep1Submit = (data: any) => {
//     setFormData(data);
//     setStep(2);
//   };

//   const handleStep2Submit = (data: any) => {
//     const payload: ReferralPayload = {
//       ...(formData as any),
//       ...data,
//     };

//     console.log('SEND REFERRAL:', payload);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-center bg-black/60">
//       <div className="w-full max-w-lg bg-[#041221] rounded-2xl mx-4">
//         {/* Header */}
//         <div className="flex justify-between p-4 border-b border-white/10">
//           <h2 className="font-24 text-white">Create New Referral</h2>
//           <button onClick={onClose}>
//             <FiX />
//           </button>
//         </div>

//         {/* Step 1 */}
//         {step === 1 && (
//           <ReferralStepForm
//             fields={getReferralStep1Fields()}
//             submitLabel="Continue"
//             onSubmit={handleStep1Submit}
//           />
//         )}

//         {/* Step 2 */}
//         {step === 2 && (<>
//           <ReferralStepForm
//             fields={getReferralStep2Fields(
//               formData.referralType as ReferralType
//             )}
//             submitLabel="Send Referral"
//             onSubmit={handleStep2Submit}
//           />

//         <div className="mt-4 p-4 bg-white/5 rounded-lg">
//           <label className="font-16 text-white mb-2 block">
//             Your Referral Code
//           </label>

//           <div className="flex items-center gap-3">
//             <div className="flex-1 px-4 py-2 border border-white/10 rounded-md text-white/80">
//               RK-INV-961
//             </div>

//             <button
//               type="button"

//               className="px-4 py-2 rounded-md bg-gradient-to-b from-[#4F86C0] to-[#2A5A8D]"
//             >
//               Copy
//             </button>
//           </div>
//         </div>

//         <div className="flex gap-3 mt-6">
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-1/2 py-2 border border-white/20 rounded-md"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             className="w-1/2 py-2 rounded-md bg-gradient-to-b from-[#4F86C0] to-[#2A5A8D]"
//           >
//             Send Referral
//           </button>
//         </div>

//         </>)}

//       </div>
//     </div>
//   );
// }
