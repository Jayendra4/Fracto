import { useEffect, useMemo, useState } from 'react';
import { useMyBankAccounts } from '@/api/common.api';
import AddBankAccountModal from './AddBankAccountModal';
import StatusModal from '@/components/Modals/Status';
import {
  useAddUpiAccount,
  useMyUpiAccount,
  type UpiAccount,
} from '@/api/upi.api';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useLocalUser } from '@/hooks/useLocalUser';
import { useInitiateDeposit } from '@/api/paymentRequest.api';
import Loader from '@/components/Loader';
import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';

type PaymentType = 'bank' | 'upi' | null;

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
}

export default function AddMoneyWallet({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>(null);
  const [upiId, setUpiId] = useState('');
  const [verifiedUpi, setVerifiedUpi] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { data: bankRes, isLoading: isBankLoading } = useMyBankAccounts();
  const { data: upiRes, isLoading: isUpiLoading } = useMyUpiAccount();
  const { mutateAsync: addUpi } = useAddUpiAccount();

  const { mutateAsync: initiateDeposit, isPending: isInitiating } =
    useInitiateDeposit();
  const { openRazorpayModal, isProcessing: isRazorpayLoading } = useRazorpay();
  const user = useLocalUser();
  const ITEMS_PER_PAGE = 4;
  const [bankPage, setBankPage] = useState(1);
  const [upiPage, setUpiPage] = useState(1);
  const [activeBankId, setActiveBankId] = useState<number | null>(null);
  const [activeUpiId, setActiveUpiId] = useState<string | null>(null);
  const [activeUpiAccountId, setActiveUpiAccountId] = useState<number | null>(
    null
  );

  const bankAccounts: BankAccount[] = useMemo(
    () =>
      bankRes?.success && Array.isArray(bankRes.data)
        ? bankRes.data.filter((b) => b.isActive)
        : [],
    [bankRes]
  );

  const selectedBank =
    bankAccounts.find((b) => b.id === activeBankId) || bankAccounts[0];

  const isSubmitDisabled =
    !amount ||
    Number(amount) <= 0 ||
    Number(amount) > 500000 ||
    !paymentType ||
    (paymentType === 'upi' && (!verifiedUpi || !activeUpiAccountId)) ||
    (paymentType === 'bank' && !selectedBank) ||
    isInitiating ||
    isRazorpayLoading;

  const isValidUpi = (upi: string) =>
    /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upi);

  const handleVerifyUpi = async () => {
    if (!isValidUpi(upiId)) return;

    try {
      setVerifyingUpi(true);

      const res = await addUpi(upiId);

      if (!res?.success) {
        throw new Error(res?.message || 'UPI verification failed');
      }

      setVerifiedUpi(true);
    } catch (err) {
      setVerifiedUpi(false);
      console.error(err);
    } finally {
      setVerifyingUpi(false);
    }
  };

  useEffect(() => {
    if (upiRes?.success && Array.isArray(upiRes.data)) {
      const startIndex = (upiPage - 1) * ITEMS_PER_PAGE;
      const firstUpi = upiRes.data[startIndex];
      if (firstUpi) {
        setActiveUpiAccountId(firstUpi.id);
        setActiveUpiId(firstUpi.upiId);
        setVerifiedUpi(true);
      }
    }
  }, [upiPage, upiRes]);

  useEffect(() => {
    const startIndex = (bankPage - 1) * ITEMS_PER_PAGE;
    const firstBank = bankAccounts[startIndex];
    if (firstBank) {
      setActiveBankId(firstBank.id);
    }
  }, [bankPage, bankAccounts]);

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      const initiateRes = (await initiateDeposit({
        amount: Number(amount),
        methodType: paymentType === 'bank' ? 'Bank' : 'Upi',
        ...(paymentType === 'bank' && { bankAccountId: selectedBank.id }),
        ...(paymentType === 'upi' && { upiAccountId: activeUpiAccountId! }),
      })) as {
        success: boolean;
        data?: {
          orderId: string;
          amount: number;
          currency: string;
          requestId: number;
        };
        message?: string;
      };

      if (!initiateRes?.success || !initiateRes.data?.orderId) {
        throw new Error(initiateRes?.message || 'Failed to initiate deposit');
      }

      const {
        orderId,
        amount: rzpAmount,
        currency,
        requestId,
      } = initiateRes.data;

      try {
        const razorpayRes = (await openRazorpayModal({
          method: paymentType as 'bank' | 'upi',
          orderData: {
            orderId: orderId,
            amount: rzpAmount,
            currency: currency || 'INR',
            requestId: requestId,
          },
          userData: {
            name: user?.firstname || '',
            email: user?.email || '',
            contact: user?.mobile || '',
          },
        })) as { success?: boolean };

        if (razorpayRes?.success) {
          setStatusType('success');
          setStatusMessage(
            'Payment verified and balance updated successfully.'
          );
          setStatusOpen(true);
        }
      } catch (rzpErr) {
        setStatusType('error');
        setStatusMessage(
          (rzpErr as Error)?.message ||
            'Razorpay payment could not be completed.'
        );
        setStatusOpen(true);
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(
        (err as Error)?.message ||
          'Something went wrong while processing the payment.'
      );
      setStatusOpen(true);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (upiRes?.success && Array.isArray(upiRes.data)) {
      const activeUpis = upiRes.data.filter((u: UpiAccount) => u.isActive);
      if (activeUpis.length > 0) {
        const activeUpi = activeUpis[0];

        if (activeUpi?.upiId) {
          setUpiId(activeUpi.upiId);
          setVerifiedUpi(true);
        }
      }
    }
  }, [upiRes]);

  const [openAddBank, setOpenAddBank] = useState(false);

  return (
    <div className="w-full h-full text-[var(--fg)] font-work relative">
      {(isInitiating || isRazorpayLoading) && (
        <div className="absolute inset-[-1.5rem] z-50 flex flex-col items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm rounded-b-xl border border-[var(--fg)]/5">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">
            {isInitiating ? 'Initiating Deposit...' : 'Processing Payment...'}
          </p>
        </div>
      )}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-ui pr-1">
        <div className="space-y-3">
          <AmountInput value={amount} onChange={(v: string) => setAmount(v)} />
          <AmountQuickSelect
            onSelect={(v: number) => setAmount(v.toString())}
          />
        </div>
        <div className="space-y-3">
          <PaymentOptionCard
            title="Online Bank Transfer"
            selected={paymentType === 'bank'}
            onClick={() => setPaymentType('bank')}
          >
            {paymentType === 'bank' &&
              (isBankLoading ? (
                <Loader isFullPage={false} />
              ) : bankAccounts.length > 0 ? (
                <>
                  {bankAccounts
                    .slice(
                      (bankPage - 1) * ITEMS_PER_PAGE,
                      bankPage * ITEMS_PER_PAGE
                    )
                    .map((bank) => (
                      <BankCard
                        key={bank.id}
                        bank={bank}
                        active={bank.id === activeBankId}
                        onSelect={() => setActiveBankId(bank.id)}
                      />
                    ))}

                  {bankAccounts.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center gap-3 mt-3">
                      <button
                        disabled={bankPage === 1}
                        onClick={() => setBankPage((p: number) => p - 1)}
                        className="px-3 py-1 text-xs border border-[var(--card)]/40 rounded-md disabled:opacity-40"
                      >
                        Prev
                      </button>

                      <button
                        disabled={
                          bankPage * ITEMS_PER_PAGE >= bankAccounts.length
                        }
                        onClick={() => setBankPage((p: number) => p + 1)}
                        className="px-3 py-1 text-xs border border-[var(--card)]/40 rounded-md disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="ml-[34px] font-14 mt-2 text-left text-[var(--fg)]/80">
                  You don’t have any bank account added with your wallet.
                  <br />
                  <button
                    onClick={() => setOpenAddBank(true)}
                    className="text-blue-500 hover:text-blue-600 transition-colors mt-1 font-medium underline underline-offset-2"
                  >
                    Add Bank Account
                  </button>
                </div>
              ))}
          </PaymentOptionCard>

          <PaymentOptionCard
            title="Online UPI Payment"
            selected={paymentType === 'upi'}
            onClick={() => setPaymentType('upi')}
          >
            {paymentType === 'upi' && (
              <>
                {isUpiLoading ? (
                  <Loader isFullPage={false} />
                ) : upiRes?.success &&
                  Array.isArray(upiRes.data) &&
                  upiRes.data.filter((u: UpiAccount) => u.isActive).length >
                    0 ? (
                  <>
                    {upiRes.data
                      .filter((u: UpiAccount) => u.isActive)
                      .slice(
                        (upiPage - 1) * ITEMS_PER_PAGE,
                        upiPage * ITEMS_PER_PAGE
                      )
                      .map(
                        (
                          u: { id: number | null; upiId: string },
                          idx: number
                        ) => (
                          <UpiCard
                            key={idx}
                            upi={u.upiId}
                            active={u.upiId === activeUpiId}
                            onSelect={() => {
                              setActiveUpiAccountId(u.id);
                              setActiveUpiId(u.upiId);
                              setVerifiedUpi(true);
                            }}
                          />
                        )
                      )}

                    {upiRes.data.filter((u: UpiAccount) => u.isActive).length >
                      ITEMS_PER_PAGE && (
                      <div className="flex justify-center gap-3 mt-3">
                        <button
                          disabled={upiPage === 1}
                          onClick={() => setUpiPage((p: number) => p - 1)}
                          className="px-3 py-1 text-xs border border-white/20 rounded-md disabled:opacity-40"
                        >
                          Prev
                        </button>

                        <button
                          disabled={
                            upiPage * ITEMS_PER_PAGE >=
                            upiRes.data.filter((u: UpiAccount) => u.isActive)
                              .length
                          }
                          onClick={() => setUpiPage((p: number) => p + 1)}
                          className="px-3 py-1 text-xs border border-white/20 rounded-md disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-4 p-4 rounded-xl border border-[var(--fg)]/10 bg-[var(--inner-card)]/30 flex flex-col gap-3">
                    <p className="font-14 text-[var(--fg)]/80 font-medium">
                      You don’t have any UPI ID added. Please verify one to
                      continue.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="w-full flex-1">
                        <CustomInput
                          label="Enter UPI ID"
                          type="text"
                          value={upiId}
                          onChange={(v) => setUpiId(v)}
                          placeholder="Ex: johndoe@okicici"
                        />
                      </div>
                      <CustomButton
                        disabled={!isValidUpi(upiId) || verifyingUpi}
                        onClick={handleVerifyUpi}
                        className="!mt-0 !w-full sm:!w-auto !py-[13px] !px-6 whitespace-nowrap lg:mb-[2px]"
                      >
                        {verifyingUpi ? 'Verifying...' : 'Verify'}
                      </CustomButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </PaymentOptionCard>
        </div>

        <button
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          className="w-full mt-6 px-6 py-3.5 font-16 font-semibold rounded-xl text-white bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] hover:shadow-lg hover:shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Proceed to Payment
        </button>
      </div>

      {openAddBank && (
        <AddBankAccountModal
          open={openAddBank}
          onClose={() => setOpenAddBank(false)}
        />
      )}

      <StatusModal
        open={statusOpen}
        status={statusType}
        title={
          statusType === 'success' ? 'Payment Submitted' : 'Payment Failed'
        }
        message={statusMessage}
        onClose={() => {
          setStatusOpen(false);
          if (statusType === 'success') {
            onClose();
          }
        }}
        onContinue={() => {
          setStatusOpen(false);
          if (statusType === 'success') {
            onClose();
          }
        }}
      />
    </div>
  );
}

export function AmountInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const numVal = Number(value);
  const MAX = 500000;
  const error =
    numVal > MAX
      ? `Maximum allowed amount is ₹${MAX.toLocaleString('en-IN')}`
      : null;

  return (
    <div className="space-y-2">
      <label className="text-[var(--fg)]/80 font-14 font-medium block">
        Amount to Add
      </label>
      <div
        className={`flex items-center border px-4 py-3 bg-[var(--inner-card)]/30 rounded-xl transition-all duration-300 group shadow-sm ${error ? 'border-red-500/60 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20' : 'border-[var(--fg)]/20 hover:border-[var(--fg)]/30 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20'}`}
      >
        <span
          className={`font-16 mr-2 transition-colors ${error ? 'text-red-400' : 'text-[var(--fg)]/60 group-focus-within:text-blue-500'}`}
        >
          ₹
        </span>
        <input
          placeholder="1,000"
          type="text"
          value={value ? Number(value).toLocaleString('en-IN') : ''}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-transparent outline-none text-[var(--fg)] font-medium font-16 placeholder:text-[var(--fg)]/30"
        />
      </div>
      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
    </div>
  );
}

const amounts = [10000, 50000, 100000];

export function AmountQuickSelect({
  onSelect,
}: {
  onSelect: (v: number) => void;
}) {
  return (
    <div className="flex gap-3 justify-center">
      {amounts.map((amt) => (
        <button
          key={amt}
          onClick={() => onSelect(amt)}
          className="px-3 sm:px-5 py-2 bg-[var(--inner-card)]/80 border border-[var(--fg)]/20 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-full font-14 cursor-pointer text-[var(--fg)] font-semibold transition-all duration-300 active:scale-95 shadow-sm"
        >
          + ₹ {amt.toLocaleString('en-IN')}
        </button>
      ))}
    </div>
  );
}

export function PaymentOptionCard({
  title,
  selected,
  onClick,
  children,
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-300
        ${
          selected
            ? 'border-[#60A5FA] bg-[#60A5FA]/10 shadow-[0_0_15px_rgba(96,165,250,0.15)] ring-1 ring-[#60A5FA]/50 text-[var(--fg)]'
            : 'border-[var(--fg)]/20 bg-[var(--inner-card)] hover:border-[var(--fg)]/40 hover:bg-[var(--card)] text-[var(--fg)]'
        }
    `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
            ${selected ? 'border-[2px] border-[#60A5FA] bg-[#60A5FA]/20' : 'border border-[var(--fg)]/40'}
        `}
        >
          {selected && (
            <div className="w-2.5 h-2.5 bg-[#60A5FA] rounded-full shadow-sm" />
          )}
        </div>
        <p className="font-medium  text-var(--fg)">{title}</p>
      </div>
      {children}
    </div>
  );
}

export function BankCard({
  bank,
  active,
  onSelect,
}: {
  bank: BankAccount;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`mt-4 border rounded-xl p-4 cursor-pointer transition-all duration-300
    ${
      active
        ? 'border-green-400 bg-green-400/10 shadow-sm ring-1 ring-green-400/30'
        : 'border-[var(--fg)]/10 bg-[var(--bg)]/40 hover:border-[var(--fg)]/30 hover:bg-[var(--card)]'
    }
    `}
    >
      <p className="font-medium font-16 text-[var(--fg)]/80">
        {bank.bankName} – ****{bank.accountNumber.slice(-4)}
      </p>
      <p className="text-[var(--fg)]/70 text-xs">{bank.accountHolderName}</p>
    </div>
  );
}

export function UpiCard({
  upi,
  active,
  onSelect,
}: {
  upi: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`mt-4 border rounded-xl p-4 cursor-pointer transition-all duration-300
    ${
      active
        ? 'border-green-400 bg-green-400/10 shadow-sm ring-1 ring-green-400/30'
        : 'border-[var(--fg)]/10 bg-[var(--bg)]/40 hover:border-[var(--fg)]/30 hover:bg-[var(--card)]'
    }
    `}
    >
      <p className="font-medium font-16 text-[var(--fg)]">UPI – {upi}</p>
      <p className="text-green-400 text-xs">Verified UPI</p>
    </div>
  );
}
