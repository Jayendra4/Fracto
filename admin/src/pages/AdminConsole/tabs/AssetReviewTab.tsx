import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useGetAdminAssetsQuery } from '@/store/api/assetsApi';
import { useDebounce } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  who: string;
  text: string;
  type: 'in' | 'out';
}

export function AssetReviewTab() {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetAdminAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    newlyAdded: true,
    search: debouncedSearch || undefined,
  });

  const assetsList = data?.data || [];
  const totalCount = data?.count || 0;

  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getCompletedUpTo = (currentStep: number, rwaStatus?: string) => {
    if (rwaStatus === 'LegalRejected') return 3;
    if (rwaStatus === 'ValuationRejected') return 4;
    if (rwaStatus === 'DueDiligenceRejected') return 5;

    if (currentStep === 5) {
      const lowerStatus = rwaStatus?.toLowerCase();
      if (lowerStatus === 'submitted' || lowerStatus === 'draft') return 3;
      if (rwaStatus === 'LegalReview') return 4;
      if (rwaStatus === 'ValuationReviewed') return 5;
      if (rwaStatus === 'DueDiligence') return 6;
    }

    if (currentStep === 6) {
      return 7;
    }

    return currentStep;
  };

  const steps = [
    { index: 1, name: '1. Preliminary', rejectStatus: '' },
    { index: 2, name: '2. Admin Review', rejectStatus: '' },
    { index: 3, name: '3. Full Details Submitted', rejectStatus: '' },
    { index: 4, name: '4. Legal Review', rejectStatus: 'LegalRejected' },
    { index: 5, name: '5. Valuation Review', rejectStatus: 'ValuationRejected' },
    { index: 6, name: '6. Due Diligence', rejectStatus: 'DueDiligenceRejected' },
    { index: 7, name: '7. Live', rejectStatus: '' },
  ];

  const [hcMessages, setHcMessages] = useState<Message[]>([
    {
      who: 'Young Attitude Group',
      text: 'Encumbrance certificate re-uploaded — please re-check.',
      type: 'in',
    },
    { who: 'Admin', text: 'Received, forwarded to Legal for re-verification.', type: 'out' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const triggerModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const scrollChatToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [hcMessages]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
            Asset Review Queue
          </h2>
          <p className="text-slate-400">
            Sequenced review steps, with remarks, messaging, and vote-agenda tools at each stage.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            className="bg-slate-950 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary h-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : assetsList.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800/80 p-8 text-center text-slate-400">
          No assets found in review queue.
        </Card>
      ) : (
        <div className="space-y-6">
          {assetsList.map((asset: any) => {
            const completedUpTo = getCompletedUpTo(asset.currentStep, asset.rwaStatus);
            return (
              <Card
                key={asset.assetId}
                className="bg-slate-900/50 border-slate-800/80 animate-fade-in"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg text-white font-semibold">
                      {asset.assetTitle}
                      {asset.location && (
                        <span className="text-xs font-normal text-slate-400 ml-2">
                          · {asset.location.city || ''}
                          {asset.location.state ? `, ${asset.location.state}` : ''}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
                    {asset.assetStatus}
                  </span>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Stepper */}
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-center p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                    {steps.map((step) => {
                      const isRejected = asset.rwaStatus === step.rejectStatus;
                      const isCompleted = step.index <= completedUpTo;
                      const isInProgress = step.index === completedUpTo + 1;

                      let barClass = 'bg-slate-800';
                      let textClass = 'text-slate-500';

                      if (isRejected) {
                        barClass = 'bg-rose-600';
                        textClass = 'text-rose-500 font-bold';
                      } else if (isCompleted) {
                        barClass = 'bg-primary';
                        textClass = 'text-slate-200 font-semibold';
                      } else if (isInProgress) {
                        barClass = 'bg-primary animate-pulse';
                        textClass = 'text-white font-bold';
                      }

                      return (
                        <div key={step.index} className="space-y-1">
                          <div className={`h-1.5 w-full rounded-full ${barClass}`} />
                          <p className={`text-[11px] ${textClass}`}>{step.name}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Verification Table */}
                  <div className="overflow-x-auto border border-slate-850 rounded-xl">
                    <table className="w-full text-sm text-left text-slate-350">
                      <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Track</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {/* Legal Review */}
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-300">Legal Review</td>
                          <td className="px-4 py-3">
                            {asset.rwaStatus === 'LegalRejected' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
                                Rejected
                              </span>
                            ) : completedUpTo >= 4 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Valuation Review */}
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-300">
                            Valuation Review
                          </td>
                          <td className="px-4 py-3">
                            {asset.rwaStatus === 'ValuationRejected' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
                                Rejected
                              </span>
                            ) : completedUpTo >= 5 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Due Diligence */}
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-300">Due Diligence</td>
                          <td className="px-4 py-3">
                            {asset.rwaStatus === 'DueDiligenceRejected' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
                                Rejected
                              </span>
                            ) : completedUpTo >= 6 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {asset.currentStep <= '5' ? (
                    <p className="inline-flex items-center  text-sm font-semibold  text-white  ">
                      * Asset is pending for Trustee approval.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-6">
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>
                  Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-white">{Math.min(endIndex, totalCount)}</span>{' '}
                  of <span className="font-semibold text-white">{totalCount}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Rows per page:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPageIndex(0);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[60px] bg-slate-900 border-slate-800 text-slate-200 text-xs">
                      <SelectValue placeholder={String(pageSize)} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                  disabled={pageIndex === 0}
                  className="h-8 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="text-xs text-slate-300 px-2 font-medium">
                  Page {pageIndex + 1} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={pageIndex >= totalPages - 1}
                  className="h-8 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {modalConfig && (
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalConfig.title}
          description={modalConfig.description}
          onConfirm={modalConfig.onConfirm}
          isDestructive={modalConfig.isDestructive}
        />
      )}
    </div>
  );
}
