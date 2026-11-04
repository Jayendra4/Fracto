import { type JSX } from 'react';
import { useOwnerVoteStatistics } from '@/api/group.api';

export default function InvestorInterestTab(): JSX.Element {
  const { data, isLoading } = useOwnerVoteStatistics();
  const clubStats = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Investor Interest
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Club votes, per-club breakdown, and individual access-request
          approvals.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm text-center font-12 text-gray-400">
          Loading club vote breakdown…
        </div>
      ) : clubStats.length === 0 ? (
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm text-center font-12 text-gray-400">
          No club votes yet.
        </div>
      ) : (
        clubStats.map((club) => {
          return (
            <div
              key={club.secondaryClubId}
              className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4"
            >
              <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-1">
                Club Vote Breakdown — {club.assetTitle}
              </h3>
              <p className="font-12 text-gray-400">
                {club.clubTitle} · {club.totalVotes} of {club.totalMembers}{' '}
                members voted
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-12 md:font-14 border-collapse min-w-[300px]">
                  <thead>
                    <tr className="border-b border-[#E3E7EE] dark:border-white/10">
                      <th className="py-2 text-[10px] uppercase font-bold text-gray-500">
                        Outcome
                      </th>
                      <th className="py-2 text-[10px] uppercase font-bold text-gray-500">
                        Members
                      </th>
                      <th className="py-2 text-[10px] uppercase font-bold text-gray-500">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E7EE] dark:divide-white/10 text-gray-700 dark:text-gray-300">
                    <tr>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58]">
                          Yes
                        </span>
                      </td>
                      <td className="py-2">{club.yesCount}</td>
                      <td className="py-2">{club.yesPercentage}%</td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FBE3E0] text-[#C0392B]">
                          No
                        </span>
                      </td>
                      <td className="py-2">{club.noCount}</td>
                      <td className="py-2">{club.noPercentage}%</td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-500">
                          Abstain
                        </span>
                      </td>
                      <td className="py-2">{club.abstainCount}</td>
                      <td className="py-2">{club.abstainPercentage}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-400">Not Yet Voted</td>
                      <td className="py-2 text-gray-400">
                        {club.notVotedCount}
                      </td>
                      <td className="py-2 text-gray-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${club.yesPercentage}%` }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
