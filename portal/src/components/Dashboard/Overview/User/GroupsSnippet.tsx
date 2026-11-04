import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';
import { MdOutlineGroups } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import { BsBarChart } from 'react-icons/bs';
import { useDashboardOverview } from '@/api/group.api';

export default function GroupsSnippet() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardOverview();

  const communities = data?.communities;

  return (
    <div
      onClick={() => navigate('/primary-club')}
      className="p-4 lg:py-5 lg:px-6 flex flex-col gap-4 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl transition-all duration-300 text-[var(--fg)] cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-18">My Communities</p>
        <FiArrowUpRight className="text-[var(--fg)]/40 text-lg" />
      </div>

      {/* Primary stat */}
      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <div className="h-9 w-16 bg-[var(--fg)]/10 rounded animate-pulse" />
          ) : (
            <span className="font-30 xl:font-new-40 font-medium leading-[100%]">
              {communities?.groupsJoined ?? 0}
            </span>
          )}
          <p className="text-sm text-[var(--fg)]/50 mt-1">Groups Joined</p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <div className="h-6 w-24 bg-[var(--fg)]/10 rounded animate-pulse" />
          ) : (
            <p className="text-lg font-semibold text-[var(--fg)]">
              {(communities?.totalMembers ?? 0).toLocaleString()}
            </p>
          )}
          <p className="text-xs text-[var(--fg)]/40">Total Members</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <BsBarChart className="text-[#60A5FA] text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : (communities?.assetsShared ?? 0)}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            Assets Shared
          </p>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <MdOutlineGroups className="text-orange-400 text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : (communities?.mySharedAssets ?? 0)}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            My Shares
          </p>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <HiSparkles className="text-green-400 text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : `+${communities?.newMembersThisWeek ?? 0}`}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            New This Week
          </p>
        </div>
      </div>

      {/* Most active group */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
        <p className="text-xs text-[var(--fg)]/50 truncate shrink-0">
          Most Active
        </p>
        {isLoading ? (
          <div className="h-4 w-28 bg-[var(--fg)]/10 rounded animate-pulse ml-2" />
        ) : (
          <p className="text-xs font-semibold text-[var(--fg)] truncate ml-2 text-right">
            {communities?.mostActiveGroup?.title ?? '—'}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="hidden items-center justify-between pt-1 border-t border-[var(--fg)]/8">
        <div className="flex items-center gap-1.5 text-xs text-[var(--fg)]/50">
          <FaUsers className="text-[#60A5FA] shrink-0" />
          <span>
            {isLoading
              ? '—'
              : (communities?.totalMembers ?? 0).toLocaleString()}{' '}
            total members
          </span>
        </div>
        <span className="text-xs font-semibold text-green-400 shrink-0 ml-2">
          +{isLoading ? '—' : (communities?.newMembersThisWeek ?? 0)} this week
        </span>
      </div>
    </div>
  );
}
