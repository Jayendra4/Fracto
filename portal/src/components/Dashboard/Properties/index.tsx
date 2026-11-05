import { FiAlertCircle, FiFilter, FiSearch } from 'react-icons/fi';
import { PropertyCard } from './PropertyCard';
import { useProperties } from '@/api';
import PropertyCardSkeleton from '@/components/Skeleton/PropertyCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import PropertyFilterDropdown from '@/components/PropertyFilterDropDown';

export type PropertyStatus = 'ready' | 'pending';

export interface Property {
  id: string;
  title: string;
  location: string;
  image: string;
  availability: string;
  price: string;
  returns: string;
  status: PropertyStatus;
  description: string;
}

type AssetStatus = 'Available' | 'Funded' | 'Exited';

const STATUS_OPTIONS = [
  { label: 'Available', value: 'Available' },
  { label: 'Funded', value: 'Funded' },
  { label: 'Exited', value: 'Exited' },
] as const;

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

export default function Properties() {
  const [assetStatus, setAssetStatus] = useState<
    'Available' | 'Funded' | 'Exited'
  >('Available');

  const [search, setSearch] = useState('');

  const [activeFilters, setActiveFilters] = useState<{
    newlyAdded: boolean;
    subType?: string;
  }>({ newlyAdded: false, subType: undefined });

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const finalSearch = debouncedSearch?.trim().length > 0 ? debouncedSearch : '';

  const apiFilters: {
    assetStatus: AssetStatus;
    newlyAdded: boolean;
    assetSubType?: string;
    search?: string;
  } = {
    assetStatus: assetStatus,
    assetSubType: activeFilters.subType,
    newlyAdded: activeFilters.newlyAdded,
    search: finalSearch,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProperties(apiFilters);

  const lastPage = data?.pages?.[data.pages.length - 1];

  const assets = lastPage && lastPage.success ? lastPage?.data?.data : [];

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const getAssetImage = (documents: any[]) => {
    const image = documents?.find((d: any) => d.documentType === 'ASSET_IMAGE');
    if (!image) return '/images/property-details/property-details.png';

    const rawUrl = image.url ?? image.documentUrl;
    if (!rawUrl) return '/images/property-details/property-details.png';

    // If it's already an absolute URL, return it as is
    if (rawUrl.startsWith('http')) return rawUrl;

    return `${API_BASE_URL}/storage/${rawUrl}`;
  };

  return (
    <section className="w-full text-[var(--fg)] font-work pt-36 xl:pt-40 pb-20 bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 md:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full">
            <div className="p-4 lg:p-6 mt-4 space-y-6 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-xl w-full">
              <motion.div
                variants={itemVariants}
                className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 border-b border-[var(--fg)]/20 pb-6"
              >
                <div>
                  <h1 className="font-32">Property Portfolio</h1>
                  <p className="font-14">Your compliance-ready sales catalog</p>
                </div>
                <div className="flex bg-[#ffffff] border border-gray-200 rounded-full p-1 shadow-sm overflow-hidden w-fit">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAssetStatus(opt.value)}
                      className={`flex-1 lg:flex-none px-6 lg:px-9 py-2.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-300
                          ${
                            assetStatus === opt.value
                              ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] bg-[#4F46E5] shadow-md text-white'
                              : 'text-gray-900 hover:bg-gray-100'
                          }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border
                        ${
                          filterOpen ||
                          activeFilters.subType ||
                          activeFilters.newlyAdded
                            ? 'border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                  >
                    <FiFilter size={16} />
                    <span>Filter</span>
                  </button>

                  <PropertyFilterDropdown
                    open={filterOpen}
                    filters={activeFilters}
                    onApply={(filters) => setActiveFilters(filters)}
                    onClose={() => setFilterOpen(false)}
                  />
                </div>
              </motion.div>

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

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {[...Array(6)].map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : assets?.length === 0 ? (
                  <motion.div
                    key="no-data"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="py-20 flex flex-col items-center justify-center text-[var(--fg)]/40 gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-[var(--fg)]/5 flex items-center justify-center">
                      <FiAlertCircle
                        size={40}
                        className="text-[var(--fg)]/20"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-20 font-medium text-[var(--fg)]/60">
                        No Properties Found
                      </p>
                      <p className="font-14">
                        There are currently no properties matching your selected
                        criteria.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`assets-grid-${assetStatus}-${finalSearch}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {assets?.map((asset) => (
                      <motion.div key={asset.id} variants={itemVariants}>
                        <PropertyCard
                          property={{
                            id: String(asset.id),
                            title: asset.assetTitle,
                            location: [
                              asset.meta?.find((m: any) => m.metaKey === 'city')
                                ?.metaValue,
                              asset.meta?.find(
                                (m: any) => m.metaKey === 'state'
                              )?.metaValue,
                            ]
                              .filter(Boolean)
                              .join(', '),
                            image: getAssetImage(asset.documents ?? []),
                            availability: `${asset.remainingFractions}/${asset.totalFractions} fractions`,
                            price: `₹${Number(
                              asset.currentPricePerFraction ??
                                asset.price?.currentPricePerFraction ??
                                0
                            ).toLocaleString('en-IN')}`,
                            returns: `${asset.financials?.yield?.actualYieldPercent ?? 0}% annually`,
                            status:
                              asset.remainingFractions === 0
                                ? 'pending'
                                : 'ready',
                            description:
                              asset.meta?.find(
                                (m: any) => m.metaKey === 'description'
                              )?.metaValue ?? '',
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {hasNextPage && (
                <div className="flex items-center justify-center gap-4 text-xs text-white/40 pt-10">
                  <button
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="px-6 py-2 bg-[var(--fg)]/10 rounded-full hover:bg-[var(--fg)]/20 transition-all text-(--fg) disabled:opacity-40"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More Properties'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
