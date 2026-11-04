/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import Button2 from '@/components/UI/Button2';
import { useOnboarding } from '@/hooks';
import type { RootState } from '@/redux/store';
import { useEffect, useMemo, useState, useRef } from 'react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { FiMinus, FiShield } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { FaAngleRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { usePropertyDetails } from '@/api';
import { useBuyAssetFractions } from '@/api/assetPurchase.api';
import { useProperties } from '@/api/properties.api';
import { useMyWallet } from '@/api/wallet.api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import StatusModal from '@/components/Modals/Status';
import { IoLocationOutline } from 'react-icons/io5';
import HandleBack from '@/components/UI/Handleback';
import InterestPaymentModal from '@/components/Modals/InterestPaymentModal';
import { MdCurrencyRupee, MdClose } from 'react-icons/md';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';
import CommonModal from '@/components/CommonModal';
import { applyCouponApi } from '@/api/coupons.api';
import type { IApplyCouponResponse } from '@/api/coupons.api';
import dayjs from 'dayjs';

type Asset = {
  id: number;
  title: string;
  type: string;
  verified?: boolean;
  location: string;
  investment: number;
  ownership: number;
  yield: number;
  value: number;
  growth: number;
  image?: string;
  priceFraction: number;
  roi: number;
  savedyield: number;
  totalFractions?: number;
  soldFractions?: number;
  remainingFractions?: number;
  isSoldOut?: boolean;
};

export default function BuyFraction() {
  const { state } = useLocation() as {
    state?: { assetId?: number; groupId?: number };
  };

  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<number | ''>(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] =
    useState<IApplyCouponResponse | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const unitsInputRef = useRef<HTMLInputElement>(null);

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title?: string;
    message?: string;
    subMessage?: string;
  }>({
    open: false,
    status: 'success',
  });

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  const {
    canInvest,
    kycMessage,
    // nextStepRoute,
    isUnderReview,
    isRejected,
    isCompany,
  } = useOnboarding();

  const { data: propertyRes } = usePropertyDetails(
    state?.assetId ? String(state.assetId) : undefined
  );

  const { mutateAsync: buyFractions, isLoading: buying } =
    useBuyAssetFractions();

  const { data: walletRes } = useMyWallet();

  const { data: recommendedPages, isLoading: recommendedLoading } =
    useProperties({
      assetStatus: 'Available',
      isVisible: true,
      groupId: state?.groupId,
    });

  const isPageLoading =
    !propertyRes ||
    !walletRes ||
    recommendedLoading ||
    (propertyRes && !propertyRes.success);

  useEffect(() => {
    if (!isPageLoading && unitsInputRef.current) {
      setTimeout(() => {
        unitsInputRef.current?.focus();
      }, 100);
    }
  }, [isPageLoading]);

  useEffect(() => {
    if (!propertyRes || !propertyRes.success) return;

    const p = propertyRes.data;

    const city =
      p?.meta?.find((m: any) => m.metaKey === 'city')?.metaValue ?? '';
    const stateVal =
      p?.meta?.find((m: any) => m.metaKey === 'state')?.metaValue ?? '';

    setAssets([
      {
        id: p?.id || 0,
        title: p?.assetTitle || '',
        type: '',
        location: `${city}${city && stateVal ? ', ' : ''}${stateVal}`,
        investment: 0,
        ownership: 0,
        yield: Number(p?.financials?.yield?.actualYieldPercent ?? 0),
        value: 0,
        growth: 0,
        priceFraction: p?.financials
          ? Number(p?.financials?.perFraction?.price ?? 0)
          : Number(p?.price?.currentPricePerFraction ?? 0),
        roi: Number(p?.financials?.roi?.fiveYearROI ?? 0),
        savedyield: 0,
        image:
          p?.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
            ?.documentUrl ?? '',
      },
    ]);
  }, [propertyRes]);

  const savedAssets = useMemo<Asset[]>(() => {
    const items =
      recommendedPages?.pages.flatMap((p: any) => p?.data?.data ?? []) ?? [];

    return items
      .filter((a: any) => a.id !== state?.assetId)
      .map((a: any) => {
        const city =
          a.meta?.find((m: any) => m.metaKey === 'city')?.metaValue ?? '';
        const stateVal =
          a.meta?.find((m: any) => m.metaKey === 'state')?.metaValue ?? '';

        return {
          id: a.id,
          title: a.assetTitle,
          type: '',
          location: `${city}${city && stateVal ? ', ' : ''}${stateVal}`,
          investment: 0,
          ownership: 0,
          yield: Number(a.financials?.yield?.actualYieldPercent ?? 0),
          value: 0,
          growth: 0,
          priceFraction: a.financials
            ? Number(a.financials?.perFraction?.price ?? 0)
            : Number(a.currentPricePerFraction ?? 0),
          roi: Number(a.financials?.roi?.fiveYearROI ?? 0),
          savedyield: 0,
          image:
            a.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
              ?.documentUrl ?? '',
        };
      });
  }, [recommendedPages, state?.assetId]);

  const maxAvailableUnits = useMemo(() => {
    if (!propertyRes?.success) return 0;

    return Number(
      propertyRes?.data?.remainingFractions ??
        Math.max(
          0,
          (propertyRes?.data?.totalFractions ?? 0) -
            (propertyRes?.data?.soldFractions ?? 0)
        )
    );
  }, [propertyRes]);

  const isSoldOut = useMemo(() => {
    if (!propertyRes?.success) return false;
    return propertyRes?.data?.isSoldOut === true || maxAvailableUnits <= 0;
  }, [propertyRes, maxAvailableUnits]);

  const asset = useMemo(() => assets[0], [assets]);

  const totalPayable = useMemo(() => {
    if (typeof units !== 'number' || !asset) return 0;
    return units * asset.priceFraction;
  }, [units, asset?.priceFraction]);

  const finalPayable = useMemo(() => {
    let amount = totalPayable;
    if (appliedCoupon) {
      amount = totalPayable - appliedCoupon.discountAmount;
    }
    return Math.max(0, amount);
  }, [totalPayable, appliedCoupon]);

  useEffect(() => {
    if (appliedCoupon && typeof units === 'number' && units > 0) {
      const revalidateCoupon = async () => {
        try {
          const newTotal = units * (asset?.priceFraction || 0);
          const res = await applyCouponApi(appliedCoupon.code, newTotal);
          if (res.success && res.data) {
            setAppliedCoupon(res.data);
            setCouponError('');
          } else {
            setCouponError(res.message || 'Coupon invalid for this amount');
            setAppliedCoupon({
              ...appliedCoupon,
              discountAmount: 0,
              finalAmount: newTotal,
            });
          }
        } catch (err: any) {
          setCouponError(err?.message || 'Failed to re-apply coupon');
          setAppliedCoupon({
            ...appliedCoupon,
            discountAmount: 0,
            finalAmount: units * (asset?.priceFraction || 0),
          });
        }
      };

      const debounceTimeout = setTimeout(() => {
        revalidateCoupon();
      }, 500);

      return () => clearTimeout(debounceTimeout);
    } else if (units === '' || units === 0) {
      if (appliedCoupon) {
        setCouponError(
          'Select structural co-ownership to apply a promotional code'
        );
      }
    }
  }, [units]);

  const walletBalance = useMemo(
    () => walletRes?.data?.availableBalance ?? 0,
    [walletRes]
  );

  const hasUnits = useMemo(
    () => typeof units === 'number' && units > 0,
    [units]
  );

  const hasSufficientBalance = useMemo(
    () => hasUnits && finalPayable <= walletBalance,
    [hasUnits, finalPayable, walletBalance]
  );

  const balanceShortfall = useMemo(
    () =>
      hasUnits && finalPayable > walletBalance
        ? finalPayable - walletBalance
        : 0,
    [hasUnits, finalPayable, walletBalance]
  );

  const handleApplyCoupon = async () => {
    if (!couponCode || !hasUnits || isApplyingCoupon) return;
    setCouponError('');
    setIsApplyingCoupon(true);

    try {
      const res = await applyCouponApi(couponCode, totalPayable);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
      } else {
        setCouponError(res.message || 'Invalid Coupon Code');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleBuy = () => {
    if (isSoldOut || maxAvailableUnits <= 0) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Property Sold Out',
        message:
          'All Structural Co-ownership for this property have already been sold.',
        subMessage: '',
      });
      return;
    }

    if (!asset || !hasUnits) return;

    if (!canInvest) {
      if (isCompany) {
        navigate('/dashboard/onboarding');
      } else {
        // navigate('/dashboard/onboarding/user-kyc');
        navigate('/dashboard/kyc');
      }
      return;
    }

    if (!hasSufficientBalance) {
      setShowAddMoney(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedBuy = async () => {
    setShowConfirmModal(false);
    try {
      const cleanCoupon = appliedCoupon?.code?.trim();

      const res = await buyFractions({
        assetId: asset!.id,
        fractions: Number(units),
        ...(cleanCoupon ? { couponCode: cleanCoupon } : {}),
      });

      if (!res || res.success === false) {
        throw new Error(
          res?.message ||
            'Requested number of Structural Co-ownership is not available for purchase.'
        );
      }

      setStatusModal({
        open: true,
        status: 'success',
        title: 'Investment Successful',
        message: 'Your investment has been recorded successfully.',
        subMessage:
          'You can view the details and track performance from your portfolio.',
      });
    } catch (err: any) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Investment Failed',
        message:
          err?.message ||
          'Requested number of Structural Co-ownership is not available for purchase.',
        subMessage: 'Please reduce the number of units and try again.',
      });
    }
  };

  if (isPageLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-[#0B0B0B]">
        <Loader />
      </section>
    );
  }

  if (propertyRes && !propertyRes.success) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white p-4">
        <div className="text-center space-y-4">
          <p className="font-24 font-semibold">
            Failed to load property details
          </p>
          <Button2
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            Back to Dashboard
          </Button2>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`mx-auto relative text-[#0B2545] dark:text-white font-work  px-4 lg:px-10 bg-[#F4F6F9] dark:bg-[#0B0B0B] ${
        !isAuthenticated
          ? 'pt-24 md:pt-32'
          : canInvest
            ? 'pt-24'
            : isUnderReview
              ? 'pt-40'
              : 'pt-40'
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-4 xl:gap-6 md:px-0 max-w-[1600px] mx-auto pt-5"
      >
        <div className="md:col-span-3 lg:col-span-2 space-y-6 lg:space-y-8 mb-4">
          <div className="w-full">
            {assets.map((a) => (
              <div key={a.id}>
                <BuyFractionCard asset={a} />
              </div>
            ))}
          </div>
          <div className="w-full bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="font-serif font-20 font-semibold text-[#0B2545] dark:text-white">
                  Structural Co-ownership to Buy{' '}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select how many units you wish to purchase.
                </p>
              </div>

              <div className="flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <button
                  disabled={
                    isSoldOut || typeof units !== 'number' || units <= 1
                  }
                  onClick={() =>
                    setUnits((u) =>
                      typeof u !== 'number' || u <= 1 ? 1 : u - 1
                    )
                  }
                  className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${isSoldOut || (typeof units === 'number' && units <= 1) ? 'opacity-40 cursor-not-allowed text-[#0B2545] dark:text-white' : 'text-[#0B2545] dark:text-white'}`}
                >
                  <FiMinus size={18} />
                </button>

                <input
                  ref={unitsInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={units}
                  onChange={(e) => {
                    if (isSoldOut) return;
                    const value = e.target.value;
                    if (!/^\d*$/.test(value)) return;
                    if (value === '') {
                      setUnits('');
                      return;
                    }
                    let numericValue = Number(value);
                    if (numericValue < 1) numericValue = 1;
                    if (
                      // maxAvailableUnits > 0 &&
                      // numericValue >= maxAvailableUnits

                      numericValue >= 100
                    ) {
                      setUnits(100);
                      // setUnits(maxAvailableUnits);
                      return;
                    }
                    setUnits(numericValue);
                  }}
                  onPaste={(e) => {
                    if (isSoldOut) {
                      e.preventDefault();
                      return;
                    }
                    const pasted = e.clipboardData.getData('text');
                    if (!/^\d+$/.test(pasted)) {
                      e.preventDefault();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (isSoldOut || e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                  disabled={isSoldOut}
                  className="w-16 text-center bg-transparent border-x border-[#E3E7EE] dark:border-white/10 py-3 text-[#0B2545] dark:text-white font-semibold font-20 outline-none
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  disabled={
                    isSoldOut ||
                    typeof units !== 'number' ||
                    (maxAvailableUnits > 0 && units >= 100)
                    // (
                    //   maxAvailableUnits > 0 && units >= maxAvailableUnits
                    // )
                  }
                  onClick={() =>
                    setUnits((u) => {
                      if (typeof u !== 'number') return 1;
                      const next = u + 1;
                      // if (maxAvailableUnits > 0 && next >= maxAvailableUnits)
                      if (maxAvailableUnits > 0 && next >= 100)
                        // return maxAvailableUnits;
                        return 100;
                      return next;
                    })
                  }
                  className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${isSoldOut || (typeof units === 'number' && units >= maxAvailableUnits) ? 'opacity-40 cursor-not-allowed text-[#0B2545] dark:text-white' : 'text-[#0B2545] dark:text-white'}`}
                >
                  <GoPlus size={18} />
                </button>
              </div>
            </div>

            {/* Availability Warning */}
            {maxAvailableUnits > 0 &&
              typeof units === 'number' &&
              units > maxAvailableUnits && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  Only {maxAvailableUnits} Structural Co-ownership available.
                </p>
              )}
            {isSoldOut && (
              <p className="text-red-400 text-sm">
                This property is completely sold out.
              </p>
            )}
          </div>

          <div className="w-full bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif font-20 font-semibold mb-2 text-[#0B2545] dark:text-white">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <p className="font-16">Expected Rental Yield (Annual)</p>
                <p className="font-18 font-medium text-[#0B2545] dark:text-white">
                  {asset?.yield ?? 0}% P.A.
                </p>
              </div>

              <div className="w-full h-px bg-gray-200 dark:bg-white/10" />

              <div className="flex justify-between items-center">
                <p className="font-18 text-[#0B2545] dark:text-white">
                  Original Amount
                </p>
                <p
                  className={`flex items-center font-24 font-semibold ${appliedCoupon ? 'text-gray-500 dark:text-gray-400 line-through decoration-red-500/50 decoration-2' : 'text-[#0B2545] dark:text-white'}`}
                >
                  <FaIndianRupeeSign className="mr-1 text-sm" />{' '}
                  {totalPayable.toLocaleString()}
                </p>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-start text-green-500">
                  <div>
                    <p className="font-18 flex items-center gap-2">
                      Discount
                      <span className="text-xs bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 whitespace-nowrap">
                        {appliedCoupon.discountType === 'Percentage' ||
                        appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% OFF`
                          : `₹${appliedCoupon.discountValue} OFF`}
                      </span>
                    </p>
                  </div>
                  <p className="flex items-center font-24 font-semibold">
                    - <FaIndianRupeeSign className="mr-1 text-sm" />{' '}
                    {appliedCoupon.discountAmount.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="w-full h-px bg-gray-300 dark:bg-white/20" />

              <div className="flex justify-between items-center">
                <p className="font-20 font-medium text-[#0B2545] dark:text-white">
                  Final Payable Amount
                </p>
                <p className="flex items-center font-32 font-bold text-[#0B2545] dark:text-white tracking-tight">
                  <FaIndianRupeeSign className="mr-1 text-xl" />{' '}
                  {finalPayable.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Wallet Info inside summary for proximity */}
            <div className="mt-8 pt-6 border-t border-dashed border-[#E3E7EE] dark:border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-[#E3E7EE] dark:border-white/10">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Paying from Wallet Balance
                  </p>
                  <p className="flex items-center font-20 font-semibold text-[#0B2545] dark:text-white">
                    <FaIndianRupeeSign size={14} className="mr-1" />{' '}
                    {walletBalance.toLocaleString()}
                  </p>
                </div>
                {balanceShortfall > 0 ? (
                  <div className="text-right">
                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                      Shortfall: ₹{balanceShortfall.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                      Sufficient Balance
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Input Section directly inside summary */}
            <div className="pt-4 space-y-3">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Apply Promo Code
              </label>
              <div className="flex sm:flex-row flex-col items-center gap-3">
                <div className="relative flex-1 w-full flex items-center bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-xl focus-within:border-gray-300 dark:focus-within:border-white/20 transition-colors shadow-sm">
                  <div className="pl-4 text-inactive-gray opacity-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.42 10.922a2 2 0 0 1-.576 1.398l-10.4 10.4a2 2 0 1 1-2.828-2.828l10.4-10.4a2 2 0 0 1 1.398-.576l.162-.007a2 2 0 0 1 2.062 1.84L21.42 10.922Z" />
                      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={appliedCoupon ? appliedCoupon.code : couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    disabled={!!appliedCoupon || !hasUnits}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !appliedCoupon &&
                        couponCode &&
                        hasUnits
                      ) {
                        handleApplyCoupon();
                      }
                    }}
                    className={`w-full bg-transparent outline-none px-3 py-3.5 text-[#0B2545] dark:text-white font-medium tracking-wider
                          ${!!appliedCoupon || !hasUnits ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                  />
                  {(appliedCoupon || couponError) && (
                    <button
                      onClick={handleRemoveCoupon}
                      className="absolute right-3 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-[#0B2545] dark:hover:text-white transition-all"
                    >
                      <MdClose size={18} />
                    </button>
                  )}
                </div>

                {!appliedCoupon && (
                  <Button2
                    disabled={
                      !couponCode ||
                      !!appliedCoupon ||
                      !hasUnits ||
                      isApplyingCoupon
                    }
                    onClick={handleApplyCoupon}
                    className="px-6 py-3.5 text-[#0B2545] dark:text-white bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl min-w-[100px] flex justify-center items-center transition-colors shadow-sm"
                  >
                    {isApplyingCoupon ? (
                      <span className="w-5 h-5 border-2 border-[#E3E7EE] dark:border-white/10 border-t-[#0B2545] dark:border-t-white rounded-full animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button2>
                )}
              </div>

              {couponError && (
                <p className="text-red-400 text-sm mt-1 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                  {couponError}
                </p>
              )}

              {appliedCoupon && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-3 space-y-2">
                  <p className="text-green-600 dark:text-green-400 font-medium flex items-center justify-between">
                    <span>
                      {appliedCoupon.message ||
                        `Coupon ${appliedCoupon.code} applied successfully!`}
                    </span>
                    <span className="bg-green-500/20 px-2 py-1 rounded-md text-xs tracking-wide">
                      SAVED ₹{appliedCoupon.discountAmount.toLocaleString()}
                    </span>
                  </p>

                  {appliedCoupon.coupon?.description && (
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      {appliedCoupon.coupon.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-green-500/10 text-xs text-green-600/70 dark:text-green-400/60 mt-2">
                    {appliedCoupon.coupon?.minPurchaseAmount && (
                      <p>
                        Min Purchase:{' '}
                        <span className="text-green-700 dark:text-green-400/90">
                          ₹
                          {Number(
                            appliedCoupon.coupon.minPurchaseAmount
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}
                    {appliedCoupon.coupon?.maxDiscountAmount && (
                      <p>
                        Max Discount:{' '}
                        <span className="text-green-700 dark:text-green-400/90">
                          ₹
                          {Number(
                            appliedCoupon.coupon.maxDiscountAmount
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}
                    {appliedCoupon.coupon?.validTill && (
                      <p>
                        Valid Till:{' '}
                        <span className="text-green-700 dark:text-green-400/90">
                          {dayjs(appliedCoupon.coupon.validTill).format(
                            'MMM DD, YYYY'
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!hasUnits && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Select Structural Co-ownership to apply a promotional code
                </p>
              )}
            </div>
          </div>

          {isSoldOut && (
            <p className="text-red-400 text-sm mt-2">
              This property is sold out. No Structural Co-ownership are
              available for purchase.
            </p>
          )}

          {maxAvailableUnits > 0 &&
            typeof units === 'number' &&
            units > maxAvailableUnits && (
              <p className="text-red-400 text-sm mt-2">
                Only {maxAvailableUnits} Structural Co-ownership are available
                for purchase.
              </p>
            )}

          {!canInvest && kycMessage && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-500 text-sm mb-4">
              <p className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {kycMessage}
              </p>
            </div>
          )}

          <div className="pt-2 pb-6">
            <Button2
              disabled={
                buying ||
                isSoldOut ||
                !hasUnits ||
                (typeof units === 'number' && units > 100)
              }
              onClick={handleBuy}
              className={`relative overflow-hidden font-semibold font-20 w-full group/btn
                transition-all duration-300 ease-in-out
                ${buying || isSoldOut || !hasUnits ? 'bg-gray-300 dark:bg-white/20 opacity-50 cursor-not-allowed pointer-events-none' : 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'}
                px-5 py-4 rounded-xl text-white
            `}
            >
              {buying && (
                <span className="absolute inset-0 bg-white/20 animate-pulse" />
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSoldOut
                  ? 'Sold Out'
                  : !hasUnits
                    ? 'Enter Units to Continue'
                    : !canInvest
                      ? isUnderReview
                        ? 'KYC Under Review'
                        : isRejected
                          ? 'Resubmit KYC'
                          : 'Complete KYC to Invest'
                      : hasSufficientBalance
                        ? buying
                          ? 'Processing...'
                          : 'Confirm Invest'
                        : 'Add Money to Wallet'}
              </span>
            </Button2>
          </div>

          <HandleBack />
        </div>

        <div className="space-y-4 md:col-span-2 lg:col-span-1 border-l border-[#E3E7EE] dark:border-white/10 pl-0 md:pl-4 lg:pl-6 mb-4">
          <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] p-5 shadow-sm">
            <h3 className="font-serif font-24 text-[#0B2545] dark:text-white font-semibold mb-5 pb-3 border-b border-[#E3E7EE] dark:border-white/10">
              Explore Properties
            </h3>

            <div className="space-y-5 overflow-y-auto max-h-[800px] scrollbar-ui pr-1">
              {recommendedLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[140px] bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse"
                  />
                ))
              ) : savedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                  <p className="font-18 font-medium text-[#0B2545] dark:text-white ">
                    No properties to explore
                  </p>
                  <p className="font-14 mt-1">
                    Please check back later. New properties will appear here.
                  </p>
                </div>
              ) : (
                savedAssets.map((a) => <RecommendedCard key={a.id} asset={a} />)
              )}
            </div>
          </div>
          {/* <div className="w-full h-px bg-gray-300 dark:bg-white/20" /> */}
        </div>
      </motion.div>
      {showAddMoney && (
        <InterestPaymentModal
          open={showAddMoney}
          type="deposit"
          amount={finalPayable}
          onClose={async () => {
            setShowAddMoney(false);

            await queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
            await queryClient.refetchQueries({ queryKey: ['my-wallet'] });
          }}
          onSuccess={async () => {
            setShowAddMoney(false);

            await queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
            await queryClient.refetchQueries({ queryKey: ['my-wallet'] });
          }}
        />
      )}
      <ConfirmInvestModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedBuy}
        assetName={asset?.title ?? ''}
        fractions={typeof units === 'number' ? units : 0}
        pricePerFraction={asset?.priceFraction ?? 0}
        totalPayable={totalPayable}
        finalPayable={finalPayable}
        appliedCoupon={appliedCoupon}
        buying={buying}
      />
      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        subMessage={statusModal.subMessage}
        onClose={() => {
          setStatusModal({ ...statusModal, open: false });
          if (statusModal.status === 'success') {
            // navigate('/dashboard/assets');
            navigate('/dashboard/my-holdings');
          }
        }}
        onContinue={() => {
          setStatusModal({ ...statusModal, open: false });
          if (statusModal.status === 'success') {
            // navigate('/dashboard/assets');
            navigate('/dashboard/my-holdings');
          }
        }}
      />
    </section>
  );
}

function BuyFractionCard({ asset }: { asset: Asset }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const imageUrl = (asset.image || '').startsWith('http')
    ? asset.image
    : `${API_BASE_URL}/storage/${asset.image}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 w-full bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white rounded-2xl p-4 xl:p-6 lg:gap-x-6 gap-y-4 border border-gray-200 dark:border-white/15 shadow-sm">
      <div className="col-span-2 md:col-span-1 xl:col-span-2 h-[220px] lg:h-[260px] xl:h-[280px]">
        <img
          src={`${imageUrl}`}
          alt={asset.title}
          className="object-cover object-center h-full w-full rounded-xl transition-transform duration-300"
        />
      </div>
      <div className="col-span-3 lg:col-span-2 xl:col-span-3 space-y-4 flex flex-col justify-center">
        <div>
          <h3 className="font-serif font-28 font-semibold text-[#0B2545] dark:text-white tracking-tight">
            {asset.title}
          </h3>
          <p className="flex items-center gap-2 font-16 text-gray-500 dark:text-gray-400 mt-1">
            <IoLocationOutline size={18} />
            {asset.location}
          </p>
        </div>
        <div className="w-full h-px bg-gray-200 dark:bg-white/10 " />
        <div className="space-y-2">
          <p className="flex justify-between font-16 font-normal text-gray-500 dark:text-gray-400">
            Price of Structural Co-ownership:
            <span className="flex items-center text-[#0B2545] dark:text-white font-semibold font-20">
              <MdCurrencyRupee />
              {asset.priceFraction.toLocaleString()}
            </span>
          </p>
          <p className="flex justify-between font-16 font-normal text-gray-500 dark:text-gray-400">
            Return of Investment:
            <span className="text-green-600 dark:text-green-400 font-medium font-18">
              {asset.roi}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RecommendedCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const imageUrl = (asset.image || '').startsWith('http')
    ? asset.image
    : `${API_BASE_URL}/storage/${asset.image}`;
  return (
    <div
      className="flex flex-col sm:flex-row lg:flex-col 2xl:flex-row w-full bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden mb-4 cursor-pointer"
      onClick={() => navigate(`/property-details/${asset.id}`)}
    >
      <div className="w-full sm:w-2/5 lg:w-full 2xl:w-2/5 aspect-video overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif font-semibold text-[#0B2545] dark:text-white text-lg line-clamp-1">
              {asset.title}
            </h3>
            {asset.verified && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-green/30 bg-green/10 text-green text-[8px] font-bold uppercase tracking-wider shrink-0">
                <FiShield size={8} />
                Verified
              </div>
            )}
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
            <IoLocationOutline className="text-sm shrink-0" />
            {asset.location}
          </p>
        </div>

        <div className="w-full h-px bg-gray-100 dark:bg-white/10" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">
              Price of Structural Co-ownership:
            </span>
            <span className="font-semibold text-[#0B2545] dark:text-white">
              ₹ {asset.priceFraction.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">ROI:</span>
            <span className="font-semibold text-green">{asset.roi}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Yield:</span>
            <span className="font-semibold text-blue-500">{asset.yield}%</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property-details/${asset.id}`);
          }}
          className="w-full text-white font-semibold rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer overflow-hidden relative group/btn py-3 flex items-center justify-center gap-2"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <span className="relative z-10 flex items-center gap-2">
            View Details{' '}
            <FaAngleRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );
}

interface ConfirmInvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assetName: string;
  fractions: number;
  pricePerFraction: number;
  totalPayable: number;
  finalPayable: number;
  appliedCoupon: IApplyCouponResponse | null;
  buying: boolean;
}

function ConfirmInvestModal({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  fractions,
  pricePerFraction,
  totalPayable,
  finalPayable,
  appliedCoupon,
  buying,
}: ConfirmInvestModalProps) {
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Investment"
      className="max-w-[480px]"
    >
      <div className="space-y-5">
        {/* Asset info */}
        <div className="bg-white dark:bg-[#132436] rounded-xl p-4 border border-[#E3E7EE] dark:border-white/10 space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Asset
          </p>
          <p className="font-semibold text-[#0B2545] dark:text-white font-18 leading-snug">
            {assetName}
          </p>
        </div>

        {/* Purchase breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Structural Co-ownership
            </span>
            <span className="font-semibold text-[#0B2545] dark:text-white">
              {fractions}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Price per Structural Co-ownership
            </span>
            <span className="font-semibold text-[#0B2545] dark:text-white flex items-center gap-0.5">
              <MdCurrencyRupee size={15} />
              {pricePerFraction.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-white/10" />

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span
              className={`font-semibold flex items-center gap-0.5 ${appliedCoupon ? 'text-gray-500 dark:text-gray-400 line-through decoration-red-500/50 decoration-2' : 'text-[#0B2545] dark:text-white'}`}
            >
              <MdCurrencyRupee size={15} />
              {totalPayable.toLocaleString()}
            </span>
          </div>

          {appliedCoupon && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-500 flex items-center gap-2">
                  Coupon
                  <span className="bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-xs tracking-wide font-medium">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-green-500/80">
                    {appliedCoupon.discountType === 'Percentage' ||
                    appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.discountValue}% OFF`
                      : `₹${appliedCoupon.discountValue} OFF`}
                  </span>
                </span>
                <span className="font-semibold text-green-500 flex items-center gap-0.5">
                  - <MdCurrencyRupee size={15} />
                  {appliedCoupon.discountAmount.toLocaleString()}
                </span>
              </div>

              {appliedCoupon.coupon?.description && (
                <p className="text-xs text-green-500/70 bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                  {appliedCoupon.coupon.description}
                </p>
              )}
            </>
          )}

          <div className="w-full h-px bg-gray-300 dark:bg-white/20" />

          <div className="flex justify-between items-center">
            <span className="font-medium text-[#0B2545] dark:text-white">
              Total Payable
            </span>
            <span className="font-bold text-[#0B2545] dark:text-white font-24 flex items-center gap-0.5">
              <MdCurrencyRupee size={20} />
              {finalPayable.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={buying}
            className="flex-1 py-3.5 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={buying}
            className="flex-1 relative overflow-hidden py-3.5 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {buying ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
