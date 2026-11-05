import { useParams } from 'react-router-dom';
import { useCommissionDetail } from '@/api/brokerCommission.api';
import SummaryCard from './summaryCard';
import { FiCheckCircle, FiDollarSign, FiLock } from 'react-icons/fi';
import Loader from '@/components/Loader';

export default function CommissionStatus() {
  const { ledgerId } = useParams();
  const { data: detailRes, isLoading } = useCommissionDetail(ledgerId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#132436]">
        <Loader />
      </div>
    );
  }

  const detail = detailRes?.success ? detailRes.data : null;

  const earnedAmount = detail?.amounts?.earnedAmount
    ? Number(detail.amounts?.earnedAmount).toLocaleString('en-IN')
    : '0';
  const estimatedAmount = detail?.amounts?.estimatedAmount
    ? Number(detail.amounts?.estimatedAmount).toLocaleString('en-IN')
    : '0';
  const holdAmount = detail?.amounts?.holdAmount
    ? Number(detail.amounts?.holdAmount).toLocaleString('en-IN')
    : '0';
  const status = detail?.status || 'N/A';
  const displayStatus =
    status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'paid'
      ? 'Released'
      : status;

  return (
    <section className="min-h-screen text-[#0B2545] dark:text-white w-full font-work pt-38 lg:pt-44 pb-20">
      <div className="max-w-[1600px] mx-auto space-y-4 w-full pt-4 ">
        <div className="p-4 md:p-6 space-y-6 border border-[#E3E7EE] dark:border-white/10 rounded-xl bg-white dark:bg-[#132436] w-full">
          <div className="space-y-6">
            {/* <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-12 md:font-14 font-semibold text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white cursor-pointer transition"
            >
              <MdArrowBack /> Back to Commissions
            </button> */}

            <div className="flex justify-between gap-4 flex-col sm:flex-row w-full pb-5 border-b-2 border-[#E3E7EE] dark:border-white/10">
              <div className="space-y-2">
                <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                  Commission Details
                </h1>
                <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
                  {detail?.asset?.title || 'N/A'} -{' '}
                  {detail?.referralUsesType || 'N/A'}
                </p>
              </div>

              <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#4F46E5]/10 to-[#2563EB]/5 border border-[#4F46E5]/15 space-y-1 shrink-0">
                <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
                  Commission Amount
                </p>
                <p className="font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                  ₹ {earnedAmount}{' '}
                  <span className="font-12 font-normal">INR</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              icon={<FiCheckCircle size={24} />}
              title="Earned Commission"
              subtitle="Confirmed"
              value={`₹${earnedAmount}`}
            />
            <SummaryCard
              icon={<FiDollarSign size={24} />}
              title="Estimated"
              subtitle="Investment Value"
              value={`₹${estimatedAmount}`}
            />
            <SummaryCard
              icon={<FiLock size={24} />}
              title="On Hold"
              subtitle="Pending Verification"
              value={`₹${holdAmount}`}
            />
          </div>

          <div className="flex justify-between items-center w-full rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] p-6">
            <p className="font-12 md:font-14 font-semibold text-gray-500 dark:text-gray-400">
              Release Status
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full font-12 font-semibold border ${
                displayStatus === 'Released'
                  ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
              }`}
            >
              {displayStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              title="Property Information"
              items={[
                ['Property Name', detail?.asset?.title || 'N/A'],
                ['Property ID', `AST-${detail?.asset?.id || 'N/A'}`],
                ['Location', 'Mumbai, India'],
                [
                  'Asset Type',
                  detail?.referralUsesType || 'Commercial Real Estate',
                ],
              ]}
            />

            <InfoCard
              title="Investor Information"
              items={[
                ['Investor Name', detail?.investor?.name || 'N/A'],
                ['Investor ID', `INV-${detail?.investor?.id || '2024-8393'}`],
                [
                  'Transaction Date',
                  detail?.createdAt
                    ? new Date(detail.createdAt).toLocaleDateString()
                    : 'N/A',
                ],
                ['Referral Code', detail?.referredCode || 'N/A'],
              ]}
            />
          </div>

          {/* Process Timeline - Optional or Static */}
          <div className="w-full hidden rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] p-6">
            <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-6">
              Process Timeline
            </h3>

            <div className="relative pl-14 sm:pl-20 space-y-10 sm:space-y-12">
              <TimelineRow
                status="completed"
                title="Commission Generated"
                badge="Completed"
                date={
                  detail?.createdAt
                    ? new Date(detail.createdAt).toLocaleDateString()
                    : 'N/A'
                }
              />

              <TimelineRow
                status={
                  status.toLowerCase() === 'confirmed'
                    ? 'completed'
                    : 'progress'
                }
                title="Verification"
                badge={
                  status.toLowerCase() === 'confirmed'
                    ? 'Completed'
                    : 'In Progress'
                }
                date="N/A"
              />

              <TimelineRow
                status={
                  status.toLowerCase() === 'confirmed' ? 'completed' : 'pending'
                }
                title="Released to Wallet"
                badge={
                  status.toLowerCase() === 'confirmed' ? 'Completed' : 'Pending'
                }
                date="N/A"
                isLast
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="w-full rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] p-6">
      <h4 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mb-6">
        {title}
      </h4>
      <div className="space-y-4">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col sm:flex-row justify-between w-full font-12"
          >
            <span className="text-gray-500 dark:text-gray-400">{k}</span>
            <span className="font-medium text-[#0B2545] dark:text-white">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({
  status,
  title,
  badge,
  date,
  note,
  isLast,
}: {
  status: 'completed' | 'progress' | 'pending';
  title: string;
  badge: string;
  date: string;
  note?: string;
  isLast?: boolean;
}) {
  const isCompleted = status === 'completed';

  return (
    <div
      className="
        relative flex flex-col sm:flex-row sm:justify-between
        gap-3 sm:gap-6
        animate-fadeSlide
      "
    >
      {!isLast && (
        <div
          className={`hidden sm:block absolute left-[-21px] top-7 h-[calc(100%+28px)] w-[2px]
            ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/20'}
          `}
        />
      )}

      <div className="absolute left-[-32px] top-1 z-30">
        {status === 'completed' && (
          <div className="h-6 w-6 bg-white dark:bg-[#132436] rounded-full border-2 border-green-500 flex items-center justify-center">
            <span className="text-green-500 text-xs">✓</span>
          </div>
        )}

        {status === 'progress' && (
          <div className="h-6 w-6 bg-white dark:bg-[#132436] rounded-full border-2 border-orange-500 flex items-center justify-center">
            <span className="text-orange-400 text-xs">⏳</span>
          </div>
        )}

        {status === 'pending' && (
          <div className="h-6 w-6 bg-white dark:bg-[#132436] rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-xs">!</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white">
            {title}
          </p>

          <span
            className={`px-3 py-0.5 rounded-full font-11 font-bold uppercase tracking-wide
              ${status === 'completed' && 'bg-green-500/20 text-green-400'}
              ${status === 'progress' && 'bg-orange-500/20 text-orange-400'}
              ${status === 'pending' && 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'}
            `}
          >
            {badge}
          </span>
        </div>

        {note && (
          <div className="rounded-md border border-[#E3E7EE] dark:border-white/10 px-3 py-2 font-12 text-gray-500 dark:text-gray-400">
            ⓘ {note}
          </div>
        )}

        <p className="sm:hidden font-12 text-gray-500 dark:text-gray-400">
          {date}
        </p>
      </div>

      <p className="hidden sm:block font-12 text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {date}
      </p>
    </div>
  );
}
