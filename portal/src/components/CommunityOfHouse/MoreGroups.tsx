import { useState, useEffect } from 'react';
import GroupCard from './Cards';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import { useGroups, useHighlightedGroups } from '@/api/group.api';
import { useOnboarding } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import RoleSelectionModal from '../Dashboard/Overview/RoleSelectionModal';
import { useSelector } from 'react-redux';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import type { RootState } from '@/redux/store';
import Loader from '../Loader';

export default function MoreGroups() {
  const [filter, setFilter] = useState('All Primary Clubs');
  const [search, setSearch] = useState('');
  const [debSearch, setDebSearch] = useState('');
  const navigate = useNavigate();
  const [showAllHighlighted, setShowAllHighlighted] = useState(false);
  const { needsOnboarding } = useOnboarding();
  const { role, token, isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  const { run: refetchUser } = useFetchUserDataFlow();

  const handleRoleSuccess = () => {
    if (token) refetchUser(token);
  };

  const user = useSelector((state: RootState) => state.authLogin.user);
  const currentRole = role || user?.type || user?.role;
  const normalizedRole = currentRole?.toLowerCase();
  const accountID = user?.id;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Top 3 highlighted groups from dedicated API
  const { data: highlightedData, isLoading: highlightedLoading } =
    useHighlightedGroups();
  const highlightedGroups = highlightedData?.data ?? [];
  // const highlightedIds = new Set(highlightedGroups.map((g) => g.id));

  // All groups — exclude highlighted IDs, apply search + filter
  const { data: allData, isLoading: allLoading } = useGroups({
    ...(filter === 'My Primary Clubs' && accountID
      ? { accountId: accountID }
      : {}),
    ...(debSearch ? { search: debSearch } : {}),
  });
  const allGroupsData = allData?.data;

  return (
    <>
      {(highlightedLoading || (allLoading && !allData)) && <Loader />}
      {normalizedRole === 'business' && (
        <RoleSelectionModal onSuccess={handleRoleSuccess} />
      )}
      <div className="w-full bg-[#F4F6F9] dark:bg-[#0B0B0B]">
        <div
          className={`${needsOnboarding ? 'mt-[160px] md:mt-[90px]' : 'mt-[35px]'} min-h-screen w-[90%] max-w-[700px] md:max-w-[1400px] lg:max-w-[1600px] mx-auto py-12 md:py-24 font-work`}
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 font-serif  px-4 py-2 text-[#0B2545] dark:text-white w-full rounded-lg flex gap-1 text-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <FiArrowLeft className="mr-2 mt-1" />
            Back
          </button>

          <div className="mx-auto bg-white dark:bg-[#0a1726] rounded-xl border border-[#E3E7EE] dark:border-white/10 w-full px-6 py-10 md:p-12 shadow-sm">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-[#142F4D] text-xs mb-6 border border-[#3A76C0]/20">
                ● Fracto Community
              </div>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#0B2545] dark:text-white mb-4">
                Find Your Community. Discover Better Opportunities.
              </h1>
              <p className="text-lg md:text-lg max-w-3xl leading-relaxed text-gray-500 dark:text-gray-400">
                Fracto Primary Clubs bring together prospective
                co-owners, asset owners, brokers, and advisors who share a
                common interest in specific real estate segments. Join a group
                to stay informed, exchange insights, and access curated
                opportunities relevant to your focus area.
              </p>
            </motion.div>

            {/* Top Highlighted Groups */}
            {highlightedGroups.length > 0 && (
              <section className="mb-20">
                <h2 className="font-serif text-2xl font-bold text-[#0B2545] dark:text-white mb-8">
                  Top Highlighted Primary Clubs
                </h2>

                {highlightedGroups.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-lg py-10">
                    No Top Highlighted Primary Clubs Available
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch items-stretch mx-auto w-full">
                    {highlightedGroups.map((g, idx) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative w-full h-full flex flex-col"
                      >
                        <div className="absolute text-white top-4 right-4 bg-[#3A76C0]/20 text-10 px-2 py-1 rounded-full border border-[#3A76C0]/30 z-20">
                          ● Top Highlighted
                        </div>
                        <GroupCard
                          key={g.id}
                          {...g}
                          isLoading={highlightedLoading}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
                {highlightedGroups.length !== 0 && (
                  <div className="mt-10 hidden text-center">
                    <button
                      onClick={() => setShowAllHighlighted(!showAllHighlighted)}
                      className="inline-flex items-center gap-2 text-[#0B2545] dark:text-white transition-colors cursor-pointer"
                    >
                      {showAllHighlighted
                        ? 'Show Less'
                        : 'See All Top Highlighted Primary Clubs'}
                      <FiChevronDown
                        className={`transition-transform duration-300 ${showAllHighlighted ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Search & Filters — above All Groups */}
            <div className="flex flex-row gap-2 mb-8 items-center justify-between">
              <div className="relative flex-1 md:max-w-xl">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Club"
                  className="bg-white dark:bg-[#0d1a27] border border-[#E3E7EE] dark:border-white/10 h-10 w-full rounded-xl py-2 pl-10 pr-2 text-[#0B2545] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#3A76C0]/50 transition-all text-xs sm:text-sm"
                />
              </div>

              {isAuthenticated && (
                <div className="flex gap-1.5 shrink-0">
                  {['All Primary Clubs', 'My Primary Clubs'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-2 sm:px-4 py-2 rounded-md text-[10px] sm:text-sm transition-all border whitespace-nowrap cursor-pointer ${
                        filter === tab
                          ? 'bg-[#4F86C0] text-white border-[#4F86C0]'
                          : 'text-[#0B2545] dark:text-white border-[#4F86C0] hover:bg-[#4F86C0]/10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All Groups */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-[#0B2545] dark:text-white mb-8">
                All Primary Clubs
              </h2>
              {allGroupsData?.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 text-lg py-10">
                  No Primary Clubs Available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch items-stretch mx-auto w-full">
                  {allGroupsData?.map((group, idx) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative w-full h-full flex flex-col"
                    >
                      <GroupCard
                        key={group.id}
                        {...group}
                        isLoading={allLoading}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
