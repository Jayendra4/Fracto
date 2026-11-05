/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset/meta handling, matches the pattern in rwa.api.ts */
import { Breadcrumb } from '@/components/Breadcrumb';
import FractionCard from '@/components/Property/FractionCard';
import ImageGallery from '@/components/Property/ImageGallery';
import InvestmentCalculatorChart from '@/components/Property/InvestmentCalculatorChart';
import PropertyDescribtion from '@/components/Property/PropertyDescribtion';
import PropertyHeader from '@/components/Property/PropertyHeader';
import WhyTheyInvested from '@/components/Property/WhyTheyInvested';
import { useOnboarding } from '@/hooks';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePropertyDetails } from '@/api';
import Loader from '@/components/Loader';
import { useEffect, useState } from 'react';
import Button2 from '@/components/UI/Button2';
import { GoBookmark, GoBookmarkFill } from 'react-icons/go';
import { useSaveAsset } from '@/api/saveAsset.api';
import HandleBack from '@/components/UI/Handleback';
import { AnimatePresence, motion } from 'framer-motion';
import PriceComingSoon from './PriceComingSoon';
import { getFileType } from '@/utils';
import {
  MdLock,
  MdLockOpen,
  MdPictureAsPdf,
  MdVisibility,
} from 'react-icons/md';
import { RxCross1 } from 'react-icons/rx';

import StatusModal from '@/components/Modals/Status';
import InterestPaymentModal from '@/components/Modals/InterestPaymentModal';
import { IoChatbubble } from 'react-icons/io5';
import { createPropertyChatApi } from '@/api/chat.api';
import { useQueryClient } from '@tanstack/react-query';
import { useJoinedGroups, useJoinGroup } from '@/api/group.api';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = usePropertyDetails(id);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const location = useLocation();
  const iconShow = location?.state?.iconShow || false;
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.authLogin
  );

  const [preview, setPreview] = useState<{
    url: string;
    type: 'image' | 'video' | 'pdf';
  } | null>(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'error' as 'success' | 'error',
    title: '',
    message: '',
  });

  const [docsOpen, setDocsOpen] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isPaid =
    data?.success && data?.data && data?.data?.isDocumentLocked == false;

  const unlockAssetId =
    (data?.success && data?.data?.sharedAsset?.id) || Number(id);
  const unlockAmount = data?.success
    ? data?.data?.sharedAsset?.tokenAmount
    : undefined;

  const { mutateAsync: saveAsset, isPending: saving } = useSaveAsset();

  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Documents can only be unlocked once the user has joined the asset's
  // primary club — same requirement as /primary-club-details/:id.
  const groupId = data?.success ? (data.data as any)?.groupId : undefined;
  const accountId = user?.id;
  const { data: joinedGroups } = useJoinedGroups(accountId, isAuthenticated);
  const isGroupJoined =
    joinedGroups?.find((g) => g.id === groupId)?.isJoined ?? false;
  const { mutate: joinGroup, isPending: isJoiningGroup } = useJoinGroup();

  const handleUnlockClick = () => {
    if (!groupId || isGroupJoined) {
      setShowUnlockModal(true);
      return;
    }
    joinGroup(groupId, {
      onSuccess: () => {
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Success',
          message: 'You have successfully joined the club',
        });
      },
      onError: (err: any) => {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err?.message || 'Failed to join primary club',
        });
      },
    });
  };

  useEffect(() => {
    if (data?.success && data.data) {
      const hofUser = JSON.parse(localStorage.getItem('hof_user') || '{}');
      const currentAccountId =
        hofUser?.accountId ?? hofUser?.user?.accountId ?? hofUser?.id;

      const isAlreadySaved =
        !!currentAccountId &&
        Array.isArray(data.data.savedAssets) &&
        data.data.savedAssets.some(
          (item: any) =>
            item.assetId === Number(id) && item.accountId === currentAccountId
        );

      setIsSaved(isAlreadySaved);
    }
  }, [data, id]);

  const allDocuments =
    (data?.success &&
      data.data?.documents?.filter(
        (doc: any) =>
          doc.documentType !== 'ASSET_IMAGE' &&
          doc.documentType !== 'ASSET_VIDEO'
      )) ||
    [];

  const getMeta = (key: string) =>
    (data?.success &&
      data.data?.meta?.find((m: any) => m.metaKey === key)?.metaValue) ||
    '';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSave = async () => {
    setIsSaved((prev) => !prev);

    try {
      await saveAsset({
        assetId: Number(id),
        isFavourite: !isSaved,
      });
    } catch {
      setIsSaved((prev) => !prev);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white flex items-center justify-center">
        <Loader />
      </section>
    );
  }

  if (isError || !data || !data.success) {
    return (
      <section className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white flex items-center justify-center font-18">
        Failed to load property details
      </section>
    );
  }

  const handleStartChat = async (assetId: number) => {
    try {
      const response = await createPropertyChatApi(assetId);
      if (response.success && response.data) {
        await queryClient.invalidateQueries({ queryKey: ['my-chats'] });
        navigate('/dashboard/messages', {
          state: { newChatId: response.data.id },
        });
      }
    } catch (err) {
      console.error('❌ Chat Creation Error:', err);
    }
  };

  const renderDocCard = (doc: any) => {
    const rawUrl = doc.documentUrl ?? null;
    const url =
      isPaid && rawUrl
        ? rawUrl.startsWith('http')
          ? rawUrl
          : `${import.meta.env.VITE_API_URL}/storage/${rawUrl}`
        : null;
    const type = getFileType(rawUrl ?? '');

    return (
      <div
        key={doc.id}
        className={`bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-hidden transition ${
          isPaid
            ? 'cursor-pointer hover:border-[#73B7FF]/50'
            : 'cursor-not-allowed'
        }`}
        onClick={() => isPaid && url && setPreview({ url, type: type as any })}
      >
        <div className="relative aspect-video bg-black/30 overflow-hidden group">
          {!isPaid && (
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center gap-1">
              <MdLock size={28} className="text-white/70" />
            </div>
          )}

          {isPaid && url && type === 'image' && (
            <img
              src={url}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              alt={doc.documentName}
            />
          )}

          {type === 'pdf' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
              <MdPictureAsPdf
                size={48}
                className={!isPaid ? 'opacity-30' : ''}
              />
              <span className="text-sm font-bold tracking-wide opacity-60">
                PDF
              </span>
            </div>
          )}

          {isPaid && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (url) setPreview({ url, type: type as any });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition"
              >
                <MdVisibility size={18} />
                View
              </button>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs font-bold truncate text-[#0B2545] dark:text-white">
            {isPaid ? doc.documentName : '••••••••••'}
          </p>
        </div>
      </div>
    );
  };

  const unlockPaymentStatus = data?.success
    ? (data.data as any)?.paymentStatus
    : undefined;
  const unlockRejection = data?.success
    ? (data.data as any)?.rejection
    : undefined;
  const isUnlockPending = unlockPaymentStatus === 'Pending';
  const isUnlockFailed = unlockPaymentStatus === 'FAILED';

  const renderLockOverlay = () => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-6 py-8 rounded-2xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-xl text-center w-full min-w-[280px] max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-full bg-[#4F46E5]/10 flex items-center justify-center">
          <MdLock size={28} className="text-[#4F46E5] dark:text-[#73B7FF]" />
        </div>
        <div>
          <p className="text-base font-bold text-[#0B2545] dark:text-white">
            Documents Locked
          </p>
          {!isGroupJoined ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Join this property&apos;s primary club to unlock the detailed
              report.
            </p>
          ) : isUnlockPending ? (
            <p className="text-xs text-yellow-500 mt-1">
              Your payment is pending verification.
            </p>
          ) : isUnlockFailed ? (
            <>
              <span className="inline-flex items-center gap-1 mt-1.5 mb-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-500/10 text-red-500">
                Payment Failed
              </span>
              <p className="text-xs text-red-500">
                {unlockRejection || 'Your payment could not be verified.'}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Unlock access to the detailed property report by paying the
              Property Verification Report Charge
            </p>
          )}
        </div>

        {!isGroupJoined ? (
          <button
            onClick={handleUnlockClick}
            disabled={isJoiningGroup}
            className="group inline-flex items-center mt-1 justify-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-14 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer disabled:opacity-60"
          >
            {isJoiningGroup ? 'Joining...' : 'Join Club'}
          </button>
        ) : isUnlockPending ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 font-14 font-semibold">
            Payment Pending
          </span>
        ) : (
          <button
            onClick={handleUnlockClick}
            className="group inline-flex items-center mt-1 justify-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-14 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
          >
            <MdLockOpen size={18} />
            {isUnlockFailed ? 'Retry Payment' : 'Unlock Documents'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section
      className={`font-work text-[#0B2545] dark:text-white bg-[#F4F6F9] dark:bg-[#0B0B0B] min-h-screen px-4 lg:px-10 pb-6 ${
        !isAuthenticated
          ? 'pt-24 md:pt-32'
          : isUserKycCompleted
            ? 'pt-22'
            : needsOnboarding
              ? 'pt-42'
              : 'pt-20'
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-start max-w-[1600px] mx-auto gap-3 md:gap-4 flex-col pt-1 w-full"
      >
        <div className="flex justify-between items-center w-full pt-3 md:pt-4">
          <HandleBack />

          <div className="flex gap-2">
            {!iconShow ? (
              <span
                title="Chat"
                className="cursor-pointer text-[#0B2545] dark:text-white text-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:border-[#4F46E5]/40 hover:bg-[#4F46E5] hover:text-white hover:scale-110 hover:shadow-md hover:shadow-[#4F46E5]/50 p-2 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center"
                onClick={() => handleStartChat(Number(id))}
              >
                <IoChatbubble />
              </span>
            ) : (
              ''
            )}
            <Button2
              disabled={saving}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium font-18 transition-all duration-300 shadow-sm
            ${
              isSaved
                ? 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-600 dark:text-yellow-400'
                : 'bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 hover:border-[#4F46E5]/40 text-[#0B2545] dark:text-white'
            }
            ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
          `}
            >
              {isSaved ? <GoBookmarkFill /> : <GoBookmark />}
              {isSaved ? 'Saved' : 'Save'}
            </Button2>
          </div>
        </div>
        <div className="flex w-full flex-row justify-between items-center">
          <Breadcrumb title={data?.data?.assetTitle} />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-[1600px] mx-auto space-y-6"
      >
        <div>
          <ImageGallery documents={data?.data?.documents} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="md:col-span-3 lg:pr-8 lg:space-y-10 relative">
            <div className="lg:block hidden">
              <div>
                <PropertyHeader asset={data.data} />
              </div>
            </div>

            <div className="lg:hidden flex md:flex-row flex-col justify-between gap-4 lg:gap-6 mb-4">
              <div className="w-full">
                <PropertyHeader asset={data.data} />
              </div>
              <div className="w-full">
                <FractionCard
                  asset={data.data}
                  onPayNow={handleUnlockClick}
                  isPaymentPending={isUnlockPending}
                  isPaymentFailed={isUnlockFailed}
                  isGroupJoined={isGroupJoined}
                  isJoiningGroup={isJoiningGroup}
                />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <PropertyDescribtion meta={data?.data?.meta} />
              </div>
              <div>
                <WhyTheyInvested intrestData={data?.data?.propertyInterest} />
              </div>
              <div>
                {data.data?.price && (
                  <InvestmentCalculatorChart asset={data.data} />
                )}
              </div>
            </div>
          </div>

          <div className="lg:block hidden lg:col-span-2">
            <div className="lg:sticky lg:top-[125px] h-fit">
              <div className="w-full max-w-[480px] ml-auto pb-4">
                <div>
                  <FractionCard
                    asset={data.data}
                    onPayNow={handleUnlockClick}
                    isPaymentPending={isUnlockPending}
                    isPaymentFailed={isUnlockFailed}
                    isGroupJoined={isGroupJoined}
                    isJoiningGroup={isJoiningGroup}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!data.data?.price &&
          allDocuments?.length == 0 &&
          data.data?.accountId !== user?.id &&
          data.data?.status !== 'Reviewed' && <PriceComingSoon />}

        <div className="bg-white dark:bg-[#132436] mb-6 lg:mb-10 p-6 rounded-2xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <h3 className="text-xs font-serif font-bold text-[#4F46E5] dark:text-[#73B7FF] uppercase tracking-[0.2em] mb-5">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">
            {(
              [
                ['Asset Type', data.data?.assetType],
                [
                  'Asset Sub Type',
                  getMeta('assetSubType') || data.data?.assetSubType,
                ],
                [
                  'Ownership Model',
                  data.data?.ownershipModel == 'Others'
                    ? data.data?.ownershipModelOther
                    : data.data?.ownershipModel,
                ],
                // ['Ownership Entity Type', getMeta('ownershipEntityType')],
                ['Current Owner', data.data?.currentOwnerName],
                ['Status', data.data?.status || data.data?.status],
                [
                  'Address',
                  [
                    getMeta('city'),
                    getMeta('state'),
                    getMeta('country'),
                    getMeta('pincode'),
                  ]
                    .filter(Boolean)
                    .join(', '),
                ],
                ['Land Area (Sq.Mtr)', getMeta('landArea')],
                ['Built-up Area (Sq.Mtr)', getMeta('builtupArea')],
                ['Year of Construction', getMeta('yearOfConstruction')],
                ['Asset Age (Years)', getMeta('assetAge')],
                ['Title Status', getMeta('titleStatus')],
                ['RERA Registration Number', getMeta('reraRegistrationNumber')],
                [
                  'Property Survey / Khasra Number',
                  getMeta('propertySurveyKhasraNumber'),
                ],
                ['Encumbrance Details', getMeta('encumbranceDetails')],
                ['Market Value', getMeta('marketValue')],
                ['Currency', getMeta('currency')],
                ['Valuation Agency', getMeta('valuationAgencyName')],
                ['Valuation Report Date', getMeta('valuationReportDate')],
                ['Total Structural Co-owners', data.data?.totalBuyersCount],
                ['Investors', (data.data as any)?.interestCount],
              ] as const
            )
              .filter(
                ([, value]) =>
                  value !== undefined && value !== null && value !== ''
              )
              .map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px]  text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-serif font-semibold text-[#0B2545] dark:text-white capitalize">
                    {value}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {allDocuments?.length > 0 &&
          (data.data?.status == 'Available' ||
            data.data?.status == 'Funded' ||
            data.data?.status == 'Reviewed') && (
            <div className="bg-white dark:bg-[#132436] mb-3 p-6 rounded-2xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
              <div
                className="lg:hidden flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[#E3E7EE] dark:border-white/10"
                onClick={() => setDocsOpen((prev) => !prev)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-serif font-bold text-[#4F46E5] dark:text-[#73B7FF] uppercase tracking-[0.2em]">
                    Documents
                  </h3>

                  {!isPaid ? (
                    <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-white/60 bg-gray-100 dark:bg-black/30 px-2 py-0.5 rounded-full border border-[#E3E7EE] dark:border-white/10">
                      <MdLock
                        size={10}
                        className="text-[#4F46E5] font-serif dark:text-[#73B7FF]"
                      />{' '}
                      Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400/80 bg-green-500/10 dark:bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20 dark:border-green-400/20">
                      <MdLockOpen size={10} /> Unlocked
                    </span>
                  )}
                </div>

                <motion.span
                  animate={{ rotate: docsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-500 dark:text-gray-400 text-xs"
                >
                  ▼
                </motion.span>
              </div>

              {!docsOpen && !isPaid && (
                <div className="lg:hidden mt-4 flex flex-col items-center gap-3">
                  {!isGroupJoined ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Join this property&apos;s primary club to unlock the
                      detailed report.
                    </p>
                  ) : isUnlockPending ? (
                    <p className="text-xs text-yellow-500 text-center">
                      Your payment is pending verification.
                    </p>
                  ) : isUnlockFailed ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-500/10 text-red-500">
                        Payment Failed
                      </span>
                      <p className="text-xs text-red-500 text-center">
                        {unlockRejection ||
                          'Your payment could not be verified.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Unlock access to the detailed property report by paying
                      the Property Verification Report Charge
                    </p>
                  )}
                  {!isGroupJoined ? (
                    <button
                      onClick={handleUnlockClick}
                      disabled={isJoiningGroup}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white text-xs font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer disabled:opacity-60"
                    >
                      {isJoiningGroup ? 'Joining...' : 'Join Club'}
                    </button>
                  ) : isUnlockPending ? (
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 text-xs font-semibold">
                      Payment Pending
                    </span>
                  ) : (
                    <button
                      onClick={handleUnlockClick}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white text-xs font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
                    >
                      <MdLockOpen size={14} />{' '}
                      {isUnlockFailed ? 'Retry Payment' : 'Unlock Documents'}
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {docsOpen && (
                  <motion.div
                    key="mobile-docs-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="lg:hidden overflow-hidden mt-4"
                  >
                    {allDocuments.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No files available
                      </p>
                    ) : (
                      <div className="relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {allDocuments.map((doc: any) => renderDocCard(doc))}
                        </div>
                        {!isPaid && renderLockOverlay()}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="hidden lg:block">
                <h3 className="text-xs font-serif font-bold text-[#4F46E5] dark:text-[#73B7FF] uppercase tracking-[0.2em] mb-6 pb-2 border-b border-[#E3E7EE] dark:border-white/10">
                  Documents
                </h3>
                {[{ title: 'Property Documents', items: allDocuments }].map(
                  ({ title, items }) => (
                    <div key={title} className="space-y-4 mt-8">
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No files available
                        </p>
                      ) : (
                        <div className="relative">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((doc: any) => renderDocCard(doc))}
                          </div>
                          {!isPaid && renderLockOverlay()}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </motion.div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white"
            >
              <RxCross1 size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl w-full max-h-[85vh] flex items-center justify-center"
            >
              {preview.type === 'image' && (
                <img
                  src={preview.url || ''}
                  className="max-w-full max-h-full mx-auto rounded-lg object-contain"
                  alt="Preview"
                />
              )}

              {preview.type === 'pdf' && (
                <iframe
                  src={preview.url}
                  className="w-full h-[80vh] rounded-lg bg-white"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => {
          setStatusModal((prev) => ({ ...prev, open: false }));
        }}
      />

      {showUnlockModal && (
        <InterestPaymentModal
          open={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          type="unlock"
          assetId={unlockAssetId}
          amount={unlockAmount}
          onSuccess={() => {
            setShowUnlockModal(false);
            refetch();
          }}
        />
      )}
    </section>
  );
};

export default PropertyDetails;
