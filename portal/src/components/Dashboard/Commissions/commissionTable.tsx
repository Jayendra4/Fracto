import { MdKeyboardArrowRight } from 'react-icons/md';
import StatusBadge from './statusbadge';
import { useNavigate } from 'react-router-dom';
import NoData from '@/components/Dashboard/NoData';
import { FiCheckCircle } from 'react-icons/fi';

interface Props {
  commissions: any[];
  loading?: boolean;
}

export default function CommissionTable({ commissions, loading }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-[var(--fg)]/60">
        Loading commissions...
      </div>
    );
  }

  if (!commissions.length) {
    return (
      <NoData
        title="No Commission Records"
        description="Try changing filters or search keywords. New commissions will appear here once someone signs up using your referral."
        icon={<FiCheckCircle size={32} />}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="min-w-[1200px] w-full font-16  [&_th]:px-4 [&_th]:py-4
    [&_td]:px-4 [&_td]:py-4"
      >
        <thead className="text-[var(--fg)]/70 border-b border-[var(--fg)]/10 text-left">
          <tr>
            <th className="text-left py-3">Asset</th>
            <th className="text-left">Investor</th>
            <th className="text-left">Amount</th>
            <th className="text-left">Status</th>
            <th className="text-left">Hold Reason</th>
            <th className="text-left">Release Date</th>
            <th className="text-left">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[var(--fg)]/5 text-left gap-2">
          {commissions.map((item) => {
            const rowStatus = (item.status || '').toLowerCase();
            const displayStatus =
              rowStatus === 'paid' || rowStatus === 'confirmed'
                ? 'Released'
                : rowStatus === 'pending'
                  ? 'Pending'
                  : 'On Hold';

            return (
              <tr key={item.commissionId} className="font-16 text-[var(--fg)]">
                <td>
                  <p className="font-16">{item.asset?.title || 'N/A'}</p>
                  <p className="font-14 text-[var(--fg)]/70">
                    Campaign: {item.campaignCode || 'N/A'}
                  </p>
                </td>

                <td>
                  <p>{item.investor?.name || 'N/A'}</p>
                  <p className="font-14 text-[var(--fg)]/70">
                    {item.investor?.email || 'N/A'}
                  </p>
                </td>

                <td>
                  ₹{Number(item.commissionAmount || 0).toLocaleString('en-IN')}
                </td>

                <td>
                  <StatusBadge
                    label={displayStatus}
                    success={displayStatus === 'Released'}
                    warning={displayStatus === 'Pending'}
                    danger={displayStatus === 'On Hold'}
                  />
                </td>

                <td className="font-14 text-red-400">{item.reason ?? '--'}</td>

                <td className="font-14 text-[var(--fg)]/80">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : 'N/A'}
                </td>

                <td className="text-right">
                  <button
                    className="group flex gap-1.5 items-center justify-end w-full text-[#73B7FF] hover:text-[var(--fg)]"
                    onClick={() => {
                      navigate(
                        `/dashboard/commissions/${item.commissionId}/status`
                      );
                    }}
                  >
                    View Details
                    <MdKeyboardArrowRight className="group-hover:translate-x-1 transition" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
