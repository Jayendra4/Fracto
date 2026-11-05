import { useMyBankAccounts } from '@/api';
import { useEffect, useMemo, useState } from 'react';
// import { FiX } from 'react-icons/fi';
import { BankCard, PaymentOptionCard } from './AddMoneyWallet';
import AddBankAccountModal from './AddBankAccountModal';
import { usePayoutRequest } from '@/api/paymentRequest.api';
import StatusModal from '@/components/Modals/Status';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
  fundAccountId?: string | null;
}
type withdrawType = 'bank' | null;
const amounts = [10000, 50000, 100000];

export default function WithdrawWallet({
  availableBalance = 0,
  onClose,
}: {
  availableBalance?: number;
  onClose: () => void;
}) {
  const { data } = useMyBankAccounts();
  const [amount, setAmount] = useState('');
  const { mutateAsync, isLoading } = usePayoutRequest();
  const [openAddBank, setOpenAddBank] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [statusMessage, setStatusMessage] = useState('');
  const ITEMS_PER_PAGE = 4;

  const [bankPage, setBankPage] = useState(1);
  const [activeBankId, setActiveBankId] = useState<number | null>(null);

  const [paymentType, setPaymentType] = useState<withdrawType>(null);
  const bankAccounts: BankAccount[] = useMemo(
    () =>
      data?.success && Array.isArray(data.data)
        ? data.data.filter((b) => b.isActive)
        : [],
    [data]
  );
  const selectedBank =
    bankAccounts.find((b) => b.id === activeBankId) || bankAccounts[0];

  const LOCKED_BALANCE = 5000;

  const numericAmount = Number(amount);
  const withdrawableAmount =
    availableBalance > LOCKED_BALANCE ? availableBalance - LOCKED_BALANCE : 0;

  const isDisabled =
    withdrawableAmount <= 0 ||
    !amount ||
    numericAmount <= 0 ||
    numericAmount > withdrawableAmount ||
    !selectedBank ||
    isLoading;

  const handleWithdraw = async () => {
    if (withdrawableAmount <= 0) {
      setStatusType('error');
      setStatusMessage(
        'You must maintain a minimum wallet balance of ₹5,000. Withdrawal is not available yet.'
      );
      setStatusOpen(true);
      return;
    }

    if (numericAmount > withdrawableAmount) {
      setStatusType('error');
      setStatusMessage(
        `You can withdraw a maximum of ₹${withdrawableAmount.toLocaleString(
          'en-IN'
        )}. ₹5,000 is locked in your wallet.`
      );
      setStatusOpen(true);
      return;
    }

    if (isDisabled) return;

    try {
      const res = await mutateAsync({
        methodType: 'Bank',
        amount: numericAmount,
        bankAccountId: selectedBank.id,
        fundAccountId: selectedBank.fundAccountId || null,
      });

      if (!res?.success) {
        throw new Error(res?.message || 'Withdrawal request failed');
      }

      setStatusType('success');
      setStatusMessage(
        'Your withdrawal request has been submitted successfully.'
      );
      setStatusOpen(true);
    } catch (err) {
      setStatusType('error');
      setStatusMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong while processing the withdrawal.'
      );
      setStatusOpen(true);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const startIndex = (bankPage - 1) * ITEMS_PER_PAGE;
    const firstBank = bankAccounts[startIndex];
    if (firstBank) {
      setActiveBankId(firstBank.id);
    }
  }, [bankPage, bankAccounts]);

  return (
    <div className="w-full text-[var(--fg)] font-work relative">
      {isLoading && (
        <div className="absolute inset-[-1.5rem] z-50 flex flex-col items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm rounded-b-xl border border-[var(--fg)]/5">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">
            Submitting Withdrawal...
          </p>
        </div>
      )}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-ui pr-1">
        <div className="w-full ">
          <div className="space-y-3 w-full flex flex-col justify-between">
            <div className="space-y-2">
              <label className="text-[var(--fg)]/80 font-14 font-medium block">
                Amount to Withdraw
              </label>
              <div className="flex items-center border border-[var(--fg)]/20 px-4 py-3 bg-[var(--inner-card)]/30 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300 group hover:border-[var(--fg)]/30 shadow-sm">
                <span className="text-[var(--fg)]/60 font-16 mr-2 group-focus-within:text-blue-500 transition-colors">
                  ₹
                </span>
                <input
                  placeholder="1,000"
                  type="text"
                  value={amount ? Number(amount).toLocaleString('en-IN') : ''}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent outline-none text-[var(--fg)] font-medium font-16 placeholder:text-[var(--fg)]/30"
                />
              </div>
            </div>
            <AmountQuickSelect
              onSelect={(v) => {
                if (v <= withdrawableAmount) {
                  setAmount(v.toString());
                }
              }}
            />
          </div>

          <p className="text-sm text-[var(--fg)]/50 mt-2">
            Wallet balance: ₹{availableBalance.toLocaleString('en-IN')}
          </p>

          <p className="text-sm text-yellow-400 mt-1">
            ₹5,000 is locked. You can withdraw up to ₹
            {withdrawableAmount.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-[var(--card)] border border-gray-400 rounded-xl p-5 flex flex-col gap-3">
          <div>
            <h1 className="font-20 font-medium">Bank Account</h1>
            <p className="text-sm text-[var(--fg)]/60 mb-1">
              Money will be credited to this bank account.
            </p>
          </div>

          <PaymentOptionCard
            title="Select Bank"
            selected={paymentType === 'bank'}
            onClick={() => setPaymentType('bank')}
          >
            {paymentType === 'bank' &&
              (bankAccounts.length > 0 ? (
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
                        onClick={() => setBankPage((p) => p - 1)}
                        className="px-3 py-1 text-xs border border-gray-400  rounded-md disabled:opacity-40"
                      >
                        Prev
                      </button>

                      <button
                        disabled={
                          bankPage * ITEMS_PER_PAGE >= bankAccounts.length
                        }
                        onClick={() => setBankPage((p) => p + 1)}
                        className="px-3 py-1 text-xs border border-gray-400  rounded-md disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="ml-7 font-14 mt-2 text-left">
                  You don’t have any bank account added with your wallet.
                  <br />
                  <button
                    onClick={() => setOpenAddBank(true)}
                    className="text-yellow-400 border-b border-yellow-400"
                  >
                    Add Bank Account
                  </button>
                </div>
              ))}
          </PaymentOptionCard>
        </div>
      </div>

      <button
        disabled={isDisabled}
        onClick={handleWithdraw}
        className="w-full mt-6 px-6 py-3.5 font-16 font-semibold rounded-xl text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:shadow-lg hover:shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Proceed to Payment
      </button>

      {openAddBank && (
        <AddBankAccountModal
          open={openAddBank}
          onClose={() => setOpenAddBank(false)}
          onSuccess={() => {
            setOpenAddBank(false);
            setTimeout(() => {
              window.dispatchEvent(new Event('reopen-withdraw'));
            }, 200);
          }}
        />
      )}

      <StatusModal
        open={statusOpen}
        status={statusType}
        title={
          statusType === 'success'
            ? 'Withdrawal Submitted'
            : 'Withdrawal Failed'
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

export function AmountQuickSelect({
  onSelect,
}: {
  onSelect: (v: number) => void;
}) {
  return (
    <div className="flex gap-3 justify-center ">
      {amounts.map((amt) => (
        <button
          key={amt}
          onClick={() => onSelect(amt)}
          className="px-3 md:px-5 py-2 bg-[var(--inner-card)]/80 border border-[var(--fg)]/20 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-full font-14 cursor-pointer text-[var(--fg)] font-semibold transition-all duration-300 active:scale-95 shadow-sm"
        >
          + ₹ {amt.toLocaleString('en-IN')}
        </button>
      ))}
    </div>
  );
}
