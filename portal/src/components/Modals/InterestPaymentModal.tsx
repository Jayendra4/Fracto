import { useEffect, useState } from 'react';
import CommonModal from '@/components/CommonModal';
import CustomInput from '@/components/Base/CustomInput';
import StatusModal from '@/components/Modals/Status';
import { FiCopy, FiEdit3, FiShield, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { uploadFileApi } from '@/api/common.api';
import {
  submitManualPaymentInterestApi,
  submitManualDepositApi,
} from '@/api/group.api';

// TODO: replace with the platform's real bank/UPI details once an API for
// this exists — placeholders for now so the payment popup is functional.
const BANK_DETAILS = {
  accountNumber: '123456789012',
  accountOwnerName: 'Fracto Pvt Ltd',
  ifscCode: 'HDFC0000123',
  branchName: 'Mumbai Fort Branch',
};

const QR_IMAGE_URL = '/images/qrpay.png';

type PaymentType = 'intrest' | 'deposit' | 'unlock';

interface InterestPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type?: PaymentType;
  assetId?: number | string;
  onSuccess: () => void;
  amount?: string | number | null;
}

interface VerifyForm {
  name: string;
  mobile: string;
  email: string;
  amount: string;
  utr: string;
}

const EMPTY_FORM: VerifyForm = {
  name: '',
  mobile: '',
  email: '',
  amount: '',
  utr: '',
};

const EMPTY_ERRORS: Record<keyof VerifyForm, string> = {
  name: '',
  mobile: '',
  email: '',
  amount: '',
  utr: '',
};

const validateField = (
  key: keyof VerifyForm,
  value: string,
  maxAmount?: number
): string => {
  const trimmed = value.trim();
  if (!trimmed) return 'This field is required';

  switch (key) {
    case 'name':
      return /^[A-Za-z ]+$/.test(trimmed)
        ? ''
        : 'Only letters and spaces allowed';
    case 'mobile':
      return /^[6-9]\d{9}$/.test(trimmed)
        ? ''
        : 'Enter a valid 10-digit mobile number';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ''
        : 'Enter a valid email address';
    case 'amount':
      if (!/^\d+(\.\d{1,2})?$/.test(trimmed) || Number(trimmed) <= 0) {
        return 'Enter a valid amount';
      }
      if (maxAmount !== undefined && Number(trimmed) > maxAmount) {
        return `Amount cannot exceed ₹${maxAmount.toLocaleString('en-IN')}`;
      }
      return '';
    case 'utr':
      return trimmed.length >= 6 ? '' : 'Enter a valid UTR / Payment ID';
    default:
      return '';
  }
};

export default function InterestPaymentModal({
  open,
  onClose,
  type = 'intrest',
  assetId,
  onSuccess,
  amount,
}: InterestPaymentModalProps) {
  const isDeposit = type === 'deposit';
  const isUnlock = type === 'unlock';
  const [activeTab, setActiveTab] = useState<'bank' | 'qr'>('bank');
  const [step, setStep] = useState<'docusign' | 'pay' | 'form'>(
    isUnlock ? 'docusign' : 'pay'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [signName, setSignName] = useState('');
  const [signature, setSignature] = useState('');
  const [signAgreed, setSignAgreed] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    message: string;
  }>({ open: false, status: 'success', title: '', message: '' });
  const [form, setForm] = useState<VerifyForm>(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [touched, setTouched] = useState<Record<keyof VerifyForm, boolean>>({
    name: false,
    mobile: false,
    email: false,
    amount: false,
    utr: false,
  });
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState('');
  const [screenshotUploadedUrl, setScreenshotUploadedUrl] = useState('');
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotError, setScreenshotError] = useState('');

  const resetScreenshot = () => {
    setScreenshotName('');
    setScreenshotPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
    setScreenshotUploadedUrl('');
    setScreenshotUploading(false);
    setScreenshotError('');
  };

  const maxAmount =
    amount !== undefined && amount !== null && amount !== ''
      ? Number(amount)
      : undefined;

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        amount: maxAmount !== undefined ? String(maxAmount) : '',
      });
    } else {
      setActiveTab('bank');
      setStep(isUnlock ? 'docusign' : 'pay');
      setForm(EMPTY_FORM);
      setErrors(EMPTY_ERRORS);
      setTouched({
        name: false,
        mobile: false,
        email: false,
        amount: false,
        utr: false,
      });
      resetScreenshot();
      setConsentChecked(false);
      setSignName('');
      setSignature('');
      setSignAgreed(false);
    }
  }, [open, maxAmount, isUnlock]);

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleChange = (key: keyof VerifyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: validateField(key, value, maxAmount),
      }));
    }
  };

  const handleBlur = (key: keyof VerifyForm) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, form[key], maxAmount),
    }));
  };

  const handleScreenshotChange = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScreenshotError('Only image files are allowed');
      return;
    }

    resetScreenshot();
    setScreenshotName(file.name);
    setScreenshotPreviewUrl(URL.createObjectURL(file));
    setScreenshotUploading(true);

    try {
      const res = await uploadFileApi(file);
      if (!res?.success || !res.data?.url) {
        throw new Error(res?.message || 'Upload failed');
      }
      setScreenshotUploadedUrl(res.data.url);
    } catch (err) {
      setScreenshotError(
        err instanceof Error ? err.message : 'Failed to upload screenshot'
      );
      toast.error('Failed to upload screenshot');
    } finally {
      setScreenshotUploading(false);
    }
  };

  const handleSubmit = async () => {
    const fieldKeys = Object.keys(form) as (keyof VerifyForm)[];
    const nextErrors = { ...errors };
    let hasError = false;

    fieldKeys.forEach((key) => {
      const err = validateField(key, form[key], maxAmount);
      nextErrors[key] = err;
      if (err) hasError = true;
    });

    setErrors(nextErrors);
    setTouched({
      name: true,
      mobile: true,
      email: true,
      amount: true,
      utr: true,
    });

    if (screenshotUploading) {
      hasError = true;
    } else if (!screenshotUploadedUrl) {
      setScreenshotError('Payment screenshot is required');
      hasError = true;
    }

    if (isUnlock && !consentChecked) {
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        amount: Number(form.amount),
        utrNumber: form.utr.trim(),
        screenshot:
          screenshotUploadedUrl.split('/').pop() ?? screenshotUploadedUrl,
        ...(isUnlock ? { consent: consentChecked } : {}),
      };

      const res = isDeposit
        ? await submitManualDepositApi({ ...payload, methodType: 'Bank' })
        : await submitManualPaymentInterestApi(
            assetId as number | string,
            payload
          );

      if (!res?.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Payment Failed',
          message:
            res?.message ||
            'We could not verify your payment. Please check the details and try again.',
        });
        return;
      }

      setStatusModal({
        open: true,
        status: 'success',
        title: 'Payment Submitted',
        message: isDeposit
          ? 'Your payment details have been submitted and are pending verification. Once verified, the amount will be added to your wallet.'
          : isUnlock
            ? 'Your payment details have been submitted and are pending verification. Once verified, the property documents will be unlocked.'
            : 'Your payment details have been submitted and are pending verification. Once your payment is verified, this asset will be added to your My Club section.',
      });
    } catch {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Payment Failed',
        message:
          'Something went wrong while submitting your payment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CommonModal
        isOpen={open}
        onClose={onClose}
        title={
          step === 'docusign'
            ? 'Sign Document Access Agreement'
            : step === 'pay'
              ? isDeposit
                ? 'Add Money to Wallet'
                : isUnlock
                  ? 'Document Unlock Fee'
                  : 'Pay Interest Fee'
              : 'Verify Payment'
        }
        className="max-w-[440px] mx-auto"
        contentClassName="p-6 pt-2"
      >
        {step === 'docusign' ? (
          <div className="space-y-4">
            <div className="border border-[#E3E7EE] dark:border-white/10 rounded-xl p-4 space-y-2 bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
                <FiEdit3 className="text-[#1F4FE0]" size={16} />
                <span className="font-16 font-bold text-[#1F4FE0]">
                  DocuSign
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Document Access Agreement
                </span>
              </div>
              <p className="font-12 text-gray-500 dark:text-gray-400 leading-relaxed">
                By signing below, you authorize the assigned
                document-verification team to access and review this
                property&apos;s documents on your behalf.
              </p>
            </div>

            <CustomInput
              label="Full Legal Name"
              type="text"
              placeholder="Enter your full name"
              value={signName}
              onChange={setSignName}
              required
            />

            <div>
              <label className="font-14 text-gray-600 dark:text-gray-300 block mb-1.5">
                Signature <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your name to sign"
                className="w-full border border-[#E3E7EE] dark:border-white/10 rounded-lg px-4 py-3 italic font-24 text-[#0B2545] dark:text-white placeholder:not-italic placeholder:font-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1F4FE0] bg-transparent"
                style={{ fontFamily: 'cursive' }}
              />
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Date: {new Date().toLocaleDateString('en-IN')}
            </p>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={signAgreed}
                onChange={(e) => setSignAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1F4FE0] cursor-pointer"
              />
              <span className="font-13 text-gray-700 dark:text-gray-300">
                I agree to sign this document electronically.
              </span>
            </label>

            <button
              type="button"
              onClick={() => setStep('pay')}
              disabled={!signName.trim() || !signature.trim() || !signAgreed}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-16 font-semibold transition hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign & Continue
            </button>
            <button
              type="button"
              onClick={() => setStep('pay')}
              className="w-full text-center text-[12px] font-semibold text-gray-400 dark:text-gray-500 hover:text-[#1F4FE0] transition"
            >
              Skip for now
            </button>
          </div>
        ) : step === 'pay' ? (
          <>
            {amount !== undefined && amount !== null && amount !== '' && (
              <div className="bg-[#1F4FE0]/10 border border-[#1F4FE0]/20 rounded-lg px-4 py-3 mb-4 text-center">
                <p className="text-[11px] text-[var(--fg)]/60 uppercase tracking-wide">
                  Amount to Pay
                </p>
                <p className="font-20 font-bold text-[#1F4FE0]">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                className={`flex-1 py-2 rounded-lg font-14 font-semibold transition ${
                  activeTab === 'bank'
                    ? 'bg-[#1F4FE0] text-white'
                    : 'bg-[var(--fg)]/5 text-[var(--fg)]/70'
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 rounded-lg font-14 font-semibold transition ${
                  activeTab === 'qr'
                    ? 'bg-[#1F4FE0] text-white'
                    : 'bg-[var(--fg)]/5 text-[var(--fg)]/70'
                }`}
              >
                Scan QR
              </button>
            </div>

            {activeTab === 'bank' ? (
              <div className="space-y-3">
                {(
                  [
                    ['Account Number', BANK_DETAILS.accountNumber],
                    ['Account Owner Name', BANK_DETAILS.accountOwnerName],
                    ['IFSC Code', BANK_DETAILS.ifscCode],
                    ['Branch Name', BANK_DETAILS.branchName],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 bg-[var(--fg)]/5 rounded-lg px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] text-[var(--fg)]/50 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="font-14 font-semibold text-[var(--fg)] truncate">
                        {value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(label, value)}
                      className="shrink-0 text-[var(--fg)]/50 hover:text-[#1F4FE0] transition p-1.5 rounded-full hover:bg-[var(--fg)]/5"
                      title={`Copy ${label}`}
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-48 h-48 rounded-xl overflow-hidden border border-[var(--fg)]/10 bg-white flex items-center justify-center">
                  <img
                    src={QR_IMAGE_URL}
                    alt="Scan to pay"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-[13px] text-[var(--fg)]/60 text-center">
                  Scan this QR with any UPI app to pay
                </p>
              </div>
            )}

            <p className="text-[12px] text-[var(--fg)]/60 text-center mt-5">
              {isDeposit
                ? 'Please complete the payment using the details above, then click below. Your wallet will only be credited once the payment is verified.'
                : isUnlock
                  ? 'Please complete the payment using the details above, then click below. Your documents will only be unlocked once the payment is verified.'
                  : 'Please complete the payment using the details above, then click below. Your interest will only be recorded once the payment is verified.'}
            </p>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-16 font-semibold transition hover:brightness-110 active:scale-95 shadow-lg"
            >
              Payment Verify
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep('pay')}
              className="text-[12px] font-semibold text-[#1F4FE0] hover:underline"
            >
              ← Back to payment details
            </button>

            <CustomInput
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={form.name}
              error={touched.name ? errors.name : ''}
              onChange={(v) => handleChange('name', v)}
              onBlur={() => handleBlur('name')}
              required
            />
            <CustomInput
              label="Mobile"
              type="text"
              placeholder="Enter your mobile number"
              value={form.mobile}
              error={touched.mobile ? errors.mobile : ''}
              onChange={(v) => handleChange('mobile', v.replace(/\D/g, ''))}
              onBlur={() => handleBlur('mobile')}
              required
            />
            <CustomInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              error={touched.email ? errors.email : ''}
              onChange={(v) => handleChange('email', v)}
              onBlur={() => handleBlur('email')}
              required
            />
            <CustomInput
              label="Amount"
              type="text"
              placeholder="Enter amount paid"
              value={form.amount}
              error={touched.amount ? errors.amount : ''}
              onChange={(v) => handleChange('amount', v)}
              onBlur={() => handleBlur('amount')}
              disabled={maxAmount !== undefined}
              required
            />
            <CustomInput
              label="UTR / Payment ID"
              type="text"
              placeholder="Enter UTR or payment reference ID"
              value={form.utr}
              error={touched.utr ? errors.utr : ''}
              onChange={(v) => handleChange('utr', v)}
              onBlur={() => handleBlur('utr')}
              required
            />

            <div>
              <label className="font-14 text-[var(--fg)]/70 block mb-1.5">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>

              {screenshotPreviewUrl ? (
                <div
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${
                    screenshotError ? 'border-red-500' : 'border-[var(--fg)]/20'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[var(--fg)]/5">
                    <img
                      src={screenshotPreviewUrl}
                      alt={screenshotName}
                      className="w-full h-full object-cover"
                    />
                    {screenshotUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-13 text-[var(--fg)] truncate">
                      {screenshotName}
                    </p>
                    <p className="text-[11px] text-[var(--fg)]/50">
                      {screenshotUploading
                        ? 'Uploading...'
                        : screenshotUploadedUrl
                          ? 'Uploaded'
                          : 'Upload failed'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetScreenshot}
                    className="shrink-0 text-[var(--fg)]/50 hover:text-red-500 transition p-1.5 rounded-full hover:bg-[var(--fg)]/5"
                    title="Remove"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex items-center gap-2 justify-center border border-dashed rounded-lg px-4 py-3 cursor-pointer transition ${
                    screenshotError
                      ? 'border-red-500'
                      : 'border-[var(--fg)]/20 hover:border-[#1F4FE0]'
                  }`}
                >
                  <FiUpload size={16} className="text-[var(--fg)]/60" />
                  <span className="font-13 text-[var(--fg)]/70 truncate">
                    Upload screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      handleScreenshotChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              )}

              {screenshotError && (
                <p className="text-red-500 text-[12px] mt-1">
                  {screenshotError}
                </p>
              )}
            </div>

            {isUnlock && (
              <div className="flex gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4">
                <FiShield
                  className="text-[#1F4FE0] shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <p className="font-13 text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                    This property documents will be viewed by a specific group
                    of people that will be assigned by admin. This group of
                    people will ensure that all documents are verified
                    successfully.
                  </p>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#1F4FE0] cursor-pointer"
                    />
                    <span className="font-13 text-gray-700 dark:text-gray-300">
                      I have read and understood the above, and I consent to the
                      assigned reviewers verifying these documents.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                screenshotUploading ||
                (isUnlock && !consentChecked)
              }
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-16 font-semibold transition hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Submit & Verify'
              )}
            </button>
          </div>
        )}
      </CommonModal>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => {
          setStatusModal((prev) => ({ ...prev, open: false }));
          if (statusModal.status === 'success') {
            onSuccess();
          }
        }}
      />
    </>
  );
}
