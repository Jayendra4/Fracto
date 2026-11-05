/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed error handling, matches the pattern in rwa.api.ts */
import { useState, type JSX } from 'react';
import { toast } from 'react-toastify';
import type { NavigateFunction } from 'react-router-dom';
import { useSelector } from 'react-redux';
// import { FiPlus } from 'react-icons/fi';
import type { RootState } from '@/redux/store';
import { useActivityWidgets, useOverviewPortfolio } from '@/api/overview.api';
import { useCastVote, type VoteChoice } from '@/api/group.api';

type Badge = 'live' | 'review' | 'funding' | 'closed';

const BADGE_STYLES: Record<Badge, string> = {
  live: 'bg-green-500/10 text-green-600 dark:text-green-400',
  review:
    'bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400',
  funding:
    'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-[#60a5fa]',
  closed: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
};

function StatusBadge({ label, tone }: { label: string; tone: Badge }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${BADGE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}

function formatINR(n: number) {
  return `₹${(n || 0).toLocaleString('en-IN')}`;
}

function holdingBadgeTone(status: string): Badge {
  const s = status.toLowerCase();
  if (s.includes('manage') || s.includes('live')) return 'live';
  if (s.includes('fund')) return 'funding';
  return 'review';
}

function formatActivityDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function docBadgeTone(status: string): Badge {
  const s = status.toLowerCase();
  if (s.includes('approve') || s.includes('sign')) return 'live';
  if (s.includes('reject')) return 'closed';
  return 'review';
}

export default function InvestorOverviewTab({
  navigate,
}: {
  navigate: NavigateFunction;
}): JSX.Element {
  const { user } = useSelector((state: RootState) => state.authLogin);
  const isBroker = user?.type === 'Broker';

  const { data, isLoading } = useActivityWidgets();
  const { data: portfolio, isLoading: isPortfolioLoading } =
    useOverviewPortfolio();
  const { mutate: castVoteMutation, isPending: isVoting } = useCastVote();
  const [votedClubs, setVotedClubs] = useState<Record<number, VoteChoice>>({});

  const activity = data?.recentActivity ?? [];
  const docs = data?.documentsAcknowledgements ?? [];
  const pendingVotes = data?.pendingVotes ?? [];
  const myHoldings = portfolio?.myHoldings ?? [];

  const kpis = portfolio
    ? [
        {
          label: 'Total Portfolio Value',
          value: formatINR(portfolio.totalPortfolioValue.amount),
          sub: `${portfolio.totalPortfolioValue.changePercent}% ${
            portfolio.totalPortfolioValue.trend === 'UP' ? '↑' : '↓'
          }`,
          up: portfolio.totalPortfolioValue.trend === 'UP',
        },
        {
          label: 'Asset Appreciation',
          value: `${portfolio.assetAppreciation.percentage}%`,
          sub: portfolio.assetAppreciation.period,
          up: portfolio.assetAppreciation.trend === 'UP',
        },
        {
          label: 'Realized Profit/Loss',
          value: formatINR(portfolio.realizedProfitLoss.amount),
          sub: `${portfolio.realizedProfitLoss.label} · ${portfolio.realizedProfitLoss.period}`,
          up: portfolio.realizedProfitLoss.type === 'PROFIT',
        },
        {
          label: 'Total Income Collected',
          value: formatINR(portfolio.totalIncomeCollected),
          sub: 'Lifetime',
        },
        {
          label: 'Total Properties Invested',
          value: String(portfolio.totalPropertiesInvested),
          sub: 'Across your portfolio',
        },
      ]
    : [];

  const castVote = (
    secondaryClubId: number,
    assetId: number,
    choice: VoteChoice
  ) => {
    castVoteMutation(
      { assetId, secondaryClubId, choice },
      {
        onSuccess: (res: any) => {
          if (res?.success === false) {
            toast.error(res?.message || 'Failed to submit your vote');
            return;
          }
          setVotedClubs((prev) => ({ ...prev, [secondaryClubId]: choice }));
          toast.success(`Vote recorded: ${choice}`);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to submit your vote');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="pagehead flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            Portfolio Overview
          </h1>
          <p className="text-[var(--fg)]/60 font-14 mt-1">
            Indicative values shown below. Not a guarantee of return, yield or
            exit value.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => toast.info('Downloading latest holdings statement…')}
            className="bg-white hidden dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
          >
            Download Statement
          </button>
          {isBroker ? (
            <>
              {/* <button
                className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                onClick={() => navigate('/dashboard/add-asset')}
              >
                <FiPlus /> Add an Asset
              </button> */}
              <button
                onClick={() => navigate('/dashboard/clubs-section')}
                className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#1A42BD] transition cursor-pointer"
              >
                Explore Assets
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/dashboard/clubs-section')}
              className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#1A42BD] transition cursor-pointer"
            >
              Explore Assets
            </button>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {isPortfolioLoading ? (
          <p className="col-span-full font-12 text-gray-400">Loading…</p>
        ) : (
          kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-4 transition hover:shadow-md"
            >
              <p className="font-12 font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {kpi.label}
              </p>
              <p className="font-serif text-xl text-[#0B2545] dark:text-white">
                {kpi.value}
              </p>
              <p
                className={`text-[11px] mt-1.5 ${
                  'up' in kpi && kpi.up
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}
              >
                {kpi.sub}
              </p>
            </div>
          ))
        )}
      </div>

      {/* My Holdings + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white">
              My Holdings
            </h3>
            <button
              onClick={() => navigate('/dashboard/my-holdings')}
              className="text-[#1F4FE0] dark:text-[#60a5fa] font-12 font-medium hover:underline cursor-pointer"
            >
              View all →
            </button>
          </div>
          <table className="w-full text-left font-12">
            <thead>
              <tr className="text-gray-400 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
                <th className="py-2 pr-4 font-medium">Asset</th>
                <th className="py-2 pr-4 font-medium">SPV</th>
                <th className="py-2 pr-4 font-medium">Invested</th>
                <th className="py-2 pr-4 font-medium">Current Value</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isPortfolioLoading ? (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : myHoldings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-[var(--fg)]/60  font-12">
                    No holdings yet.
                  </td>
                </tr>
              ) : (
                myHoldings.map((h) => (
                  <tr
                    key={h.assetId}
                    className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                  >
                    <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                      {h.assetTitle}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                      {h.spvName || '—'}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                      {formatINR(h.invested)}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                      {formatINR(h.currentValue)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge
                        label={h.status}
                        tone={holdingBadgeTone(h.status)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-[#E3E7EE] dark:border-white/10 font-12 text-gray-400 leading-relaxed">
            Indicative current value only. Fracto does not guarantee,
            assure, or promise any fixed return, rental yield, capital
            appreciation, exit value, or repayment of capital.
          </div>
        </div>

        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="font-12 text-gray-400">Loading…</p>
            ) : activity.length === 0 ? (
              <p className="font-12 text-gray-400">No recent activity.</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F4FE0] mt-1.5 shrink-0" />
                  <div>
                    <p
                      onClick={() => {
                        if (a.path) {
                          navigate(a.path);
                        }
                      }}
                      className={`font-14 font-semibold text-[#0B2545] dark:text-white leading-snug ${a.path ? 'cursor-pointer text-[#1F4FE0] hover:underline' : ''}`}
                    >
                      {a.title}
                    </p>
                    <p className="font-12 text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                      {a.body}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatActivityDate(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Votes + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-4">
            Pending Votes
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="font-12 text-gray-400">Loading…</p>
            ) : pendingVotes.length === 0 ? (
              <p className="font-12 text-gray-400">No pending votes.</p>
            ) : (
              pendingVotes.map((v) => {
                const choice = votedClubs[v.secondaryClubId];
                const isActive = v.voteStatus === 'Active';
                const canVote = isActive && !choice;
                return (
                  <div
                    key={v.secondaryClubId}
                    className={`border border-[#E3E7EE] dark:border-white/10 rounded-lg p-3.5 transition ${
                      choice || !isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-12 font-semibold text-[#0B2545] dark:text-white">
                        {v.assetTitle}
                      </p>
                      <StatusBadge
                        label={v.voteStatus}
                        tone={
                          v.voteStatus === 'Active'
                            ? 'live'
                            : v.voteStatus === 'Ended'
                              ? 'closed'
                              : 'review'
                        }
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 mb-3">
                      {v.totalVotes} of {v.totalMembers} voted · Closes{' '}
                      {formatActivityDate(v.endDate)}
                    </p>
                    {choice ? (
                      <p className="text-[12px] font-semibold text-green-600 dark:text-green-400">
                        You voted {choice}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            castVote(v.secondaryClubId, v.assetId, 'Yes')
                          }
                          disabled={!canVote || isVoting}
                          className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold border border-green-500/40 text-green-600 hover:bg-green-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() =>
                            castVote(v.secondaryClubId, v.assetId, 'No')
                          }
                          disabled={!canVote || isVoting}
                          className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold border border-red-400/40 text-red-500 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          No
                        </button>
                        <button
                          onClick={() =>
                            castVote(v.secondaryClubId, v.assetId, 'Abstain')
                          }
                          disabled={!canVote || isVoting}
                          className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Abstain
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-4">
            Documents &amp; Acknowledgements
          </h3>
          <div className="space-y-1">
            {isLoading ? (
              <p className="font-12 text-gray-400">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="font-12 text-gray-400">No documents yet.</p>
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2.5 border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                >
                  <span className="font-14 text-[#0B2545] dark:text-white">
                    {d.name}
                  </span>
                  <StatusBadge label={d.status} tone={docBadgeTone(d.status)} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
