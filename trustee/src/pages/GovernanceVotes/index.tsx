import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import Loader from '@/components/common/Loader';
import {
  useGetSpvVotingStatusQuery,
  useSendVotingReminderMutation,
  SPVVotingStatusItem,
} from '@/store/api/spvApi';
import { useDebounce } from '@/hooks';

const GovernanceVotes = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  const [sendVotingReminder] = useSendVotingReminderMutation();
  const [sendingReminderSpvId, setSendingReminderSpvId] = useState<number | null>(null);

  const handleSendReminder = async (spvId: number) => {
    setSendingReminderSpvId(spvId);
    try {
      await sendVotingReminder(spvId).unwrap();
      toast.success('Reminder sent successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminder. Please try again.');
    } finally {
      setSendingReminderSpvId(null);
    }
  };

  // SPV List pagination
  const [spvSkip, setSpvSkip] = useState(0);
  const [spvTake, setSpvTake] = useState(10);

  // Reset pagination when search changes
  useEffect(() => {
    setSpvSkip(0);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useGetSpvVotingStatusQuery({
    skip: spvSkip,
    take: spvTake,
    search: debouncedSearch || undefined,
  });

  const votingStatusList = data?.data || [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load governance voting status. Please try again.
      </div>
    );
  }

  const currentPage = Math.floor(spvSkip / spvTake) + 1;
  const totalPages = data ? Math.ceil(data.count / spvTake) : 1;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Governance Votes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active and historical voting status across all SPVs.
        </p>
      </div>

      <div className="mb-4 flex w-full items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SPV name or asset..."
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-4">
        {votingStatusList.length > 0 ? (
          votingStatusList.map((spv: SPVVotingStatusItem) => {
            const outcomes = [
              { label: 'Voted so far', value: `${spv.votedMembers} of ${spv.totalMembers}` },
              { label: 'Not Yet Voted', value: `${spv.notVotedMembers} of ${spv.totalMembers}` },
              { label: 'SPV Status', value: spv.spvStatus },
              { label: 'Asset Status', value: spv.assetStatus },
              { label: 'RWA Status', value: spv.rwaStatus },
            ];

            return (
              <div
                key={spv.spvId}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-2 pt-4">
                  <h2 className="text-sm font-bold text-foreground">
                    {spv.spvName} — {spv.assetTitle}
                  </h2>

                  <div className="flex gap-2 shrink-0">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      SPV: {spv.spvStatus}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Asset: {spv.assetStatus}
                    </span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      RWA: {spv.rwaStatus}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-3 pt-3">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-1 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Outcome / Detail
                          </th>
                          <th className="px-1 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Shareholders / Value
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {outcomes.map((outcome, index) => (
                          <tr key={index} className="border-b border-border last:border-b-0">
                            <td className="px-1 py-2.5 text-sm text-foreground">{outcome.label}</td>

                            <td className="px-1 py-2.5 text-sm text-foreground font-semibold">
                              {outcome.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 px-5 pb-4 pt-4 border-t border-border bg-muted/5">
                  <button
                    type="button"
                    disabled={sendingReminderSpvId === spv.spvId}
                    onClick={() => handleSendReminder(spv.spvId)}
                    className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReminderSpvId === spv.spvId
                      ? 'Sending...'
                      : 'Send Reminder to Non-Voters'}
                  </button>

                  {/* <button
                    type="button"
                    onClick={() => navigate('/exit-liquidation-tracker')}
                    className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                  >
                    View Full Exit Tracker
                  </button> */}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-border bg-background px-5 py-10 text-center text-sm text-muted-foreground">
            No active governance voting status found.
          </div>
        )}
      </div>

      {/* SPV List Pagination */}
      {data && data.count > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{spvSkip + 1}</span> to{' '}
            <span className="font-medium text-foreground">
              {Math.min(spvSkip + spvTake, data.count)}
            </span>{' '}
            of <span className="font-medium text-foreground">{data.count}</span> SPVs
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">SPVs per page</p>
              <select
                value={spvTake}
                onChange={(e) => {
                  setSpvTake(Number(e.target.value));
                  setSpvSkip(0);
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSpvSkip((prev) => Math.max(0, prev - spvTake))}
                disabled={spvSkip === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setSpvSkip((prev) => prev + spvTake)}
                disabled={spvSkip + spvTake >= data.count}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceVotes;
