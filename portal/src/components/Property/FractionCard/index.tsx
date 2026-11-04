/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset prop, matches the pattern in rwa.api.ts */
import { useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import CommonModal from '@/components/CommonModal';
import StatusModal from '@/components/Modals/Status';
import { useSignConsent } from '@/api/assetPurchase.api';

interface FractionCardProps {
  asset: any;
  onPayNow?: () => void;
  isPaymentPending?: boolean;
  isPaymentFailed?: boolean;
  isGroupJoined?: boolean;
  isJoiningGroup?: boolean;
}

export default function FractionCard({
  asset,
  onPayNow,
  isPaymentPending = false,
  isPaymentFailed = false,
  isGroupJoined = true,
  isJoiningGroup = false,
}: FractionCardProps) {
  const navigate = useNavigate();
  const {
    id,
    totalFractions = 0,
    soldFractions = 0,
    totalBuyersCount = 0,
    totalSoldAmount = 0,
    price,
    meta = [],
    interestCount,
    isInterested,
    tempGroupId,
  } = asset;

  const getMetaValue = (key: string) =>
    meta.find((m: any) => m.metaKey === key)?.metaValue ?? 0;

  // const initialPrice = Number(price?.initialPricePerFraction ?? 0);
  const currentPrice = Number(price?.currentPricePerFraction ?? 0);
  const marketValue = Number(getMetaValue('marketValue') ?? 0);

  const rentalYield = Number(asset.financials?.yield?.actualYieldPercent ?? 0);

  const remainingFractions =
    totalFractions > 0 ? totalFractions - soldFractions : 0;

  const isSoldOut = remainingFractions <= 0;

  const soldPercentage =
    totalFractions > 0 ? (soldFractions / totalFractions) * 100 : 0;

  // const pricePerToken = Number(asset.soldFractions?.perFraction?.price ?? 0);
  const soldFraction = Number(asset.soldFractions ?? 0);
  const totalFraction = Number(asset.totalFractions ?? 0);

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestStep, setInterestStep] = useState<'ask' | 'yes' | 'no'>('ask');
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [noReason, setNoReason] = useState('');
  const { mutateAsync: signConsent, isPending: isSigningConsent } =
    useSignConsent();
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success' as 'success' | 'error',
    title: '',
    message: '',
    redirect: false,
  });

  const closeInterestModal = () => {
    setShowInterestModal(false);
    setInterestStep('ask');
    setAgreeChecked(false);
    setNoReason('');
  };

  const proceedToBuy = () => {
    navigate('/buy-fraction', {
      state: {
        assetId: id,
        groupId: tempGroupId,
      },
    });
    closeInterestModal();
  };

  const hasBuyerConsent = Array.isArray(asset?.fractionsConsents)
    ? asset.fractionsConsents.some((c: any) => c?.buyerConsent === true)
    : false;

  const handleBuy = () => {
    if (isSoldOut) return;

    // Already consented on a previous visit — skip straight to buying
    // instead of asking for interest/consent again.
    if (hasBuyerConsent) {
      proceedToBuy();
      return;
    }

    setShowInterestModal(true);
    setInterestStep('ask');
  };

  const handleConfirmPurchase = async () => {
    try {
      const res = await signConsent({
        assetId: Number(id),
        buyerConsent: true,
      });
      if (!res?.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: res?.message || 'Failed to submit your consent',
          redirect: false,
        });
        return;
      }
      setStatusModal({
        open: true,
        status: 'success',
        title: 'Success',
        message: 'Consent submitted successfully',
        redirect: true,
      });
    } catch (err) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Error',
        message:
          err instanceof Error ? err.message : 'Failed to submit your consent',
        redirect: false,
      });
    }
  };

  const handleRejectPurchase = async () => {
    try {
      const res = await signConsent({
        assetId: Number(id),
        buyerConsent: false,
        rejectionReason: noReason.trim(),
      });
      if (!res?.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: res?.message || 'Failed to submit your response',
          redirect: false,
        });
        return;
      }
      setStatusModal({
        open: true,
        status: 'success',
        title: 'Success',
        message: 'Your response has been submitted',
        redirect: false,
      });
    } catch (err) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Error',
        message:
          err instanceof Error ? err.message : 'Failed to submit your response',
        redirect: false,
      });
    }
  };

  const showPriceCards =
    !!asset.price?.currentPricePerFraction && !asset.isDocumentLocked;

  return (
    <div className="text-[#0B2545] dark:text-white md:max-w-[480px] space-y-4 lg:space-y-8 font-work mb-6 mb:mb-16">
      {showPriceCards && (
        <div className="p-6 md:p-4 lg:p-7 xl:p-10 rounded-2xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm min-w-[285px]">
          <div className="flex items-center justify-between">
            <p className="font-light font-20 ">
              Price per Structural Co-ownership
            </p>
            <p className="font-40 font-semibold">
              ₹{currentPrice.toLocaleString()}
            </p>
          </div>

          <div className="md:space-y-5 space-y-3">
            <div className="mt-2 h-2 w-full rounded-full bg-[#b4b4b4]">
              <div
                className={`
              h-2 rounded-full transition-all
              ${isSoldOut ? 'bg-red-500' : 'bg-green-500'}
            `}
                style={{ width: `${soldPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-18 ">
              <span className="font-18">
                {soldPercentage.toFixed(0)}% Structural Co-ownership Sold
              </span>
              <span className="">
                <AiOutlineInfoCircle size={18} />
              </span>
            </div>

            <div className="w-full h-px bg-dark-grey/20"></div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-1 sm:gap-4">
              <div className="flex items-baseline gap-1 font-18 whitespace-nowrap">
                <p className="font-semibold  text-green">{totalBuyersCount}</p>
                <p>Investors</p>
              </div>

              <div className="flex items-baseline font-16 gap-1 whitespace-nowrap">
                <p className="font-semibold text-green">{rentalYield}%</p>
                <p>Rental Yield (P.A.)</p>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={isSoldOut}
              className={`
              relative overflow-hidden font-semibold font-16 w-full sm:w-auto
              px-6 py-2.5 rounded-xl text-white shadow-md
              transition-all duration-300 ease-in-out group shrink-0
              ${
                isSoldOut
                  ? 'bg-dark-grey cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] hover:shadow-[0_4px_14px_0_rgba(96,165,250,0.39)]'
              }
            `}
            >
              {isSoldOut ? 'Sold Out' : 'Buy Structural Co-ownership'}
            </button>
          </div>
          {isSoldOut && (
            <div
              className="
                mt-3
                text-center
                text-red-400
                text-sm
                animate-[pulse_1.6s_ease-in-out_infinite]
              "
            >
              All Structural Co-ownership for this property have been sold
            </div>
          )}
        </div>
      )}

      {showPriceCards && (
        <div
          className="xl:p-7 lg:p-5 p-4 lg:text-[16px] text-[12px] rounded-2xl 
                bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white md:max-w-[480px] space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/images/property-details/market-value.svg"
                alt="Market value"
                className="w-4 h-4 shrink-0 dark:invert"
              />
              <span>Market value</span>
            </div>
            <span>₹{marketValue.toLocaleString()}</span>
          </div>

          {/* Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/images/property-details/token.svg"
                alt="Price per token"
                className="w-4 h-4 shrink-0 dark:invert"
              />
              <span>Total sold Structural Co-ownership</span>
            </div>
            <span>
              {soldFraction.toFixed(0)}/{totalFraction.toFixed(0)}{' '}
            </span>
          </div>

          {/* Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/images/property-details/total-amount.svg"
                alt="Total sold"
                className="w-4 h-4 shrink-0 dark:invert"
              />
              <span>Total amount of Structural Co-ownership sold</span>
            </div>
            <span>₹{totalSoldAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div
        className="xl:p-7 lg:p-5 p-4 lg:text-[16px] text-[12px] rounded-2xl 
                bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white md:max-w-[480px] space-y-3 shadow-sm"
      >
        {/* Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/property-details/total-amount.svg"
              alt="Total sold"
              className="w-4 h-4 shrink-0 dark:invert"
            />
            <span>Interested Count</span>
          </div>
          <span>{interestCount} Members</span>
        </div>

        {/* Row */}
        {!showPriceCards && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/images/property-details/token.svg"
                alt="Price per token"
                className="w-4 h-4 shrink-0 dark:invert"
              />
              <span>Current Status</span>
            </div>
            <span className={isInterested ? 'text-green-600' : 'text-red-500'}>
              {isInterested ? 'Interested' : 'Not Interested'}
            </span>
          </div>
        )}
        {!showPriceCards && asset?.isDocumentLocked && (
          <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
              <span className="text-red-500 text-sm leading-relaxed">
                {isGroupJoined
                  ? 'Pay below to access the detailed property verification report and verified documents.'
                  : "Join this property's primary club to unlock the detailed report."}
              </span>
            </div>
            {!isGroupJoined ? (
              onPayNow && (
                <button
                  type="button"
                  onClick={onPayNow}
                  disabled={isJoiningGroup}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-semibold text-sm transition-all duration-300 hover:brightness-110 active:scale-95 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isJoiningGroup ? 'Joining...' : 'Join Club'}
                </button>
              )
            ) : isPaymentPending ? (
              <div className="w-full py-2 rounded-lg bg-yellow-500/10 text-yellow-500 font-semibold text-sm text-center">
                Your payment is pending verification.
              </div>
            ) : (
              onPayNow && (
                <button
                  type="button"
                  onClick={onPayNow}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-semibold text-sm transition-all duration-300 hover:brightness-110 active:scale-95 shadow-md cursor-pointer"
                >
                  {isPaymentFailed ? 'Retry Payment' : 'Pay Now'}
                </button>
              )
            )}
          </div>
        )}

        {/* Row */}
      </div>

      <CommonModal
        isOpen={showInterestModal}
        onClose={closeInterestModal}
        title={
          interestStep === 'ask'
            ? 'Purchase Interest'
            : interestStep === 'yes'
              ? 'Confirm Purchase'
              : 'Tell Us Why'
        }
        className="max-w-[420px] mx-auto"
        contentClassName="p-6 pt-2"
      >
        {interestStep === 'ask' && (
          <div className="space-y-5">
            <p className="font-15 text-[#0B2545]/80 dark:text-white/80 leading-relaxed">
              Are you interested in purchasing this Structural Co-ownership?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInterestStep('yes')}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-semibold font-14 transition hover:brightness-110 active:scale-95 shadow-md cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setInterestStep('no')}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white font-semibold font-14 transition hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        )}

        {interestStep === 'yes' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setInterestStep('ask')}
              className="text-[12px] font-semibold text-[#1F4FE0] hover:underline"
            >
              ← Back
            </button>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeChecked}
                onChange={(e) => setAgreeChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1F4FE0] cursor-pointer"
              />
              <span className="font-13 text-[#0B2545]/80 dark:text-white/80 leading-relaxed">
                All the legal document have been verified by the validators and
                you are purchasing the fractions at your own risk, we are not
                providing any guarantee.
              </span>
            </label>

            <button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={!agreeChecked || isSigningConsent}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningConsent ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        )}

        {interestStep === 'no' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setInterestStep('ask')}
              className="text-[12px] font-semibold text-[#1F4FE0] hover:underline"
            >
              ← Back
            </button>

            <label className="font-14 text-[#0B2545]/70 dark:text-white/70 block">
              Please tell us why you are not interested
            </label>
            <textarea
              value={noReason}
              onChange={(e) => setNoReason(e.target.value)}
              rows={4}
              placeholder="Enter your reason..."
              className="w-full border border-[#E3E7EE] dark:border-white/10 rounded-lg px-4 py-3 font-14 text-[#0B2545] dark:text-white placeholder:text-[#0B2545]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#1F4FE0] bg-transparent resize-none"
            />
            <button
              type="button"
              onClick={handleRejectPurchase}
              disabled={!noReason.trim() || isSigningConsent}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningConsent ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}
      </CommonModal>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        redirect={statusModal.redirect}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => {
          setStatusModal((prev) => ({ ...prev, open: false }));
          if (statusModal.status === 'success') {
            closeInterestModal();
          }
        }}
        onRedirect={() => {
          setStatusModal((prev) => ({ ...prev, open: false }));
          proceedToBuy();
        }}
      />
    </div>
  );
}
