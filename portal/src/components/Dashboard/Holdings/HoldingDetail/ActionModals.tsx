import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import {
  MdTrendingUp,
  MdSell,
  MdFlashOn,
  MdShoppingCart,
} from 'react-icons/md';

type ModalProps = {
  onClose: () => void;
  assetTitle: string;
  marketPrice: number;
  unitsOwned: number;
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
    <div className="flex items-center gap-0 mb-5 sm:mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                i < current
                  ? 'bg-green text-white'
                  : i === current
                    ? 'bg-gradient-to-br from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-[var(--fg)]/10 text-[var(--fg)]/30'
              }`}
            >
              {i < current ? <FiCheck size={10} /> : i + 1}
            </div>
            <span
              className={`text-[8px] sm:text-[9px] font-medium uppercase tracking-wide whitespace-nowrap ${i === current ? 'text-[var(--fg)]' : 'text-[var(--fg)]/30'}`}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-1.5 sm:mx-2 mt-[-10px] transition-all duration-300 ${i < current ? 'bg-green' : 'bg-[var(--fg)]/10'}`}
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="
          w-full
          sm:max-w-xl
          max-h-[92vh]
          sm:max-h-[88vh]
          overflow-y-auto
          bg-[var(--bg)]
          rounded-t-2xl
          sm:rounded-2xl
          border
          border-[var(--fg)]/10
          shadow-2xl
          flex
          flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--fg)]/8 bg-[var(--inner-card)] sticky top-0 z-10 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--fg)] truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white shrink-0 ml-2"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex-1 overflow-y-auto">
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
    <div className="flex justify-between items-center py-2 sm:py-2.5 border-b border-[var(--fg)]/5 last:border-0 gap-3">
      <span className="text-xs sm:text-sm text-[var(--fg)]/50 shrink-0">
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm font-semibold text-right ${highlight ? 'text-[#60A5FA]' : 'text-[var(--fg)]'}`}
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
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
}) {
  const base =
    'w-full py-3 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn min-h-[48px]';
  const styles = {
    primary:
      'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-40 disabled:cursor-not-allowed',
    outline:
      'border border-gray-300 dark:border-white/15 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5',
    danger:
      'bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]}`}
    >
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

/* ─── shared input class ──────────────────────────────────────── */
const inputCls =
  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--fg)]/10 bg-[var(--inner-card)] text-[var(--fg)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 font-semibold';

/* ─── 1. Sell Share (Ask to Sell) ─────────────────────────────── */

export function SellShareModal({
  onClose,
  assetTitle,
  marketPrice,
  unitsOwned,
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [askPrice, setAskPrice] = useState(String(marketPrice));
  const [units, setUnits] = useState('1');
  const [done, setDone] = useState(false);

  const ask = Number(askPrice) || 0;
  const qty = Math.min(Number(units) || 1, unitsOwned);
  const total = ask * qty;
  const fee = total * 0.01;

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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[var(--fg)] truncate text-right max-w-[160px]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Units Owned
                    </span>
                    <span className="font-medium text-[var(--fg)]">
                      {unitsOwned}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[var(--fg)]">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Ask Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={askPrice}
                    onChange={(e) => setAskPrice(e.target.value)}
                    className={inputCls}
                    placeholder={String(marketPrice)}
                    min={1}
                  />
                  <p className="text-[10px] text-[var(--fg)]/30 mt-1">
                    Current Market Price: ₹ {marketPrice.toLocaleString()} /
                    Unit
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Units to Sell
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className={inputCls}
                    min={1}
                    max={unitsOwned}
                  />
                  <p className="text-[10px] text-[var(--fg)]/30 mt-1">
                    Max: {unitsOwned} Units
                  </p>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 text-[var(--fg)]">
                  <span>Total Ask Amount</span>
                  <span>₹ {total.toLocaleString()}</span>
                </div>
                <ActionButton
                  onClick={() => setStep(1)}
                  disabled={ask <= 0 || qty <= 0}
                >
                  Continue →
                </ActionButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4">
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
                <div className="flex items-start gap-2 text-xs text-[var(--fg)]/40 bg-[var(--inner-card)] rounded-xl p-3">
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-sm text-center space-y-1">
                  <p className="text-[var(--fg)]/50">Placing ask listing for</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
                    {qty} Units @ ₹ {ask.toLocaleString()}
                  </p>
                  <p className="text-orange-400 font-medium">
                    Total: ₹ {total.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setDone(true)}>
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
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [bidPrice, setBidPrice] = useState(
    String(Math.floor(marketPrice * 0.97))
  );
  const [units, setUnits] = useState('10');
  const [done, setDone] = useState(false);

  const bid = Number(bidPrice) || 0;
  const qty = Number(units) || 1;
  const total = bid * qty;

  return (
    <ModalShell
      title="Place Bid (Buy Units)"
      icon={<MdShoppingCart size={18} className="text-[#60A5FA]" />}
      iconColor="bg-[#4F46E5]/10"
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[var(--fg)] truncate text-right max-w-[160px]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Current Market Price
                    </span>
                    <span className="font-medium text-[var(--fg)] text-right">
                      ₹ {marketPrice.toLocaleString()} / Unit
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Bid Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className={inputCls}
                    min={1}
                  />
                  <p className="text-[10px] text-[var(--fg)]/30 mt-1">
                    Current Market Price: ₹ {marketPrice.toLocaleString()} /
                    Unit
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Number of Units
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className={inputCls}
                    min={1}
                  />
                  <p className="text-[10px] text-[var(--fg)]/30 mt-1">
                    Min Bid Quantity: 1 Unit
                  </p>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 text-[var(--fg)]">
                  <span>Total Bid Amount</span>
                  <span>₹ {total.toLocaleString()}</span>
                </div>
                <ActionButton
                  onClick={() => setStep(1)}
                  disabled={bid <= 0 || qty <= 0}
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4">
                  <InfoRow label="Property" value={assetTitle} />
                  <InfoRow
                    label="Bid Price / Unit"
                    value={`₹ ${bid.toLocaleString()}`}
                  />
                  <InfoRow label="Units" value={String(qty)} />
                  <InfoRow
                    label="Total Bid Amount"
                    value={`₹ ${total.toLocaleString()}`}
                    highlight
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-[var(--fg)]/40 bg-[var(--inner-card)] rounded-xl p-3">
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[#4F46E5]/5 border border-[#4F46E5]/20 rounded-xl p-4 text-sm text-center space-y-1">
                  <p className="text-[var(--fg)]/50">Placing bid for</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
                    {qty} Units @ ₹ {bid.toLocaleString()}
                  </p>
                  <p className="text-[#60A5FA] font-medium">
                    Total: ₹ {total.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </ActionButton>
                  <ActionButton onClick={() => setDone(true)}>
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
}: ModalProps) {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState('1');
  const [done, setDone] = useState(false);

  const qty = Math.min(Number(units) || 1, unitsOwned);
  const total = marketPrice * qty;
  const fee = total * 0.0;
  const youReceive = total - fee;

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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[var(--fg)] truncate text-right max-w-[160px]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Units Owned
                    </span>
                    <span className="font-medium text-[var(--fg)]">
                      {unitsOwned}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[var(--fg)]">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Units to Sell
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className={inputCls}
                    min={1}
                    max={unitsOwned}
                  />
                  <p className="text-[10px] text-[var(--fg)]/30 mt-1">
                    Max Available: {unitsOwned} Units
                  </p>
                </div>
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4">
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
                    label="Fees (1%)"
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm text-center space-y-1">
                  <p className="text-[var(--fg)]/50">Selling at market price</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
                    {qty} Units @ ₹ {marketPrice.toLocaleString()}
                  </p>
                  <p className="text-green font-semibold text-base">
                    You receive: ₹ {youReceive.toLocaleString()}
                  </p>
                  <p className="text-[var(--fg)]/30 text-[10px]">
                    Fees: ₹ {fee.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-[var(--fg)]/40 bg-[var(--inner-card)] rounded-xl p-3">
                  <FiAlertCircle className="shrink-0 mt-0.5 text-red-400" />
                  Units will be sold instantly at the best available market
                  price. This action cannot be undone.
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <ActionButton variant="outline" onClick={() => setStep(0)}>
                    ← Back
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => setDone(true)}>
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
  const fee = total * 0.005;
  const totalPayable = total + fee;

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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Property
                    </span>
                    <span className="font-medium text-[var(--fg)] truncate text-right max-w-[160px]">
                      {assetTitle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--fg)]/50 shrink-0">
                      Market Price / Unit
                    </span>
                    <span className="font-medium text-[var(--fg)] text-right">
                      ₹ {marketPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg)]/50 font-medium uppercase tracking-wide block mb-1.5">
                    Number of Units to Buy
                  </label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className={inputCls}
                    min={1}
                  />
                </div>
                <div className="bg-[var(--inner-card)] rounded-xl p-3 sm:p-4">
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
                    label="Platform Fee (0.5%)"
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-green/5 border border-green/20 rounded-xl p-4 text-sm text-center space-y-1">
                  <p className="text-[var(--fg)]/50">Buying at market price</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
                    {qty} Units @ ₹ {marketPrice.toLocaleString()}
                  </p>
                  <p className="text-[var(--fg)]/50 text-[10px]">
                    Fee: ₹ {fee.toLocaleString()}
                  </p>
                  <p className="text-green font-semibold text-base">
                    Total: ₹ {totalPayable.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-[var(--fg)]/40 bg-[var(--inner-card)] rounded-xl p-3">
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
                className="space-y-3 sm:space-y-4"
              >
                <div className="bg-green/5 border border-green/20 rounded-xl p-4 text-sm text-center space-y-2">
                  <p className="text-[var(--fg)]/50">Confirm direct purchase</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
                    ₹ {totalPayable.toLocaleString()}
                  </p>
                  <p className="text-[var(--fg)]/50">
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
        <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">
          Success!
        </h3>
        <p className="text-sm text-[var(--fg)]/50 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white text-sm font-semibold shadow-lg min-h-[48px]"
      >
        Done
      </button>
    </motion.div>
  );
}
