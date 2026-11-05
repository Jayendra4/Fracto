import { useEffect, useState } from 'react';
import AddBankAccountModal from './AddBankAccountModal';
import TransactionHistory from './TransactionHistory';
import WalletHeader from './WalletHeader';
import { useMyWallet } from '@/api/wallet.api';
import WithdrawWallet from './WithdrawWallet';
import InterestPaymentModal from '@/components/Modals/InterestPaymentModal';
import Loader from '@/components/Loader';
import PendingRequests from './PendingRequests';
import { useMyBankAccounts } from '@/api';
// import { useOnboarding } from '@/hooks';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import CommonModal from '@/components/CommonModal';
import { numberWithCommas } from '@/utils';

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;

    if (Math.abs(end - start) < 0.1) {
      setDisplayValue(end);
      return;
    }

    const timer = setInterval(() => {
      const diff = end - start;
      const step = diff / 6; // Faster spring-like feeling

      if (Math.abs(diff) < 1) {
        start = end;
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        start += step;
        setDisplayValue(Math.round(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString('en-IN')}</>;
};

const Wallet = () => {
  const { data, isLoading, refetch: refetchWallet } = useMyWallet();
  // const { isApproved, isSubmitted, isUnderReview, isRejected } =
  //   useOnboarding();
  // const isUserKycCompleted = isApproved;

  const user = useSelector((state: RootState) => state.authLogin.user);

  const kycStatus = user?.kycStatus;

  const isApproved = kycStatus === 'Approved';
  const isSubmitted = kycStatus === 'Submitted';
  const isUnderReview = kycStatus === 'UnderReview';
  const isRejected = kycStatus === 'Rejected';

  const isUserKycCompleted = isApproved;

  const [animatedBalance, setAnimatedBalance] = useState<number | null>(null);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);
  const wallet = data?.success ? data.data : null;

  const balance = animatedBalance ?? wallet?.availableBalance ?? 0;

  const pendingAmount = wallet?.pendingAmount ?? 0;
  const pendingTransactions = wallet?.pendingTransactionCount ?? 0;

  const [open, setOpen] = useState(false);
  const [openAddMoney, setOpenAddMoney] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const { data: bankRes, isLoading: bankLoading } = useMyBankAccounts();

  const { role } = useSelector((state: RootState) => state.authLogin);

  const hasBankAccountsFromApi =
    !bankLoading &&
    bankRes?.success &&
    Array.isArray(bankRes.data) &&
    bankRes.data.length > 0;

  useEffect(() => {
    const reopen = () => setOpenWithdraw(true);
    window.addEventListener('reopen-withdraw', reopen);
    return () => window.removeEventListener('reopen-withdraw', reopen);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { type, amount } = (e as CustomEvent).detail;

      setFlash(type === 'DEBIT' ? 'red' : 'green');

      if (amount) {
        setAnimatedBalance((prev) => {
          const current = prev ?? data?.data?.availableBalance ?? 0;
          return type === 'DEBIT'
            ? Math.max(0, current - amount)
            : current + amount;
        });
      } else if (type === 'CREDIT') {
        // Fallback if amount not provided but we want to reset to server balance soon
        setAnimatedBalance(null);
      }

      setTimeout(() => setFlash(null), 600);
    };

    window.addEventListener('wallet-effect', handler);
    return () => window.removeEventListener('wallet-effect', handler);
  }, [data]);

  if (isLoading) {
    return (
      <section className="w-full h-screen flex items-center justify-center bg-white dark:bg-[#132436]">
        <Loader />
      </section>
    );
  }

  return (
    <section
      className={`w-full h-full   text-[#0B2545] dark:text-white font-work ${role?.toLowerCase() === 'corporateinvestor' ? 'pt-[170px]' : 'pt-[20px]'}`}
    >
      <div className="max-w-[1600px] mx-auto space-y-4 w-full">
        {!hasBankAccountsFromApi && (
          <WalletHeader onAddBankClick={() => setOpen(true)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="col-span-1 w-full">
            <div className="relative overflow-hidden bg-gradient-to-tl from-[#1A5797] to-[#002A57] rounded-xl p-6">
              <div className="absolute inset-0 bg-[url('/images/dashboard/layer.svg')] bg-cover opacity-30 pointer-events-none" />
              <p className="font-12 md:font-14 text-white/60">
                Available Balance
              </p>

              <div
                className={`relative overflow-hidden rounded-xl transition${flash === 'red' ? 'ring-1 ring-red-500/70 bg-red-500/5 animate-[flash_0.6s_ease-out]' : ''}
                ${flash === 'green' ? 'ring-1 ring-green-500/70 bg-green-500/5 animate-[flash_0.6s_ease-out]' : ''}
            `}
              >
                <p className="font-24 md:font-30 font-semibold text-white mt-2 transition-all duration-500 ease-out">
                  ₹{' '}
                  {isLoading ? '—' : <AnimatedNumber value={Number(balance)} />}
                </p>
              </div>
            </div>

            <div className="pt-4 w-full">
              <div className="flex w-full rounded-xl gap-4">
                <div className="relative group flex-1">
                  <button
                    disabled={!isUserKycCompleted}
                    onClick={() => {
                      if (!isUserKycCompleted) return;
                      setOpenAddMoney(true);
                    }}
                    className={`w-full py-3 rounded-lg font-12 md:font-14 font-semibold text-center transition
                    ${
                      isUserKycCompleted
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white cursor-pointer shadow-md hover:shadow-lg hover:brightness-110'
                        : 'bg-[#4F86C0]/90 text-white/40 cursor-not-allowed'
                    }
                  `}
                  >
                    Add Money
                  </button>

                  {!isUserKycCompleted && (
                    <div
                      className="absolute -top-10 left-1/2 -translate-x-1/2
                        whitespace-nowrap px-3 py-1.5 rounded-md
                        bg-black text-yellow text-xs
                        opacity-0 group-hover:opacity-100
                        transition border border-white/10 z-50"
                    >
                      {isSubmitted || isUnderReview
                        ? 'Your KYC is under review'
                        : isRejected
                          ? 'Your KYC was rejected. Please resubmit.'
                          : 'Complete KYC to use this feature'}
                    </div>
                  )}
                </div>

                <div className="relative group flex-1">
                  <button
                    disabled={!isUserKycCompleted}
                    onClick={() => {
                      if (!isUserKycCompleted) return;
                      setOpenWithdraw(true);
                    }}
                    className={`w-full py-3 rounded-lg font-12 md:font-14 font-semibold text-center transition
                    ${
                      isUserKycCompleted
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white cursor-pointer shadow-md hover:shadow-lg hover:brightness-110'
                        : 'border border-[#2A5A8D]/40 text-[#6FA8FF]/80 cursor-not-allowed'
                    }
                  `}
                  >
                    Withdraw
                  </button>

                  {!isUserKycCompleted && (
                    <div
                      className="absolute -top-10 left-1/2 -translate-x-1/2
                      whitespace-nowrap px-3 py-1.5 rounded-md
                      bg-black text-yellow text-xs
                      opacity-0 group-hover:opacity-100
                      transition border border-white/10 z-50"
                    >
                      {isSubmitted || isUnderReview
                        ? 'Your KYC is under review'
                        : isRejected
                          ? 'Your KYC was rejected. Please resubmit.'
                          : 'Complete KYC to use this feature'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
                Pending Amount
              </p>
              <p className="font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white mt-2">
                {isLoading ? '—' : numberWithCommas(pendingAmount)}
              </p>
            </div>

            <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 pt-4 lg:pt-0">
              Total Pending Transactions:{' '}
              <span className="text-[#0B2545] dark:text-white font-semibold">
                {pendingTransactions}
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TransactionHistory />
          <PendingRequests />
        </div>

        {open && (
          <AddBankAccountModal open={open} onClose={() => setOpen(false)} />
        )}

        {openAddMoney && (
          <InterestPaymentModal
            open={openAddMoney}
            onClose={() => setOpenAddMoney(false)}
            type="deposit"
            onSuccess={() => {
              setOpenAddMoney(false);
              refetchWallet();
            }}
          />
        )}

        {openWithdraw && (
          <CommonModal
            isOpen={openWithdraw}
            onClose={() => setOpenWithdraw(false)}
            title="Withdraw Money"
            className="max-w-[500px] mx-auto"
          >
            <WithdrawWallet
              availableBalance={balance}
              onClose={() => setOpenWithdraw(false)}
            />
          </CommonModal>
        )}
      </div>
    </section>
  );
};

export default Wallet;
