import { useEffect, useMemo, useState } from 'react';

import { useMyBankAccounts } from '@/api/common.api';
import { useInitiateDeposit } from '@/api/paymentRequest.api';
import { useMyWallet } from '@/api/wallet.api';
import {
  useMyUpiAccount,
  useAddUpiAccount,
  type UpiAccount,
} from '@/api/upi.api';
import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';
import Loader from '@/components/Loader';
import {
  BankCard,
  PaymentOptionCard,
  UpiCard,
} from '@/components/Dashboard/Wallet/AddMoneyWallet';
import AddBankAccountModal from '@/components/Dashboard/Wallet/AddBankAccountModal';
import CommonModal from '@/components/CommonModal';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useLocalUser } from '@/hooks/useLocalUser';

interface BuyFractionModalProps {
  open: boolean;
  requiredAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
}

const QUICK_AMOUNTS = [10000, 25000, 50000];

export default function BuyFractionModal({
  open,
  requiredAmount,
  onClose,
  onSuccess,
}: BuyFractionModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'bank' | 'upi'>('bank');

  const [openAddBank, setOpenAddBank] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [verifiedUpi, setVerifiedUpi] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [activeUpiId, setActiveUpiId] = useState<string | null>(null);
  const [activeUpiAccountId, setActiveUpiAccountId] = useState<number | null>(
    null
  );
  const [upiPage, setUpiPage] = useState(1);

  const { data: bankRes } = useMyBankAccounts();
  const { data: upiRes, isLoading: isUpiLoading } = useMyUpiAccount();
  const { mutateAsync: addUpi } = useAddUpiAccount();
  const { data: walletRes } = useMyWallet();
  const { mutateAsync: initiateDeposit, isPending: isInitiating } =
    useInitiateDeposit();
  const { openRazorpayModal, isProcessing: isRazorpayLoading } = useRazorpay();
  const user = useLocalUser();
  const ITEMS_PER_PAGE = 4;

  const [bankPage, setBankPage] = useState(1);

  const banks: BankAccount[] = useMemo(
    () =>
      bankRes?.success
        ? bankRes.data.filter((b: BankAccount) => b.isActive)
        : [],
    [bankRes]
  );

  const walletBalance = walletRes?.data?.availableBalance ?? 0;

  const hasValidAmount = typeof amount === 'number' && amount > 0;

  const selectedBank = useMemo(
    () => banks.find((b) => b.id === selectedBankId) ?? null,
    [banks, selectedBankId]
  );

  const canProceed =
    hasValidAmount &&
    ((paymentType === 'bank' && selectedBank !== null) ||
      (paymentType === 'upi' && verifiedUpi && activeUpiAccountId !== null));

  const shortfall = useMemo(
    () => Math.max(0, requiredAmount - walletBalance),
    [requiredAmount, walletBalance]
  );

  const isValidUpi = (upi: string) =>
    /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upi);

  const handleVerifyUpi = async () => {
    if (!isValidUpi(upiId)) return;

    try {
      setVerifyingUpi(true);
      const res = await addUpi(upiId);
      if (!res?.success)
        throw new Error(res?.message || 'UPI verification failed');
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

  useEffect(() => {
    if (upiRes?.success && Array.isArray(upiRes.data)) {
      const activeUpis = upiRes.data.filter((u: UpiAccount) => u.isActive);
      const startIndex = (upiPage - 1) * ITEMS_PER_PAGE;
      const firstUpi = activeUpis[startIndex];
      if (firstUpi) {
        setActiveUpiAccountId(firstUpi.id);
        setActiveUpiId(firstUpi.upiId);
        setVerifiedUpi(true);
      }
    }
  }, [upiPage, upiRes]);

  useEffect(() => {
    const startIndex = (bankPage - 1) * ITEMS_PER_PAGE;
    const firstBank = banks[startIndex];
    if (firstBank) {
      setSelectedBankId(firstBank.id);
    }
  }, [bankPage, banks]);

  useEffect(() => {
    if (banks.length > 0 && selectedBankId === null) {
      setSelectedBankId(banks[0].id);
    }
  }, [banks, selectedBankId]);

  const handleQuickAdd = (val: number) => {
    setAmount((prev) => (typeof prev === 'number' ? prev + val : val));
  };

  const autofillShortfall = () => {
    if (shortfall > 0) setAmount(shortfall);
  };

  const handleProceed = async () => {
    setError(null);

    if (!canProceed || (paymentType === 'bank' && !selectedBank)) {
      setError('Please enter amount and complete payment setup');
      return;
    }

    try {
      const initiateRes = await initiateDeposit({
        amount: Number(amount),
        methodType: paymentType === 'bank' ? 'Bank' : 'Upi',
        ...(paymentType === 'bank' && { bankAccountId: selectedBank!.id }),
        ...(paymentType === 'upi' && { upiAccountId: activeUpiAccountId! }),
      });

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
        const razorpayRes = await openRazorpayModal({
          method: paymentType,
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
        });

        if (razorpayRes?.success) {
          onClose();
          onSuccess();
        }
      } catch (rzpErr) {
        setError(
          rzpErr instanceof Error
            ? rzpErr.message
            : 'Razorpay payment failed or was cancelled.'
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add money. Please try again.'
      );
    }
  };

  if (!open) return null;

  return (
    <>
      <CommonModal
        isOpen={open}
        onClose={onClose}
        title="Add Money to Wallet"
        className="max-w-[560px] mx-auto"
        contentClassName="relative"
      >
        {(isInitiating || isRazorpayLoading) && (
          <div className="absolute inset-[-1.5rem] z-50 flex flex-col items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm rounded-b-xl border border-[var(--fg)]/5">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">
              {isInitiating ? 'Initiating Deposit...' : 'Processing Payment...'}
            </p>
          </div>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-ui p-6">
          <p className="text-[var(--fg)]/60 text-sm mb-4">
            We need to add your bank account to start your investment journey!
          </p>

          <div className="bg-[var(--fg)]/10 h-[1px] w-full mb-2" />

          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-[var(--fg)]/60 font-medium">
              Wallet Balance
            </p>
            <span className="text-[var(--fg)] font-bold font-18">
              ₹{walletBalance.toLocaleString()}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-[var(--fg)]/80 font-14 font-medium block">
                Enter Amount (Max- ₹5,00,000)
              </label>
              <div className="flex items-center border border-[var(--fg)]/20 px-4 py-3 bg-[var(--inner-card)]/30 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300 group hover:border-[var(--fg)]/30 shadow-sm">
                <span className="text-[var(--fg)]/60 font-16 mr-2 group-focus-within:text-blue-500 transition-colors">
                  ₹
                </span>
                <input
                  placeholder="1,000"
                  type="text"
                  value={amount ? Number(amount).toLocaleString('en-IN') : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAmount(val === '' ? '' : Number(val));
                  }}
                  className="w-full bg-transparent outline-none text-[var(--fg)] font-medium font-16 placeholder:text-[var(--fg)]/30"
                />
              </div>
            </div>
            {Number(amount) > 500000 && (
              <div className="text-sm text-red-400 flex justify-between gap-0.5">
                <span>Limit Exceed</span>{' '}
              </div>
            )}

            {shortfall > 0 &&
              (typeof amount !== 'number' || amount < shortfall) && (
                <div className="text-sm text-red-400 flex justify-between gap-1">
                  <span>Insufficient balance for this purchase</span>
                  <button
                    onClick={autofillShortfall}
                    className="underline text-[#4F86C0] whitespace-nowrap"
                  >
                    Add ₹{shortfall.toLocaleString()}
                  </button>
                </div>
              )}

            <div className="flex flex-row gap-3 lg:gap-5">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-[var(--inner-card)]/80 border border-[var(--fg)]/20 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-full font-14 cursor-pointer text-[var(--fg)] font-semibold transition-all duration-300 active:scale-95 shadow-sm"
                >
                  + ₹{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <PaymentOptionCard
              title="Bank Account"
              selected={paymentType === 'bank'}
              onClick={() => setPaymentType('bank')}
            >
              {banks.length > 0 ? (
                <>
                  {banks
                    .slice(
                      (bankPage - 1) * ITEMS_PER_PAGE,
                      bankPage * ITEMS_PER_PAGE
                    )
                    .map((bank) => (
                      <BankCard
                        key={bank.id}
                        bank={bank}
                        active={bank.id === selectedBankId}
                        onSelect={() => setSelectedBankId(bank.id)}
                      />
                    ))}

                  {banks.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center gap-3 mt-3">
                      <button
                        disabled={bankPage === 1}
                        onClick={() => setBankPage((p) => p - 1)}
                        className="px-3 py-1 text-xs border border-white/20 rounded-md disabled:opacity-40"
                      >
                        Prev
                      </button>

                      <button
                        disabled={bankPage * ITEMS_PER_PAGE >= banks.length}
                        onClick={() => setBankPage((p) => p + 1)}
                        className="px-3 py-1 text-xs border border-white/20 rounded-md disabled:opacity-40"
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
              )}
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
                        .map((u: UpiAccount, idx: number) => (
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
                        ))}

                      {upiRes.data.filter((u: UpiAccount) => u.isActive)
                        .length > ITEMS_PER_PAGE && (
                        <div className="flex justify-center gap-3 mt-3">
                          <button
                            disabled={upiPage === 1}
                            onClick={() => setUpiPage((p) => p - 1)}
                            className="px-3 py-1 text-xs border border-[var(--card)]/40 rounded-md disabled:opacity-40"
                          >
                            Prev
                          </button>
                          <button
                            disabled={
                              upiPage * ITEMS_PER_PAGE >=
                              upiRes.data.filter((u: UpiAccount) => u.isActive)
                                .length
                            }
                            onClick={() => setUpiPage((p) => p + 1)}
                            className="px-3 py-1 text-xs border border-[var(--card)]/40 rounded-md disabled:opacity-40"
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

            {error && <p className="text-red-400 mt-3">{error}</p>}

            <button
              disabled={
                !canProceed ||
                isInitiating ||
                isRazorpayLoading ||
                Number(amount) > 500000
              }
              onClick={handleProceed}
              className="w-full mt-8 px-6 py-3.5 font-16 font-semibold rounded-xl text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </CommonModal>
      {openAddBank && (
        <AddBankAccountModal
          open={openAddBank}
          onClose={() => setOpenAddBank(false)}
        />
      )}
    </>
  );
}
