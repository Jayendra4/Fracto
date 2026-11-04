import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { primaryClubs } from './data';
import SecondaryClubDetail from './SecondaryClubDetail';
import { useMySecondaryClubs, useJoinedGroupsList } from '@/api/group.api';
import type { RootState } from '@/redux/store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const POSITIVE_STATUSES = new Set([
  'Live',
  'Completed',
  'Verified',
  'Approved',
]);

export function StatusBadge({ status }: { status: string }) {
  const isLive = POSITIVE_STATUSES.has(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isLive ? 'bg-green/10 text-green' : 'bg-[#F5A623]/10 text-[#F5A623]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green' : 'bg-[#F5A623]'}`}
      />
      {status}
    </span>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-5 flex items-center gap-4"
    >
      <div className="p-2.5 rounded-xl bg-[#3A76C0]/10 shrink-0">
        <span className="text-[#3A76C0]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-[#0B2545] dark:text-white leading-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function MyClub() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const SECONDARY_CLUBS_TAKE = 10;
  const [secondaryClubsPage, setSecondaryClubsPage] = useState(1);
  const secondaryClubsSkip = (secondaryClubsPage - 1) * SECONDARY_CLUBS_TAKE;

  // Pagination not added yet — /join-group/{accountId}/joined-group
  // returns a flat array, no count/skip/take. Re-enable once the backend
  // supports it.
  // const PENDING_CLUBS_TAKE = 10;
  // const [pendingClubsPage, setPendingClubsPage] = useState(1);
  // const pendingClubsSkip = (pendingClubsPage - 1) * PENDING_CLUBS_TAKE;

  const accountId = useSelector((state: RootState) => state.authLogin.user?.id);

  const { data: secondaryClubsData, isLoading: isLoadingSecondaryClubs } =
    useMySecondaryClubs(secondaryClubsSkip, SECONDARY_CLUBS_TAKE);
  const { data: pendingClubsData, isLoading: isLoadingPendingClubs } =
    useJoinedGroupsList(accountId);

  if (id) {
    return <SecondaryClubDetail />;
  }

  const secondaryClubs = secondaryClubsData?.data ?? [];
  const pendingClubs = pendingClubsData ?? [];
  const secondaryClubsTotalPages = Math.max(
    1,
    Math.ceil((secondaryClubsData?.count ?? 0) / SECONDARY_CLUBS_TAKE)
  );
  // const pendingClubsTotalPages = Math.max(
  //   1,
  //   Math.ceil((pendingClubsData?.count ?? 0) / PENDING_CLUBS_TAKE)
  // );

  const totalReview = primaryClubs.reduce(
    (sum, c) => sum + c.assetsUnderReview,
    0
  );
  const totalVotes = secondaryClubs.reduce((sum, c) => sum + c.votesCount, 0);

  return (
    <section className="w-full min-h-screen pt-34 xl:pt-40 font-work pb-20 transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full px-4 md:px-10"
      >
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            variants={itemVariants}
            className="py-5 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div className="pagehead">
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                My Clubs
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                Clubs you belong to, assets under review, and secondary market
                activity.
              </p>
            </div>

            <Link
              to="/primary-club"
              className="w-full sm:w-auto text-center px-5 py-2 rounded-lg bg-[#3A76C0] text-white font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
            >
              Discover More Clubs
              <FiArrowRight />
            </Link>
          </motion.div>

          <div className=" grid-cols-1 sm:grid-cols-3 hidden gap-4 mb-8">
            <SummaryCard
              icon={<FiUsers size={18} />}
              label="Clubs Joined"
              value={String(primaryClubs.length)}
            />
            <SummaryCard
              icon={<FiFileText size={18} />}
              label="Assets Under Review"
              value={String(totalReview)}
            />
            <SummaryCard
              icon={<FiTrendingUp size={18} />}
              label="Active Votes"
              value={String(totalVotes)}
            />
          </div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-5 md:p-6 mb-6"
          >
            <h2 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-1">
              Primary Club
            </h2>
            <p className="text-gray-400 dark:text-gray-500 font-12 mb-4">
              Primary clubs you&apos;ve joined.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-12">
                <thead>
                  <tr className="text-left text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider border-b border-[#E3E7EE] dark:border-white/10">
                    <th className="py-3 pr-4 font-medium">Club</th>
                    <th className="py-3 pr-4 font-medium">Description</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPendingClubs ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-400 dark:text-gray-500 font-12"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : pendingClubs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-400 dark:text-gray-500 font-12"
                      >
                        No primary clubs joined yet.
                      </td>
                    </tr>
                  ) : (
                    pendingClubs.map((club) => (
                      <tr
                        key={club.id}
                        className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3.5 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                          {club.title}
                        </td>
                        <td className="py-3.5 pr-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {club.description}
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={club.groupStatus} />
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green/10 text-green">
                              Joined
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              navigate(`/primary-club-details/${club.id}`)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3A76C0]/10 text-[#3A76C0] hover:bg-[#3A76C0]/20 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination not added yet — /join-group/{accountId}/joined-group
            returns a flat array, no count/skip/take. Re-enable once the
            backend supports it.
            {pendingClubsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <button
                  disabled={pendingClubsPage === 1}
                  onClick={() => setPendingClubsPage((p) => p - 1)}
                  className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white disabled:opacity-40"
                >
                  <FiChevronLeft size={18} />
                </button>

                {Array.from({ length: pendingClubsTotalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPendingClubsPage(pageNum)}
                      className={`px-3 py-1 rounded-md font-12 border ${
                        pendingClubsPage === pageNum
                          ? 'bg-[#3A76C0] text-white border-[#3A76C0]'
                          : 'border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={pendingClubsPage === pendingClubsTotalPages}
                  onClick={() => setPendingClubsPage((p) => p + 1)}
                  className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white disabled:opacity-40"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
            */}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-5 md:p-6"
          >
            <h2 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-1">
              Secondary Clubs
            </h2>
            <p className="text-gray-400 dark:text-gray-500 font-12 mb-4">
              Assets from your clubs currently trading on the secondary
              marketplace.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-12">
                <thead>
                  <tr className="text-left text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider border-b border-[#E3E7EE] dark:border-white/10">
                    <th className="py-3 pr-4 font-medium">Club</th>
                    <th className="py-3 pr-4 font-medium">Asset</th>
                    <th className="py-3 pr-4 font-medium">Members</th>
                    {/* <th className="py-3 pr-4 font-medium">Active Votes</th> */}
                    {/* <th className="py-3 pr-4 font-medium">Status</th> */}
                    <th className="py-3 pr-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingSecondaryClubs ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-400 dark:text-gray-500 font-12"
                      >
                        Loading clubs…
                      </td>
                    </tr>
                  ) : secondaryClubs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-400 dark:text-gray-500 font-12"
                      >
                        You haven&apos;t joined any secondary clubs yet.
                      </td>
                    </tr>
                  ) : (
                    secondaryClubs.map((club) => (
                      <tr
                        key={club.id}
                        className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3.5 pr-4 capitalize text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                          {club.title}
                        </td>
                        <td className="py-3.5 pr-4 capitalize text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {club.assetTitle}
                        </td>
                        <td className="py-3.5 pr-4 text-gray-600 dark:text-gray-300">
                          {club.membersCount}
                        </td>
                        {/* <td className="py-3.5 pr-4 text-gray-600 dark:text-gray-300">
                          {club.votesCount}
                        </td> */}
                        {/* <td className="py-3.5 pr-4">
                          {!club.hasVoted && club.voteStatus !== 'Ended' ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/my-club/${club.assetId}?clubId=${club.id}`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#3A76C0] text-[#3A76C0] hover:bg-[#3A76C0]/10 transition-colors"
                            >
                              Review &amp; Vote
                            </button>
                          ) : !club.hasVoted && club.voteStatus == 'Ended' ? (
                            <span
                              title="Voting Closed — You did not submit your vote."
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
        bg-red/10 text-red"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red" />
                              Voting Ended
                            </span>
                          ) : (
                            <StatusBadge
                              status={
                                club.hasVoted ? `Voted: ${club.choice}` : 'Live'
                              }
                            />
                          )}
                        </td> */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/property-details/${club.assetId}`)
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green text-white hover:opacity-90 transition-colors"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/my-club/${club.assetId}?clubId=${club.id}`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3A76C0]/10 text-[#3A76C0] hover:bg-[#3A76C0]/20 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {secondaryClubsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <button
                  disabled={secondaryClubsPage === 1}
                  onClick={() => setSecondaryClubsPage((p) => p - 1)}
                  className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white disabled:opacity-40"
                >
                  <FiChevronLeft size={18} />
                </button>

                {Array.from({ length: secondaryClubsTotalPages }).map(
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setSecondaryClubsPage(pageNum)}
                        className={`px-3 py-1 rounded-md font-12 border ${
                          secondaryClubsPage === pageNum
                            ? 'bg-[#3A76C0] text-white border-[#3A76C0]'
                            : 'border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  disabled={secondaryClubsPage === secondaryClubsTotalPages}
                  onClick={() => setSecondaryClubsPage((p) => p + 1)}
                  className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white disabled:opacity-40"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
