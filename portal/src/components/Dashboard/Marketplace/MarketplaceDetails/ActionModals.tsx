/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed error handling, matches the pattern in rwa.api.ts */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import {
  MdTrendingUp,
  MdSell,
  MdFlashOn,
  MdShoppingCart,
} from 'react-icons/md';
import {
  useCreateMarketplaceAsk,
  useCreateMarketplaceBid,
  useCreateMarketplaceImmediateSell,
  useCreateMarketplaceDirectSell,
  useCreateMarketplaceDirectBuy,
} from '@/api/group.api';

type ModalProps = {
  onClose: () => void;
  assetTitle: string;
  marketPrice: number;
  unitsOwned: number;
  assetId?: number;
};

/* ─── shared helpers ──────────────────────────────────────────── */

function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-start gap-0 mb-6 w-full overflow-hidden">
      {steps.map((s, i) => (
        <div
          key={i}
          className="flex items-center flex-1 last:flex-none min-w-0"
        >
          <div className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                i < current
                  ? 'bg-green text-white'
                  : i === current
                    ? 'bg-gradient-to-br from-[#3A76C0] to-[#60A5FA] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
              }`}
            >
              {i < current ? <FiCheck size={10} /> : i + 1}
            </div>
            <span
              className={`text-[8px] sm:text-[9px] font-medium uppercase tracking-wide text-center leading-tight max-w-[48px] sm:max-w-[56px] line-clamp-2 ${i === current ? 'text-[#0B2545] dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-1 sm:mx-2 mt-[-10px] transition-all duration-300 min-w-0 ${i < current ? 'bg-green' : 'bg-gray-100 dark:bg-white/10'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ModalShell({
  title,
  icon,
  iconColor,
  onClose,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 30 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-md bg-[#F4F6F9] dark:bg-[#0B0B0B] rounded-2xl border border-[#E3E7EE] dark:border-white/10 shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${iconColor}`}
            >
              {icon}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-[#0B2545] dark:text-white truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white flex-shrink-0 ml-2"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 sm:py-2.5 border-b border-[#E3E7EE] dark:border-white/10 last:border-0 gap-3">
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm font-semibold text-right break-all ${highlight ? 'text-[#60A5FA]' : 'text-[#0B2545] dark:text-white'}`}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  variant = 'primary',
  disabled,
  loading,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const base =
    'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn';
  const styles = {
    primary:
      'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-40 disabled:cursor-not-allowed',
    outline:
      'border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed',
    danger:
      'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]}`}
    >
      {variant === 'primary' && !disabled && !loading && (
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {loading && <FiLoader className="animate-spin text-base shrink-0" />}
        {children}
      </span>
    </button>
  );
}

/* ─── 1. Sell Share (Ask to Sell) ─────────────────────────────── */

export function SellShareModal({
  onClose,
  assetTitle,
  marketPrice,
  unitsOwned,
  assetId,
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [askPrice, setAskPrice] = useState('');
  const [units, setUnits] = useState('');
  const [errors, setErrors] = useState<{ askPrice?: string; units?: string }>(
    {}
  );
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const { mutate: createAsk, isPending } = useCreateMarketplaceAsk();

  const ask = Number(askPrice) || 0;
  const qty = Number(units) || 0;
  const total = ask * qty;
  const fee = total * 0;

  function validate() {
    const errs: { askPrice?: string; units?: string } = {};
    if (!askPrice || ask <= 0) errs.askPrice = 'Price per unit is required';
    if (!units || qty <= 0) errs.units = 'Total units is required';
    else if (qty > unitsOwned)
      errs.units =
        unitsOwned > 0
          ? `Max ${unitsOwned} units allowed`
          : 'You do not own any structural co-ownership of this property."';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (validate()) setStep(1);
  }

  function handleConfirm() {
    setApiError('');
    createAsk(
      { assetId: assetId ?? 0, pricePerUnit: ask, totalUnits: qty },
      {
        onSuccess: (res: any) => {
          if (res?.success === false) {
            setApiError(res?.message || 'Something went wrong');
          } else {
            setDone(true);
          }
        },
        onError: () => setApiError('Failed to place ask. Please try again.'),
      }
    );
  }

  return (
    <ModalShell
      title="Ask to Sell"
      icon={<MdSell size={18} className="text-orange-400" />}
      iconColor="bg-orange-500/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator
            steps={['Set Ask Price', 'Review', 'Confirm']}
            current={step}
          />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Units Owned
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      {unitsOwned}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Price per unit */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Price per Unit (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={askPrice}
                    onChange={(e) => {
                      setAskPrice(e.target.value);
                      if (errors.askPrice)
                        setErrors((p) => ({ ...p, askPrice: undefined }));
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 font-semibold transition-colors ${
                      errors.askPrice
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-[#E3E7EE] dark:border-white/10 focus:ring-[#3A76C0]/40'
                    }`}
                    placeholder={String(marketPrice)}
                    min={1}
                  />
                  {errors.askPrice ? (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <FiAlertCircle size={11} /> {errors.askPrice}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Current Market Price: ₹ {marketPrice.toLocaleString()} /
                      Unit
                    </p>
                  )}
                </div>

                {/* Total units */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Total Units <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value);
                      if (errors.units)
                        setErrors((p) => ({ ...p, units: undefined }));
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 font-semibold transition-colors ${
                      errors.units
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-[#E3E7EE] dark:border-white/10 focus:ring-[#3A76C0]/40'
                    }`}
                    placeholder="Enter units to sell"
                    min={1}
                    max={unitsOwned}
                  />
                  {errors.units ? (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <FiAlertCircle size={11} /> {errors.units}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Max: {unitsOwned} Units
                    </p>
                  )}
                </div>

                {ask > 0 && qty > 0 && (
                  <div className="flex justify-between text-sm font-semibold pt-1 text-[#0B2545] dark:text-white">
                    <span>Total Ask Amount</span>
                    <span>₹ {total.toLocaleString()}</span>
                  </div>
                )}

                <ActionButton onClick={handleContinue}>Continue →</ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4">
                  <InfoRow label="Property" value={assetTitle} />
                  <InfoRow
                    label="Ask Price / Unit"
                    value={`₹ ${ask.toLocaleString()}`}
                  />
                  <InfoRow label="Units to Sell" value={String(qty)} />
                  <InfoRow
                    label="Total Ask Amount"
                    value={`₹ ${total.toLocaleString()}`}
                    highlight
                  />
                  <InfoRow
                    label="Platform Fee (0%)"
                    value={`₹ ${fee.toLocaleString()}`}
                  />
                  <InfoRow
                    label="You Receive (Est.)"
                    value={`₹ ${total.toLocaleString()}`}
                    highlight
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#132436] rounded-xl p-3">
                  <FiAlertCircle className="shrink-0 mt-0.5 text-orange-400" />
                  Your ask listing will be visible in the marketplace for
                  buyers.
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(0)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setStep(2)}>
                    Review Order
                  </ActionButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Placing ask listing for
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {ask.toLocaleString()}
                  </p>
                  <p className="text-orange-400 font-medium">
                    Total: ₹ {total.toLocaleString()}
                  </p>
                </div>

                {apiError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <FiAlertCircle className="shrink-0" />
                    {apiError}
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <ActionButton
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={handleConfirm} loading={isPending}>
                    Confirm Listing
                  </ActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message="Ask listing placed! Buyers can now purchase your units at your set price."
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── 2. Buy Share (Place Bid) ────────────────────────────────── */

export function BuyShareModal({
  onClose,
  assetTitle,
  marketPrice,
  assetId,
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [bidPrice, setBidPrice] = useState('');
  const [units, setUnits] = useState('');
  const [errors, setErrors] = useState<{ bidPrice?: string; units?: string }>(
    {}
  );
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const { mutateAsync: createBid, isPending } = useCreateMarketplaceBid();

  const bid = Number(bidPrice) || 0;
  const qty = Number(units) || 0;
  const total = bid * qty;
  const fee = total * 0;
  const youPay = total + fee;

  function validate() {
    const e: { bidPrice?: string; units?: string } = {};
    if (!bidPrice || bid <= 0)
      e.bidPrice = 'Bid price per unit is required and must be greater than 0';
    if (!units || qty <= 0)
      e.units = 'Number of units is required and must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirm() {
    setApiError('');
    try {
      const result = await createBid({
        assetId: assetId ?? 0,
        bidPricePerUnit: bid,
        units: qty,
      });
      if (!result.success) {
        setApiError(result.message || 'Failed to place bid. Please try again.');
        return;
      }
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApiError(msg || 'Failed to place bid. Please try again.');
    }
  }

  return (
    <ModalShell
      title="Place Bid (Buy Units)"
      icon={<MdShoppingCart size={18} className="text-[#60A5FA]" />}
      iconColor="bg-[#3A76C0]/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator
            steps={['Enter Bid', 'Review', 'Confirm']}
            current={step}
          />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="b0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Current Market Price
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      ₹ {marketPrice.toLocaleString()} / Unit
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Bid Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => {
                      setBidPrice(e.target.value);
                      setErrors((prev) => ({ ...prev, bidPrice: undefined }));
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A76C0]/40 font-semibold ${errors.bidPrice ? 'border-red-500' : 'border-[#E3E7EE] dark:border-white/10'}`}
                    placeholder="Enter bid price"
                    min={1}
                  />
                  {errors.bidPrice && (
                    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                      <FiAlertCircle size={11} /> {errors.bidPrice}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    Current Market Price: ₹ {marketPrice.toLocaleString()} /
                    Unit
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Number of Units
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value);
                      setErrors((prev) => ({ ...prev, units: undefined }));
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A76C0]/40 font-semibold ${errors.units ? 'border-red-500' : 'border-[#E3E7EE] dark:border-white/10'}`}
                    placeholder="Enter number of units"
                    min={1}
                  />
                  {errors.units && (
                    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                      <FiAlertCircle size={11} /> {errors.units}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    Min Bid Quantity: 1 Unit
                  </p>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 text-[#0B2545] dark:text-white">
                  <span>Total Bid Amount</span>
                  <span>₹ {total.toLocaleString()}</span>
                </div>
                <ActionButton
                  onClick={() => {
                    if (validate()) setStep(1);
                  }}
                >
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="b1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4">
                  <InfoRow label="Property" value={assetTitle} />
                  <InfoRow
                    label="Bid Price / Unit"
                    value={`₹ ${bid.toLocaleString()}`}
                  />
                  <InfoRow label="Units" value={String(qty)} />
                  <InfoRow label="Platform Fee" value="₹ 0" />
                  <InfoRow
                    label="Total You Pay"
                    value={`₹ ${youPay.toLocaleString()}`}
                    highlight
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#132436] rounded-xl p-3">
                  <FiAlertCircle className="shrink-0 mt-0.5 text-[#60A5FA]" />
                  Your bid will be sent to sellers. You will be notified if
                  someone accepts.
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(0)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setStep(2)}>
                    Review Bid
                  </ActionButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="b2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-[#3A76C0]/5 border border-[#3A76C0]/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Placing bid for
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {bid.toLocaleString()}
                  </p>
                  <p className="text-[#60A5FA] font-medium">
                    Total: ₹ {youPay.toLocaleString()}
                  </p>
                </div>
                {apiError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
                    <FiAlertCircle size={13} /> {apiError}
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={handleConfirm} loading={isPending}>
                    Confirm Bid
                  </ActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message="Bid placed! Sellers will be notified and you'll receive a confirmation if it's accepted."
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── 3. Immediate Sale ───────────────────────────────────────── */

export function ImmediateSaleModal({
  onClose,
  assetTitle,
  marketPrice,
  unitsOwned,
  assetId,
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState('1');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: immediateSell, isPending } =
    useCreateMarketplaceImmediateSell();

  const qty = Math.min(Number(units) || 1, unitsOwned);
  const total = marketPrice * qty;
  const fee = total * 0.15;
  const youReceive = total - fee;

  async function handleConfirm() {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    setApiError('');
    setPasswordError('');
    try {
      const result = await immediateSell({
        assetId: assetId ?? 0,
        units: qty,
        password,
      });
      if (!result.success) {
        setApiError(
          result.message || 'Failed to process sell. Please try again.'
        );
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ['marketplace-overview', assetId],
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApiError(msg || 'Failed to process sell. Please try again.');
    }
  }

  return (
    <ModalShell
      title="Immediate Sell (Market Price)"
      icon={<MdFlashOn size={18} className="text-red-400" />}
      iconColor="bg-red-500/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator
            steps={['Review', 'Confirm', 'Complete']}
            current={step}
          />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="i0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Units Owned
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      {unitsOwned}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Units to Sell
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 font-semibold"
                    min={1}
                    max={unitsOwned}
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    Max Available: {unitsOwned} Units
                  </p>
                </div>
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4">
                  <InfoRow
                    label="Sell at Market Price"
                    value={`₹ ${marketPrice.toLocaleString()}`}
                  />
                  <InfoRow label="Units" value={String(qty)} />
                  <InfoRow
                    label="Gross Amount"
                    value={`₹ ${total.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Fees (15%)"
                    value={`₹ ${fee.toLocaleString()}`}
                  />
                  <InfoRow
                    label="You Receive"
                    value={`₹ ${youReceive.toLocaleString()}`}
                    highlight
                  />
                </div>
                <ActionButton onClick={() => setStep(1)} disabled={qty <= 0}>
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="i1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Selling at market price
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {marketPrice.toLocaleString()}
                  </p>
                  <p className="text-green-400 font-semibold text-base">
                    You receive: ₹ {youReceive.toLocaleString()}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px]">
                    Fees (15%): ₹ {fee.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#132436] rounded-xl p-3">
                  <FiAlertCircle className="shrink-0 mt-0.5 text-red-400" />
                  Units will be sold instantly at the best available market
                  price. This action cannot be undone.
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 font-semibold ${passwordError ? 'border-red-500' : 'border-[#E3E7EE] dark:border-white/10'}`}
                    placeholder="Enter your password"
                  />
                  {passwordError && (
                    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                      <FiAlertCircle size={11} /> {passwordError}
                    </p>
                  )}
                </div>
                {apiError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
                    <FiAlertCircle size={13} /> {apiError}
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton
                    variant="outline"
                    onClick={() => setStep(0)}
                    disabled={isPending}
                  >
                    ← Back
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={handleConfirm}
                    loading={isPending}
                  >
                    Confirm Sell
                  </ActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message={`${qty} units sold at ₹ ${marketPrice.toLocaleString()} each. ₹ ${youReceive.toLocaleString()} will be credited to your wallet.`}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── 4. Direct Buy ───────────────────────────────────────────── */

export function DirectBuyModal({
  onClose,
  assetTitle,
  marketPrice,
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState('10');
  const [done, setDone] = useState(false);

  const qty = Number(units) || 1;
  const total = marketPrice * qty;
  const fee = total * 0.0;
  const totalPayable = total;

  return (
    <ModalShell
      title="Direct Buy (Market Price)"
      icon={<MdTrendingUp size={18} className="text-green" />}
      iconColor="bg-green/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator
            steps={['Select Units', 'Review', 'Confirm']}
            current={step}
          />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="d0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Number of Units to Buy
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A76C0]/40 font-semibold"
                    min={1}
                  />
                </div>
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4">
                  <InfoRow
                    label="Price / Unit"
                    value={`₹ ${marketPrice.toLocaleString()}`}
                  />
                  <InfoRow label="Units" value={String(qty)} />
                  <InfoRow
                    label="Subtotal"
                    value={`₹ ${total.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Platform Fee (0%)"
                    value={`₹ ${fee.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Total Payable"
                    value={`₹ ${totalPayable.toLocaleString()}`}
                    highlight
                  />
                </div>
                <ActionButton onClick={() => setStep(1)} disabled={qty <= 0}>
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="d1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-green/5 border border-green/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Buying at market price
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {marketPrice.toLocaleString()}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px]">
                    Fee: ₹ {fee.toLocaleString()}
                  </p>
                  <p className="text-green font-semibold text-base">
                    Total: ₹ {totalPayable.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#132436] rounded-xl p-3">
                  <FiAlertCircle className="shrink-0 mt-0.5 text-green" />
                  Units will be purchased instantly from the marketplace at
                  market price.
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(0)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setStep(2)}>Review</ActionButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="d2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-green/5 border border-green/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-2">
                  <p className="text-gray-500 dark:text-gray-400">
                    Confirm direct purchase
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    ₹ {totalPayable.toLocaleString()}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {qty} units of {assetTitle}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setDone(true)}>
                    Confirm Purchase
                  </ActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message={`${qty} units purchased at ₹ ${marketPrice.toLocaleString()} each. Your holdings have been updated.`}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── 5. Direct Buy (accept an Ask) ──────────────────────────── */

type DirectBuyFromListingModalProps = {
  onClose: () => void;
  listingId: number;
  pricePerUnit: number;
  remainingUnits: number;
  sellerName: string;
  assetTitle: string;
  assetId: number;
};

export function DirectBuyFromListingModal({
  onClose,
  listingId,
  pricePerUnit,
  remainingUnits,
  sellerName,
  assetTitle,
  assetId,
}: DirectBuyFromListingModalProps) {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState(String(remainingUnits));
  const [unitError, setUnitError] = useState('');
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: directBuy, isPending } = useCreateMarketplaceDirectBuy();

  const qty = Number(units) || 0;
  const total = pricePerUnit * qty;

  function handleContinue() {
    if (!units || qty <= 0) {
      setUnitError('Enter at least 1 unit');
      return;
    }
    if (qty > remainingUnits) {
      setUnitError(`Max ${remainingUnits} units available`);
      return;
    }
    setUnitError('');
    setStep(1);
  }

  async function handleConfirm() {
    setApiError('');
    try {
      const result = await directBuy({ listingId, units: qty });
      if (!result.success) {
        setApiError(
          result.message || 'Failed to process buy. Please try again.'
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['asset-listings', assetId] });
      queryClient.invalidateQueries({
        queryKey: ['marketplace-overview', assetId],
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApiError(msg || 'Failed to process buy. Please try again.');
    }
  }

  return (
    <ModalShell
      title="Direct Buy (Accept Ask)"
      icon={<MdShoppingCart size={18} className="text-[#60A5FA]" />}
      iconColor="bg-[#3A76C0]/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator steps={['Enter Units', 'Confirm']} current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="db0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Seller
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {sellerName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Ask Price / Unit
                    </span>
                    <span className="font-semibold text-orange-400">
                      ₹ {pricePerUnit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Available Units
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      {remainingUnits}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Units to Buy <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value);
                      setUnitError('');
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 font-semibold transition-colors ${
                      unitError
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-[#E3E7EE] dark:border-white/10 focus:ring-[#3A76C0]/40'
                    }`}
                    min={1}
                    max={remainingUnits}
                  />
                  {unitError ? (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <FiAlertCircle size={11} /> {unitError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Max: {remainingUnits} Units
                    </p>
                  )}
                </div>

                {qty > 0 && (
                  <div className="flex justify-between text-sm font-semibold pt-1 text-[#0B2545] dark:text-white">
                    <span>Total Amount</span>
                    <span>₹ {total.toLocaleString()}</span>
                  </div>
                )}

                <ActionButton onClick={handleContinue} disabled={qty <= 0}>
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="db1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-[#3A76C0]/5 border border-[#3A76C0]/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Buying from {sellerName}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {pricePerUnit.toLocaleString()}
                  </p>
                  <p className="text-[#60A5FA] font-semibold text-base">
                    Total: ₹ {total.toLocaleString()}
                  </p>
                </div>

                {apiError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
                    <FiAlertCircle size={13} /> {apiError}
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <ActionButton
                    variant="outline"
                    onClick={() => setStep(0)}
                    disabled={isPending}
                  >
                    ← Back
                  </ActionButton>
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Buy'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message={`${qty} units purchased from ${sellerName} at ₹ ${pricePerUnit.toLocaleString()} each. ₹ ${total.toLocaleString()} deducted from your wallet.`}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── 6. Direct Sell (accept a Bid) ──────────────────────────── */

type DirectSellModalProps = {
  onClose: () => void;
  listingId: number;
  pricePerUnit: number;
  remainingUnits: number;
  buyerName: string;
  assetTitle: string;
  assetId: number;
};

export function DirectSellModal({
  onClose,
  listingId,
  pricePerUnit,
  remainingUnits,
  buyerName,
  assetTitle,
  assetId,
}: DirectSellModalProps) {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState(String(remainingUnits));
  const [unitError, setUnitError] = useState('');
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: directSell, isPending } =
    useCreateMarketplaceDirectSell();

  const qty = Number(units) || 0;
  const total = pricePerUnit * qty;

  function handleContinue() {
    if (!units || qty <= 0) {
      setUnitError('Enter at least 1 unit');
      return;
    }
    if (qty > remainingUnits) {
      setUnitError(`Max ${remainingUnits} units available`);
      return;
    }
    setUnitError('');
    setStep(1);
  }

  async function handleConfirm() {
    setApiError('');
    try {
      const result = await directSell({ listingId, units: qty });
      if (!result.success) {
        setApiError(
          result.message || 'Failed to process sell. Please try again.'
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['asset-listings', assetId] });
      queryClient.invalidateQueries({
        queryKey: ['marketplace-overview', assetId],
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setApiError(msg || 'Failed to process sell. Please try again.');
    }
  }

  return (
    <ModalShell
      title="Direct Sell (Accept Bid)"
      icon={<MdSell size={18} className="text-orange-400" />}
      iconColor="bg-orange-500/10"
      onClose={onClose}
    >
      {!done ? (
        <>
          <StepIndicator steps={['Enter Units', 'Confirm']} current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="ds0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-[#132436] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Buyer
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white truncate text-right max-w-[55%]">
                      {buyerName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Bid Price / Unit
                    </span>
                    <span className="font-semibold text-[#60A5FA]">
                      ₹ {pricePerUnit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Available Units
                    </span>
                    <span className="font-medium text-[#0B2545] dark:text-white">
                      {remainingUnits}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                    Units to Sell <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value);
                      setUnitError('');
                    }}
                    className={`w-full px-3 sm:px-4 py-3 rounded-xl border bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white text-sm focus:outline-none focus:ring-2 font-semibold transition-colors ${
                      unitError
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-[#E3E7EE] dark:border-white/10 focus:ring-[#3A76C0]/40'
                    }`}
                    min={1}
                    max={remainingUnits}
                  />
                  {unitError ? (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <FiAlertCircle size={11} /> {unitError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Max: {remainingUnits} Units
                    </p>
                  )}
                </div>

                {qty > 0 && (
                  <div className="flex justify-between text-sm font-semibold pt-1 text-[#0B2545] dark:text-white">
                    <span>Total Amount</span>
                    <span>₹ {total.toLocaleString()}</span>
                  </div>
                )}

                <ActionButton onClick={handleContinue} disabled={qty <= 0}>
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="ds1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 sm:p-4 text-sm text-center space-y-1">
                  <p className="text-gray-500 dark:text-gray-400">
                    Selling to {buyerName}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white break-all">
                    {qty} Units @ ₹ {pricePerUnit.toLocaleString()}
                  </p>
                  <p className="text-orange-400 font-semibold text-base">
                    Total: ₹ {total.toLocaleString()}
                  </p>
                </div>

                {apiError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
                    <FiAlertCircle size={13} /> {apiError}
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <ActionButton
                    variant="outline"
                    onClick={() => setStep(0)}
                    disabled={isPending}
                  >
                    ← Back
                  </ActionButton>
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Sell'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen
          message={`${qty} units sold to ${buyerName} at ₹ ${pricePerUnit.toLocaleString()} each. ₹ ${total.toLocaleString()} will be credited to your wallet.`}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

/* ─── Success screen ──────────────────────────────────────────── */

function SuccessScreen({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-green/15 border-2 border-green/30 flex items-center justify-center"
      >
        <FiCheck size={28} className="text-green" />
      </motion.div>
      <div>
        <h3 className="text-lg font-semibold text-[#0B2545] dark:text-white mb-2">
          Success!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white text-sm font-semibold shadow-lg"
      >
        Done
      </button>
    </motion.div>
  );
}
