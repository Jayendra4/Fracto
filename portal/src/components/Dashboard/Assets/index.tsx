/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed portfolio/asset handling, matches the pattern in rwa.api.ts */
import { useState, useMemo, useEffect } from 'react';
// import { FaChevronDown } from 'react-icons/fa6';
import { useMyPortfolio } from '@/api/portfolio.api';
// import { useMyFavourites } from '@/api/favourites.api';
import { useQuery } from '@tanstack/react-query';
// import SavedCard from './MyAssets/savedCards';
import AssetCard from './MyAssets/assetsCard';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardedCard from './MyAssets/OnboardedCard';
import { getMeAssetsApi } from '@/api/rwa.api';
import { Link, useLocation } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import Button2 from '@/components/UI/Button2';
// import { GoBookmark } from 'react-icons/go';
import Loader from '@/components/Loader';
import NoData from '@/components/Dashboard/NoData';
import { FiShoppingCart, FiHome } from 'react-icons/fi';
import { ROUTES } from '@/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function getMetaNumber(meta: any[], key: string) {
  const m = meta?.find((m: any) => m.metaKey === key)?.metaValue;
  return m ? parseFloat(m) : 0;
}

function getMetaString(meta: any[], key: string) {
  return meta?.find((m: any) => m.metaKey === key)?.metaValue || '';
}

export default function Assets() {
  const [activeTab, setActiveTab] = useState<'purchased' | 'onboarded'>(
    'onboarded'
  );
  const location = useLocation();

  useEffect(() => {
    const currentActiveTab = location?.state?.status;

    if (currentActiveTab) {
      setActiveTab(currentActiveTab);
    }
  }, []);

  const [page, setPage] = useState(1);
  const TAKE = 10;
  const [onboardedStatus, setOnboardedStatus] = useState<
    'Available' | 'Funded' | 'Exited'
  >('Available');

  const user = useSelector((state: RootState) => state.authLogin.user);
  // const role = useSelector((state: RootState) => state.authLogin.role);
  const { role } = useSelector((state: RootState) => state.authLogin);
  const isBroker = role === 'Broker';
  const rwaFormCount = user?.rwaFormCount || 0;
  const brokerReferredCount = user?.brokerReferredAssetsCount || 0;
  const hasAssets = rwaFormCount > 0 && user?.hasSubmittedRwaForm === true;

  const { data: portfolioRes } = useMyPortfolio();

  // const { data: favouritesRes } = useMyFavourites();

  const { data: onboardedRes, isLoading: isOnboardedLoading } = useQuery({
    queryKey: ['onboarded-assets', onboardedStatus, page],
    queryFn: () =>
      getMeAssetsApi({
        skip: (page - 1) * TAKE,
        take: TAKE,
        assetStatus: onboardedStatus,
      }),
    enabled: !!user?.id,
  });

  const normalizedRole = role?.toLowerCase();
  const showOnboarded = ['company', 'assetowner', 'developer', 'spv'].includes(
    normalizedRole || ''
  );

  const onboardedCount =
    onboardedRes?.success === true ? (onboardedRes.data as any)?.count || 0 : 0;

  const assets = useMemo(() => {
    const resData =
      portfolioRes?.success === true ? portfolioRes.data : undefined;
    const rawItems = Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData)
        ? resData
        : [];

    return rawItems.map((item: any) => {
      const asset = item.asset || item;
      const meta = item.meta || asset?.meta || [];
      const investment = item.investment || {};
      const financials = item.financials || asset?.financials || {};
      const priceData = item.price || asset?.price || {};

      return {
        id: asset?.id,
        title: asset?.assetTitle || asset?.title || 'Unknown Asset',
        type:
          asset?.assetSubType || asset?.assetType || asset?.type || 'Property',
        verified: asset?.isVerified || asset?.verified,
        location: getMetaString(meta, 'city') || asset?.location || 'Overseas',
        investment:
          investment.totalInvestedAmount || item.investmentAmount || 0,
        ownership: asset.totalFractions
          ? Number(
              (
                (investment.totalFractionsPurchased / asset.totalFractions) *
                100
              ).toFixed(2)
            )
          : Number((item.ownershipPercentage || 0).toFixed(2)),
        yield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        value:
          investment.currentValue ||
          investment.totalInvestedAmount ||
          getMetaNumber(meta, 'marketValue') ||
          0,
        growth: Number(
          financials?.roi?.fiveYearROI ||
            asset.assetAppreciation ||
            getMetaNumber(meta, 'expectedAppreciationPercentage') ||
            0
        ),
        image:
          asset?.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
            ?.url ||
          asset?.documents?.[0]?.documentUrl ||
          asset?.image,
        priceFraction: Number(
          priceData?.currentPricePerFraction ||
            financials?.perFraction?.price ||
            0
        ),
        roi: Number(
          financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
        ),
        savedyield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        isSoldOut: asset?.status === 'Funded' || asset?.isSoldOut,
      };
    });
  }, [portfolioRes]);

  // const savedAssets = useMemo(() => {
  //   const resData =
  //     favouritesRes?.success === true ? favouritesRes.data : undefined;
  //   const data = Array.isArray(resData?.data)
  //     ? resData.data
  //     : Array.isArray(resData)
  //       ? resData
  //       : [];
  //   return data.map((item: any) => {
  //     const asset = item.asset || item;
  //     const meta = item.meta || asset?.meta || [];
  //     const financials = item.financials || asset?.financials || {};
  //     const priceData = item.price || asset?.price || {};

  //     return {
  //       id: asset.id,
  //       title: asset.assetTitle || asset.title || 'Unknown Asset',
  //       type: asset.assetSubType || asset.assetType || asset.type || 'Property',
  //       verified: asset.isVerified || asset.verified,
  //       location: getMetaString(meta, 'city') || asset.location || 'Overseas',
  //       investment: asset.investment || 0,
  //       ownership: asset.ownership || 0,
  //       yield: Number(
  //         financials?.yield?.actualYieldPercent ||
  //           asset.yieldPercentage ||
  //           getMetaNumber(meta, 'expectedYieldPercentage') ||
  //           0
  //       ),
  //       value:
  //         getMetaNumber(meta, 'marketValue') ||
  //         Number(
  //           priceData?.currentPricePerFraction ||
  //             financials?.perFraction?.price ||
  //             0
  //         ),
  //       growth: Number(
  //         financials?.roi?.fiveYearROI ||
  //           asset.assetAppreciation ||
  //           getMetaNumber(meta, 'expectedAppreciationPercentage') ||
  //           0
  //       ),
  //       image:
  //         asset.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
  //           ?.documentUrl ||
  //         asset.documents?.[0]?.documentUrl ||
  //         asset.image,
  //       priceFraction: Number(
  //         priceData?.currentPricePerFraction ||
  //           financials?.perFraction?.price ||
  //           0
  //       ),
  //       roi: Number(
  //         financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
  //       ),
  //       savedyield: Number(
  //         financials?.yield?.actualYieldPercent ||
  //           asset.yieldPercentage ||
  //           getMetaNumber(meta, 'expectedYieldPercentage') ||
  //           0
  //       ),
  //       isSoldOut: asset.status === 'Funded' || asset.isSoldOut,
  //     };
  //   });
  // }, [favouritesRes]);

  const onboardedAssets = useMemo(() => {
    const resData =
      onboardedRes?.success === true ? onboardedRes.data : undefined;
    const data = Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData)
        ? resData
        : [];
    return data.map((item: any) => {
      const asset = item.asset || item;
      const meta = asset.meta || [];
      const financials = item.financials || asset?.financials || {};
      const priceData = item.price || asset?.price || {};

      return {
        id: asset.id,
        title: asset.assetTitle || asset.title || 'Unknown Asset',
        type: asset.assetSubType || asset.assetType || asset.type || 'Property',
        verified: asset.isVerified || asset.verified,
        location: getMetaString(meta, 'city') || asset.location || 'Overseas',
        investment: asset.investment || 0,
        ownership: asset.ownership || 0,
        yield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        value:
          asset.marketValue ||
          getMetaNumber(meta, 'marketValue') ||
          Number(
            priceData?.currentPricePerFraction ||
              financials?.perFraction?.price ||
              0
          ) * (asset.totalFractions || 0),
        growth: Number(
          financials?.roi?.fiveYearROI ||
            asset.assetAppreciation ||
            getMetaNumber(meta, 'expectedAppreciationPercentage') ||
            0
        ),
        image:
          asset.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
            ?.url ||
          asset.documents?.[0]?.documentUrl ||
          asset.image,
        priceFraction: Number(
          priceData?.currentPricePerFraction ||
            financials?.perFraction?.price ||
            0
        ),
        roi: Number(
          financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
        ),
        savedyield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        isSoldOut: asset.status === 'Funded' || asset.isSoldOut,
        status: asset.status,
        // Expanded data
        currentOwnerName:
          asset.currentOwnerName ||
          getMetaString(meta, 'currentOwnerName') ||
          'N/A',
        ownershipModel:
          asset.ownershipModel ||
          getMetaString(meta, 'ownershipModel') ||
          'N/A',
        marketValue:
          asset.marketValue || getMetaNumber(meta, 'marketValue') || 0,
        netOperationalIncome:
          asset.netOperationalIncome ||
          getMetaNumber(meta, 'netOperationalIncome') ||
          0,
        totalFractions:
          asset.totalFractions || getMetaNumber(meta, 'totalFractions') || 0,
        soldFractions:
          asset.soldFractions || getMetaNumber(meta, 'soldFractions') || 0,
        remainingFractions:
          asset.remainingFractions ||
          getMetaNumber(meta, 'remainingFractions') ||
          0,
        appreciation: Number(
          financials?.roi?.fiveYearROI ||
            asset.assetAppreciation ||
            getMetaNumber(meta, 'expectedAppreciationPercentage') ||
            0
        ),
        financials: financials,
        meta: meta,
      };
    });
  }, [onboardedRes]);

  const totalPages = useMemo(() => {
    const resData =
      activeTab === 'purchased'
        ? portfolioRes?.success === true
          ? portfolioRes.data
          : (portfolioRes as any)?.data
        : onboardedRes?.success === true
          ? onboardedRes.data
          : (onboardedRes as any)?.data;
    const count =
      (resData as any)?.count ||
      (activeTab === 'purchased' ? assets.length : onboardedAssets.length);
    return Math.ceil(count / TAKE) || 1;
  }, [
    activeTab,
    portfolioRes,
    onboardedRes,
    assets.length,
    onboardedAssets.length,
  ]);

  const visibleAssets = assets.slice((page - 1) * TAKE, page * TAKE);
  const hasNoAssets = activeTab === 'purchased' ? assets.length === 0 : false;
  // const hasNoSavedAssets = savedAssets.length === 0;

  // const [isSavedSectionOpen, setIsSavedSectionOpen] = useState(true);

  return (
    <section
      // className={`w-full bg-[var(--bg)] min-h-screen ${
      //   role === 'CorporateInvestor' ? 'pt-22' : 'pt-34 xl:pt-40'
      // } font-work pb-20 transition-all duration-300`}
      className="w-full bg-[var(--bg)] min-h-screen pt-34 xl:pt-40
       font-work pb-20 transition-all duration-300"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full "
      >
        <div className="px-4 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto py-5">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-semibold text-[var(--fg)] tracking-tight">
                My Assets
              </h1>
              <p className="text-[var(--fg)]/40 mt-1 font-medium">
                Manage and track your Structural Co-ownership real estate
                portfolio.
              </p>

              {/* <div className="text-[#73B7FF] hover:text-[var(--fg)] hover:underline">
                <Link to={'/properties'}> Explore Property</Link>
              </div> */}
            </motion.div>
            <div className="flex      overflow-hidden w-full md:w-fit">
              {activeTab == 'onboarded' && (
                <>
                  <div className="flex rounded-lg p-1 shadow-sm overflow-hidden w-full md:w-fit">
                    {!isBroker && (
                      <Link to={ROUTES.REFERRED_ASSETS}>
                        <button
                          type="button"
                          className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-300
        ${'text-[var(--fg)]/70 hover:text-[var(--fg)] hover:bg-[var(--fg)]/8 border border-transparent hover:border-[var(--fg)]/10'}`}
                        >
                          Broker Referred Assets{' '}
                          {brokerReferredCount > 0 && (
                            <span>({brokerReferredCount})</span>
                          )}
                        </button>
                      </Link>
                    )}

                    <Link to={ROUTES.ONBOARDED_ASSETS}>
                      <button
                        type="button"
                        className={`flex-1 !border-[var(--fg)]/10 md:flex-none px-4 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-300
      ${'text-[var(--fg)]/70 hover:text-[var(--fg)] hover:bg-[var(--fg)]/8 border border-transparent hover:border-[var(--fg)]/10'}`}
                      >
                        Assets History{' '}
                        {isBroker
                          ? brokerReferredCount > 0 && (
                              <span>({brokerReferredCount})</span>
                            )
                          : hasAssets && <span>({rwaFormCount})</span>}
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="flex bg-[var(--inner-card)] hidden border border-dark-grey/20 rounded-full p-1 shadow-sm overflow-hidden w-full md:w-fit">
              {showOnboarded && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('onboarded');
                    setPage(1);
                  }}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300
                    ${
                      activeTab === 'onboarded'
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md text-white'
                        : 'text-[var(--fg)]/40 hover:text-[var(--fg)] hover:bg-[var(--fg)]/5'
                    }`}
                >
                  Onboarded ({onboardedCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('purchased');
                  setPage(1);
                }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300
                  ${
                    activeTab === 'purchased'
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md text-white'
                      : 'text-[var(--fg)]/40 hover:text-[var(--fg)] hover:bg-[var(--fg)]/5'
                  }`}
              >
                Purchased ({assets.length})
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 ">
          <div className="max-w-[1600px] mx-auto min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'purchased' ? (
                <motion.div
                  key="purchased-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Purchased Assets */}
                  <div className="space-y-4">
                    {!portfolioRes ? (
                      <Loader isFullPage={false} />
                    ) : hasNoAssets ? (
                      <NoData
                        title="No Purchased Assets"
                        description="Start your investment journey today. Browse our curated properties and own your first Structural Co-ownership."
                        icon={<FiShoppingCart size={32} />}
                        action={
                          <Link
                            to="/primary-club"
                            className="flex items-center justify-center gap-2 text-blue font-semibold hover:gap-3 transition-all duration-300"
                          >
                            Explore Assets <FaAngleRight />
                          </Link>
                        }
                      />
                    ) : (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={`purchased-list-${page}`}
                        className="space-y-4"
                      >
                        {visibleAssets.map((asset: any) => (
                          <motion.div
                            variants={itemVariants}
                            key={`asset-${asset.id || Math.random()}`}
                          >
                            <AssetCard asset={asset} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-6">
                        <Button2
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="px-4 py-2 border border-[var(--fg)]/10 bg-transparent text-[var(--fg)] disabled:opacity-40"
                        >
                          Previous
                        </Button2>
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-2">
                          {Array.from({ length: Math.min(totalPages, 5) }).map(
                            (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`flex-shrink-0 px-3 py-1 rounded-md text-sm border transition-all duration-300 ${page === i + 1 ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white border-transparent' : 'text-[var(--fg)] border-[var(--fg)]/10'}`}
                              >
                                {i + 1}
                              </button>
                            )
                          )}
                        </div>
                        <Button2
                          disabled={page === totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          className="px-4 py-2 border border-[var(--fg)]/10 bg-transparent text-[var(--fg)] disabled:opacity-40"
                        >
                          Next
                        </Button2>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="onboarded-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  // className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 min-h-[400px]"
                  className="min-h-[400px]"
                >
                  {/* Left Column: Onboarded Assets */}
                  {/* <div className="lg:col-span-2 mb-5"> */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-6">
                      <div className="flex bg-[var(--inner-card)] p-1.5 rounded-xl border border-[var(--fg)]/5 w-fit whitespace-nowrap">
                        {['Available', 'Funded', 'Exited'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setOnboardedStatus(status as any);
                              setPage(1);
                            }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${onboardedStatus === status ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md' : 'text-[var(--fg)]/40 hover:text-[var(--fg)] hover:bg-[var(--fg)]/5'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isOnboardedLoading ? (
                      <Loader isFullPage={false} />
                    ) : onboardedAssets.length === 0 ? (
                      <NoData
                        title={`No ${onboardedStatus} Assets`}
                        description="You don't have any assets in this category at the moment."
                        icon={<FiHome size={32} />}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {onboardedAssets.map((asset: any) => (
                            <OnboardedCard
                              key={asset.id}
                              id={asset.id}
                              assetName={asset.title}
                              category={asset.type}
                              location={asset.location}
                              yieldPercent={asset.yield}
                              roiPercent={asset.roi}
                              pricePerFraction={asset.priceFraction}
                              originalListingPrice={asset.marketValue}
                              verified={asset.verified}
                              status={asset.status}
                              currentOwnerName={asset.currentOwnerName}
                              ownershipModel={asset.ownershipModel}
                              marketValue={asset.marketValue}
                              netOperationalIncome={asset.netOperationalIncome}
                              totalFractions={asset.totalFractions}
                              soldFractions={asset.soldFractions}
                              remainingFractions={asset.remainingFractions}
                              appreciation={asset.appreciation}
                            />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 pt-6">
                            <Button2
                              disabled={page === 1}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              className="px-4 py-2 border border-[var(--fg)]/10 bg-transparent text-[var(--fg)] disabled:opacity-40"
                            >
                              Previous
                            </Button2>
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-2">
                              {Array.from({
                                length: Math.min(totalPages, 5),
                              }).map((_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => setPage(i + 1)}
                                  className={`flex-shrink-0 px-3 py-1 rounded-md text-sm border transition-all duration-300 ${page === i + 1 ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white border-transparent' : 'text-[var(--fg)] border-[var(--fg)]/10'}`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                            <Button2
                              disabled={page === totalPages}
                              onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                              className="px-4 py-2 border border-[var(--fg)]/10 bg-transparent text-[var(--fg)] disabled:opacity-40"
                            >
                              Next
                            </Button2>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Saved Assets */}
                  {/* <div className="lg:col-span-1">
                    <div className="space-y-4 h-fit sticky top-28 xl:top-32">
                      <div className="rounded-2xl border border-[var(--fg)]/5 shadow-sm bg-[var(--inner-card)] p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <GoBookmark className="text-xl md:text-2xl text-[var(--fg)]" />
                            <h3 className="text-xl md:text-2xl text-[var(--fg)] font-medium">
                              Saved Assets ({savedAssets.length})
                            </h3>
                          </div>
                          <button
                            onClick={() =>
                              setIsSavedSectionOpen((prev) => !prev)
                            }
                            className="cursor-pointer transition-transform duration-200 text-xl md:text-2xl text-[var(--fg)]"
                            aria-expanded={isSavedSectionOpen}
                            type="button"
                          >
                            <FaChevronDown
                              className={`text-[var(--fg)] transition-transform duration-300 ${
                                isSavedSectionOpen ? 'rotate-180' : 'rotate-0'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="w-full h-px bg-dark-grey/20 mb-5" />
                        <AnimatePresence initial={false}>
                          {isSavedSectionOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {hasNoSavedAssets ? (
                                <div className="text-[var(--fg)]/40 text-center py-6 text-sm">
                                  You haven't saved any assets yet.
                                </div>
                              ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[1000px] scrollbar-ui pr-2">
                                  {savedAssets.map((a: any) => (
                                    <SavedCard key={a.id} asset={a} />
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div> */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
