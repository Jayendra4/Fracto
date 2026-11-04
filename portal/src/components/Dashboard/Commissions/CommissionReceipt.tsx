import { MdDownload, MdShare } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useCommissionDetail } from '@/api/brokerCommission.api';
import SummaryCard from './summaryCard';
import { FiCheckCircle, FiDollarSign, FiLock } from 'react-icons/fi';
import Loader from '@/components/Loader';

export default function CommissionReceipt() {
  // const navigate = useNavigate();
  const { ledgerId } = useParams();
  const { data: detailRes, isLoading } = useCommissionDetail(ledgerId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader />
      </div>
    );
  }

  const detail = detailRes?.success ? detailRes.data : null;

  const earnedAmount = detail?.commissionAmount
    ? Number(detail.commissionAmount).toLocaleString('en-IN')
    : '0';
  const estimatedAmount = detail?.baseAmount
    ? Number(detail.baseAmount).toLocaleString('en-IN')
    : '0';

  return (
    <section className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-work pt-38 lg:pt-44 pb-20">
      <div className="max-w-[1600px] mx-auto space-y-4 w-full pt-4 ">
        <div className="p-4 md:p-6 space-y-6 border-2 border-white/10 rounded-xl bg-[var(--inner-card)] w-full">
          <div className="space-y-6">
            {/* <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-20 font-medium leading-[100%] tracking-[0%] text-[var(--fg)]/60 cursor-pointer"
            >
              <MdArrowBack /> Back to Commissions
            </button> */}

            <div className="flex items-center justify-between gap-2 flex-col sm:flex-row w-full pb-5 border-b-2 border-[var(--fg)]/10">
              <div className="space-y-2">
                <h1 className="font-32 font-medium leading-[100%] tracking-[0%]">
                  Commission Receipt
                </h1>
                <p className="font-20 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
                  {detail?.asset?.title || 'N/A'} -{' '}
                  {detail?.referralUsesType || 'N/A'}
                </p>
              </div>

              <div className="text-right space-y-2">
                <p className="font-20 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
                  Commission Amount
                </p>
                <p className="font-36 leading-[100%] tracking-[0%] font-semibold">
                  ₹ {earnedAmount}{' '}
                  <span className="text-sm font-normal">INR</span>
                </p>
              </div>
            </div>
          </div>

          {/* 3 Summary Cards */}
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
              value={`₹0`} // Static for now as per user request
            />
          </div>

          <div className="flex flex-col gap-6 w-full rounded-xl border border-white/10 bg-[var(--card)]/100 p-6">
            <h2 className="font-20 font-normal leading-[100%] tracking-[0%]">
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Detail
                label="Asset Name"
                value={detail?.asset?.title || 'N/A'}
              />
              <Detail
                label="Asset ID"
                value={`AST-${detail?.asset?.id || 'N/A'}`}
              />
              <Detail label="Type" value={detail?.referralUsesType || 'N/A'} />
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full rounded-xl border border-white/10 bg-[var(--card)]/100 p-6">
            <h2 className="font-20 font-normal leading-[100%] tracking-[0%]">
              Investor Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Detail
                label="Investor Name"
                value={detail?.investor?.name || 'N/A'}
              />
              <Detail
                label="Investor ID"
                value={`INV-${detail?.investor?.id || '2024-3891'}`}
              />
              <Detail label="Wallet Address" value="ex742d...3f8e" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="w-full flex flex-col gap-4 rounded-xl border border-white/10 bg-[var(--card)]/100 p-6">
              <p className="font-18 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
                Created On
              </p>
              <p className="font-20 font-medium leading-[100%] tracking-[0%]">
                {detail?.createdAt
                  ? new Date(detail.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className="w-full flex flex-col gap-4 rounded-xl border border-white/10 bg-[var(--card)]/100 p-6">
              <p className="font-18 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
                Payout Method
              </p>
              <p className="font-20 font-medium leading-[100%] tracking-[0%]">
                Wallet
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4 rounded-xl border border-white/10 bg-[var(--card)]/100 p-6">
            <p className="font-18 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
              Transaction ID
            </p>
            <p className="font-20 font-medium leading-[100%] tracking-[0%] break-all">
              {detail?.transactionId ||
                '0xf8e9c2d4a1b5e7f3c6d8a9b2e4f7c15a8b3e6f9'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button className="flex w-full items-center cursor-pointer justify-center gap-2 bg-white text-black rounded-md px-6 py-3 font-medium">
              <MdDownload /> Download PDF
            </button>

            <button className="flex w-full cursor-pointer items-center justify-center gap-2 bg-transparent border border-white/20 rounded-md px-6 py-3 font-medium">
              <MdShare /> Share Receipt
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-18 font-normal leading-[100%] tracking-[0%] text-[var(--fg)]/60">
        {label}
      </p>
      <p className="font-20 font-medium leading-[100%] tracking-[0%]">
        {value}
      </p>
    </div>
  );
}
