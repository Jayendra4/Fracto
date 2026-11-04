// import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiCheckCircle,
  FiHome,
  FiTrendingUp,
  FiClock,
  FiPlus,
  FiUserPlus,
} from 'react-icons/fi';
import { useBrokerDashboard } from '@/api/brokerDashboard.api';
import { useNavigate } from 'react-router-dom';

function formatCurrency(value: string | number): string {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function DashboardTab() {
  // const navigate = useNavigate();
  const { data: dashboardRes, isLoading } = useBrokerDashboard();
  const dashboard = dashboardRes?.success ? dashboardRes.data : undefined;
  const navigate = useNavigate();
  const totalLeads = dashboard?.stats.totalLeads ?? 0;
  const activeLeads = dashboard?.stats.activeLeads ?? 0;
  const assetsInProgress = dashboard?.stats.assetsInProgress ?? 0;
  const commissionEarned = dashboard?.commissionEarned ?? '0';
  const withdrawalProcessingAmount =
    dashboard?.withdrawalProcessingAmount ?? '0';
  const leadGainsCount = dashboard?.leadGainsCount ?? 0;
  const assetReferralCount = dashboard?.assetReferralCount ?? 0;
  const recentActivity = dashboard?.recentActivity ?? [];
  const actionCenter = dashboard?.actionCenter ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-24 font-serif font-semibold text-[#0B2545] dark:text-white">
            Channel Partner Dashboard
          </h1>
          <p className="font-14 text-gray-500 dark:text-gray-400 mt-1">
            Leads, listings sourced, shares, and commission across all your
            activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
            onClick={() => navigate('/dashboard/my-referrals')}
          >
            <FiUserPlus /> Add Investor
          </button>
          <button
            className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
            onClick={() => navigate('/dashboard/add-asset')}
          >
            <FiPlus /> Add an Asset
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          onClick={() => {
            navigate('/dashboard/submit-lead');
          }}
          className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="font-12  font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Total Leads
          </div>
          <div className="text-xl text-[#0B2545] dark:text-white flex items-center gap-2">
            <FiUsers className="text-[#1F4FE0] text-lg" />
            {isLoading ? '—' : totalLeads}
          </div>
          <div className="font-12 text-gray-500 dark:text-gray-400 mt-2">
            {leadGainsCount} gained
          </div>
        </div>

        <div
          onClick={() => {
            navigate('/dashboard/submit-lead');
          }}
          className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="font-12  font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Active Leads
          </div>
          <div className="text-xl text-[#0B2545] dark:text-white flex items-center gap-2">
            <FiCheckCircle className="text-emerald-500 text-lg" />
            {isLoading ? '—' : activeLeads}
          </div>
          <div className="font-12 text-gray-500 dark:text-gray-400 mt-2">
            Currently in pipeline
          </div>
        </div>

        <div
          onClick={() => {
            navigate('/dashboard/my-assets');
          }}
          className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="font-12  font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Assets In Progress
          </div>
          <div className="text-xl text-[#0B2545] dark:text-white flex items-center gap-2">
            <FiHome className="text-[#0B2545] dark:text-[#60a5fa] text-lg" />
            {isLoading ? '—' : assetsInProgress}
          </div>
          <div className="font-12 text-gray-500 dark:text-gray-400 mt-2 truncate">
            {assetReferralCount} referred total
          </div>
        </div>

        <div
          onClick={() => {
            navigate('/dashboard/commission-ledger');
          }}
          className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="font-12  font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Commission Earned
          </div>
          <div className="text-xl text-[#0B2545] dark:text-white flex items-center gap-2">
            <FiTrendingUp className="text-[#1F4FE0] text-lg" />
            {isLoading ? '—' : formatCurrency(commissionEarned)}
          </div>
          <div className="font-12 text-gray-500 dark:text-gray-400 mt-2">
            Lifetime
          </div>
        </div>

        <div
          onClick={() => {
            navigate('/dashboard/payout-requests');
          }}
          className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="font-12  font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Pending Payout
          </div>
          <div className="text-xl text-[#0B2545] dark:text-white flex items-center gap-2">
            <FiClock className="text-amber-500 text-lg" />
            {isLoading ? '—' : formatCurrency(withdrawalProcessingAmount)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            Awaiting processing
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs md:text-sm text-gray-400">Loading…</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-400">
                No recent activity.
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 text-xs md:text-sm text-gray-700 dark:text-gray-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1F4FE0] mt-1.5 shrink-0" />
                  <div>
                    <div
                      onClick={() => {
                        if (activity.path) {
                          navigate(activity.path);
                        }
                      }}
                      className={`font-medium ${activity.path ? 'cursor-pointer text-[#1F4FE0] hover:underline' : ''}`}
                    >
                      {activity.title}
                    </div>
                    <div className="font-12 text-gray-400 mt-0.5">
                      {timeAgo(activity.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
            Action Center
          </h3>
          <div className="space-y-1">
            {isLoading ? (
              <p className="text-xs md:text-sm text-gray-400 py-2">Loading…</p>
            ) : actionCenter.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-400 py-2">
                Nothing needs your attention right now.
              </p>
            ) : (
              actionCenter.map((item) => (
                <div
                  key={item.referralId}
                  className="flex items-center justify-between gap-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 py-2 border-b border-gray-300 dark:border-white/5 last:border-b-0"
                >
                  <span className="truncate">
                    {item.assetName} — {item.assetOwnerName}
                  </span>
                  <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
