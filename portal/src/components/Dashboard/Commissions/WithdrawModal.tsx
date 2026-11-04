import { useState } from 'react';
import { TbCurrencyRupee } from 'react-icons/tb';
import Button from '@/components/UI/Button';
import Loader from '@/components/Loader';
import { useRequestPayout } from '@/api/brokerCommission.api';
import CommonModal from '@/components/CommonModal';

interface WithdrawModalProps {
  onClose: () => void;
  availableAmount: number;
  walletBalance: number;
}

export default function WithdrawModal({
  onClose,
  availableAmount,
  walletBalance,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { mutate: requestPayout, isPending } = useRequestPayout();

  // If the parent doesn't control visibility via a prop, we assume it's always open when rendered.
  // However, CommonModal needs an `isOpen` prop.
  // Since this component seems to be conditionally rendered by the parent, we can pass `true`.
  // Or better, we can assume the parent handles unmounting.

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmount('');
      return;
    }
    // Remove leading zeros
    const numericVal = val.replace(/^0+/, '');
    setAmount(numericVal || '0');
  };

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    requestPayout(
      { amount: numAmount },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Withdraw Request"
      className="max-w-[400px]"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 bg-[var(--fg)]/5 p-4 rounded-lg border border-[var(--fg)]/10">
          <div>
            <label className="text-[10px] text-[var(--fg)]/50 uppercase tracking-widest font-bold block mb-1">
              Commissions
            </label>
            <div className="text-18 font-bold text-green-600 dark:text-green-400">
              ₹{availableAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="border-l border-[var(--fg)]/10 pl-4">
            <label className="text-[10px] text-[var(--fg)]/50 uppercase tracking-widest font-bold block mb-1">
              Wallet Balance
            </label>
            <div className="text-18 font-bold text-blue-600 dark:text-blue-400">
              ₹{walletBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--fg)]/50 uppercase tracking-wider font-bold block mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <TbCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg)]/50" />
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-[var(--fg)]/5 border border-[var(--fg)]/10 rounded-lg py-3 pl-10 pr-4 text-[var(--fg)] focus:outline-none focus:border-blue-500 transition-colors"
              max={availableAmount}
              placeholder="0.00"
            />
          </div>
          <p className="text-[10px] text-[var(--fg)]/40 mt-2 italic">
            * This will move funds from your commission account to your
            wallet.
          </p>
        </div>

        <div className="pt-4">
          <Button
            disabled={
              isPending ||
              !amount ||
              parseFloat(amount) > availableAmount ||
              parseFloat(amount) <= 0
            }
            onClick={handleWithdraw}
            className="w-full h-12 rounded-lg"
          >
            {isPending ? <Loader /> : 'Submit Request'}
          </Button>
        </div>
      </div>
    </CommonModal>
  );
}
