/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed meta handling, matches the pattern in rwa.api.ts */
import PropertyImage from '@/components/Property/PropertyImage';
import PropertyFilterDropdown from '@/components/PropertyFilterDropDown';
import { useOnboarding } from '@/hooks';
import type { RootState } from '@/redux/store';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProperties, type Asset, type AssetDocument } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '@/components/Loader';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import InterestPaymentModal from '@/components/Modals/InterestPaymentModal';
import RoleSelectionModal from '@/components/Dashboard/Overview/RoleSelectionModal';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';

interface Filters {
  newlyAdded: boolean;
  subType?: string;
}

type AssetStatus = 'Available' | 'Funded' | 'Exited';

export default function Properties() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    newlyAdded: false,
    subType: undefined,
  });
  type AssetTab = 'AVAILABLE' | 'FUNDED' | 'EXITED';
  const [activeTab, setActiveTab] = useState<AssetTab>('AVAILABLE');

  const queryClient = useQueryClient();

  const gridRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, role, token, user } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';

  const { run: refetchUser } = useFetchUserDataFlow();
  const handleRoleSuccess = () => {
    if (token) refetchUser(token);
  };
  const currentRole = role || user?.type || user?.role;
  const normalizedRole = currentRole?.toLowerCase();

  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedSearch = useDebounce(search, 400);
  const finalSearch =
    debouncedSearch && debouncedSearch.trim().length >= 2
      ? debouncedSearch
      : undefined;
  const apiFilters: {
    assetStatus: AssetStatus;
    newlyAdded?: boolean;
    assetSubType?: string;
    search?: string;
    accountId?: number;
  } = {
    ...(filters.newlyAdded ? { newlyAdded: true } : {}),
    assetStatus:
      activeTab === 'AVAILABLE'
        ? 'Available'
        : activeTab === 'FUNDED'
          ? 'Funded'
          : 'Exited',
    assetSubType: filters.subType,
    search: finalSearch,
    accountId: isAuthenticated ? user?.id : undefined,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useProperties(apiFilters);

  const properties =
    data?.pages.flatMap((page) => (page.success ? page?.data?.data : [])) ?? [];

  const [interestAsset, setInterestAsset] = useState<Asset | null>(null);

  const getMetaValue = (meta: any[] | string | undefined, key: string) => {
    if (!meta || !Array.isArray(meta)) return '';
    return meta.find((m) => m.metaKey === key)?.metaValue ?? '';
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const getAssetImage = (documents: AssetDocument[]) => {
    const image = documents.find((d) => d.documentType === 'ASSET_IMAGE');
    if (!image) return '/images/property-placeholder.png';

    const rawUrl = image.url ?? image.documentUrl;
    if (!rawUrl) return '/images/property-placeholder.png';

    // If it's already an absolute URL, return it as is
    if (rawUrl.startsWith('http')) return rawUrl;

    return `${API_BASE_URL}/storage/${rawUrl}`;
  };

  const applyFilters = (nextFilters: Filters) => {
    setFilters(nextFilters);
    setFilterOpen(false);
    queryClient.removeQueries({ queryKey: ['properties'] });
  };

  useEffect(() => {
    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;

      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 300
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  type DerivedStatus = 'Available' | 'Funded' | 'Exited';

  const getAssetStatus = (asset: any): DerivedStatus => {
    // if (asset.isSoldOut || asset.remainingFractions === 0) return 'Funded';
    if (asset.status === 'Available') return 'Available';
    return 'Available';
  };

  const navigate = useNavigate();

  return (
    <>
      {normalizedRole === 'business' && (
        <RoleSelectionModal onSuccess={handleRoleSuccess} />
      )}
      <section
        className={`mx-auto relative text-[var(--fg)] bg-[var(--bg)]  font-work space-y-8 md:space-y-16 px-4 lg:px-10 ${
          !isAuthenticated
            ? 'pt-24 md:pt-32'
            : isUserKycCompleted
              ? 'pt-24'
              : needsOnboarding
                ? 'md:pt-50 pt-42'
                : 'pt-25 lg:pt-40'
        }`}
        // style={{
        //   backgroundImage: 'url("/images/property-page.png")',
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'start',
        //   backgroundRepeat: 'no-repeat',
        // }}
      >
        <div className="max-w-[1600px] mx-auto">
          {/* <div className="flex justify-start items-start top-6 z-50">
          <button
            onClick={handleback}
            className="flex items-center gap-2 font-new-20 pr-3 py-2 bg-transparent border border-transparent rounded-md text-[#F5F5F5] cursor-pointer"
          >
            <HiArrowLongLeft size={24} />
            <span className="font-20">Back</span>
          </button>
        </div> */}

          <div className="flex lg:flex-row flex-col md:justify-between justify-start items-start md:items-center gap-3 md:gap-6 mx-auto  pt-4 lg:pt-0 mb-4">
            <div className="flex flex-col lg:max-w-[600px]  gap-2 overflow-hidden">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="font-32 font-medium text-[var(--fg)] "
              >
                Property Portfolio
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                className="text-dark-grey font-16 font-medium"
              >
                We curate premium real estate assets and structure them as
                blockchain-enabled digital assets, ensuring secure, transparent,
                and fractional ownership.
              </motion.p>
            </div>
            <div className="flex justify-between gap-6 lg:gap-16 lg:w-auto w-full">
              <div className="flex bg-[#ffffff] border border-gray-200 rounded-full p-1 shadow-sm overflow-hidden w-fit">
                {[
                  { label: 'Available', value: 'AVAILABLE' },
                  { label: 'Funded', value: 'FUNDED' },
                  { label: 'Exited', value: 'EXITED' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value as AssetTab);
                      queryClient.removeQueries({ queryKey: ['properties'] });
                    }}
                    className={`px-6 lg:px-9 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.value
                        ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] bg-[#3A76C0] shadow-md text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative hidden self-center">
                <button
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="flex items-center gap-2 md:gap-4 text-[var(--fg)] font-24 font-medium"
                >
                  <span className="hidden sm:block">Filter</span>
                  <img
                    src="/images/filter-icon.svg"
                    className={`w-5 h-5 ${isDark ? '' : 'invert'} shrink-0 `}
                    alt=""
                  />
                </button>

                <PropertyFilterDropdown
                  open={filterOpen}
                  filters={filters}
                  onApply={applyFilters}
                  onClose={() => setFilterOpen(false)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <div className="group flex items-center bg-[var(--card)] rounded-full overflow-hidden transition-all duration-500 ease-in-out w-10 hover:w-64 focus-within:w-64 border border-[var(--fg)]/20 shadow-sm">
              {/* 🔍 Icon */}
              <div className="flex items-center justify-center w-10 h-10 text-[var(--fg)]/70 shrink-0">
                <FiSearch size={18} />
              </div>

              {/* 🔤 Input */}
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-0 group-hover:w-full group-focus-within:w-full pr-3 text-[var(--fg)] placeholder:text-[var(--fg)]/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300"
              />
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] pb-10">
            <div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 xl:gap-10"
            >
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-[var(--inner-card)] p-4 rounded-2xl h-[400px]"
                  >
                    <div className="bg-gray-200/50 h-[220px] rounded-xl mb-4" />
                    <div className="bg-gray-200/50 h-8 w-3/4 rounded mb-2" />
                    <div className="bg-gray-200/50 h-16 w-full rounded" />
                  </div>
                ))
              ) : properties.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <h2 className="text-2xl font-semibold text-[var(--fg)] ">
                    No properties available right now
                  </h2>
                  <p className="text-[#9A9A9A] mt-2">
                    Please check back later. New listings are coming soon.
                  </p>
                </div>
              ) : (
                properties.map((item, index) => {
                  const status = getAssetStatus(item);

                  return (
                    <motion.div
                      key={item?.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      // onClick={() => {
                      //   if (status === 'Available') {
                      //     navigate(`/property-details/${item?.id}`);
                      //   }
                      // }}
                      className={`bg-[var(--card)] p-4 rounded-2xl overflow-hidden shadow-sm border border-dark-grey/20 transition-all duration-300 group
                    ${
                      status === 'Available'
                        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-dark-grey/40'
                        : 'cursor-not-allowed opacity-90'
                    }
                    ${index === 2 ? 'hidden lg:block' : ''}
                  `}
                    >
                      <div className="relative h-[220px] rounded-xl overflow-hidden">
                        <PropertyImage
                          src={getAssetImage(item?.documents ?? [])}
                          alt={item?.assetTitle ?? 'Property'}
                          imgClassName={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            status === 'Funded' || status === 'Exited'
                              ? 'opacity-80 grayscale'
                              : ''
                          }`}
                        />
                        {status === 'Funded' && (
                          <span className="absolute top-3 left-3 z-10 bg-red-600  text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Sold
                          </span>
                        )}

                        {status === 'Exited' && (
                          <span className="absolute top-3 left-3 z-10 bg-gray-700  text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Exited
                          </span>
                        )}
                      </div>

                      <div className="md:pt-5 pt-4 md:space-y-1">
                        <div className="flex flex-col mb-4">
                          <div className="flex items-center gap-1.5 text-[12px] text-dark-grey font-medium tracking-wide">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {getMetaValue(item?.meta || 'new', 'city')}
                          </div>
                          <h3 className="font-24 font-semibold pt-0.5 line-clamp-1">
                            {item?.assetTitle}
                          </h3>
                        </div>

                        <div className="w-full mt-4 bg-[var(--inner-card)] border border-dark-grey/20 rounded-xl p-3">
                          <div
                            className="grid text-dark-grey font-12"
                            style={{
                              gridTemplateColumns: '1fr 1fr 1fr',
                            }}
                          >
                            <p className="text-center">Market Value</p>
                            <p className="text-center font-medium border-l border-r border-dark-grey/20">
                              Net Income
                            </p>
                            <p className="text-center">Appreciation</p>
                          </div>

                          <div
                            className="grid mt-1 text-[var(--fg)]"
                            style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                          >
                            <p className="font-16 font-semibold text-center mt-1 px-1">
                              {getMetaValue(item?.meta || 'new', 'marketValue')
                                ? `₹${Number(
                                    getMetaValue(
                                      item?.meta || 'new',
                                      'marketValue'
                                    )
                                  ).toLocaleString('en-IN')}`
                                : '-'}
                            </p>
                            <p className="font-16 font-semibold text-center mt-1 border-l border-r border-dark-grey/20 px-1">
                              {getMetaValue(
                                item?.meta || 'new',
                                'netOperationalIncome'
                              )
                                ? `₹${Number(
                                    getMetaValue(
                                      item?.meta || 'new',
                                      'netOperationalIncome'
                                    )
                                  ).toLocaleString('en-IN')}`
                                : '-'}
                            </p>
                            <p className="font-18 font-semibold text-center mt-1 text-green-600 dark:text-green-400">
                              {getMetaValue(
                                item?.meta || 'new',
                                'expectedAppreciationPercentage'
                              )
                                ? `${getMetaValue(item?.meta || 'new', 'expectedAppreciationPercentage')}%`
                                : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 w-full relative">
                          <button
                            disabled={
                              !item?.isInterest &&
                              item?.paymentStatus === 'Pending'
                            }
                            onClick={() => {
                              if (isAuthenticated) {
                                if (item?.isInterest) {
                                  navigate(`/property-details/${item?.id}`);
                                } else if (
                                  item &&
                                  item.paymentStatus !== 'Pending'
                                ) {
                                  setInterestAsset(item);
                                }
                              } else {
                                navigate('/login');
                              }
                            }}
                            className="
                              relative overflow-hidden w-full font-semibold font-16
                              px-6 py-3 lg:py-2.5 rounded-xl text-white shadow-md
                              transition-all duration-300 ease-in-out group-hover:shadow-[0_4px_14px_0_rgba(96,165,250,0.39)] bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]
                              disabled:opacity-60 disabled:cursor-not-allowed
                            "
                          >
                            {item?.isInterest
                              ? 'View Details'
                              : item?.paymentStatus === 'Pending'
                                ? 'Payment Under Review'
                                : 'Interested'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              {isFetchingNextPage && (
                <div className="col-span-full flex justify-center py-6">
                  <Loader />
                </div>
              )}
            </div>
          </div>
        </div>

        {interestAsset && (
          <InterestPaymentModal
            open={!!interestAsset}
            onClose={() => setInterestAsset(null)}
            assetId={interestAsset.id}
            onSuccess={() => {
              setInterestAsset(null);
              refetch();
            }}
            amount={interestAsset.sharedAsset?.tokenAmount}
          />
        )}
      </section>
    </>
  );
}
