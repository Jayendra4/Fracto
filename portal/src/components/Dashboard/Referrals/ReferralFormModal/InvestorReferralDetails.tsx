import { FaUser } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';
import { TbMoneybag } from 'react-icons/tb';
import type { BrokerLead } from '@/api/brokerLeads.api';
import CommonModal from '@/components/CommonModal';
import { useActivities, type IActivity } from '@/api/activity.api';

export default function InvestorReferralDetails({
  referral,
  onClose,
}: {
  referral: BrokerLead;
  onClose: () => void;
}) {
  const user = referral?.user;
  const kyc = user?.kyc;
  const address = kyc?.address;

  // Fetch activities using the user id
  const { data: activitiesRes } = useActivities({
    accountId: user?.id || 0,
  });
  const activities =
    activitiesRes?.success === true ? (activitiesRes?.data?.data ?? []) : [];

  const getStatusBadgeStyles = (status: string | undefined) => {
    switch (status) {
      case 'Approved':
        return {
          backgroundColor: 'var(--status-success-bg)',
          color: 'var(--status-success-fg)',
        };
      case 'Rejected':
        return {
          backgroundColor: 'var(--status-error-bg)',
          color: 'var(--status-error-fg)',
        };
      default:
        return {
          backgroundColor: 'var(--status-warning-bg)',
          color: 'var(--status-warning-fg)',
        };
    }
  };

  if (!referral) return null;

  return (
    <CommonModal
      isOpen={!!referral}
      onClose={onClose}
      title={user?.name || 'Investor Details'}
      className="max-w-[800px] mx-auto [&>div>h2]:truncate [&>div>h2]:max-w-full"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-ui pr-1">
        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Code:</span>
            <span
              style={{ color: 'var(--primary-blue)' }}
              className="font-mono tracking-wider"
            >
              {referral.referralCode || 'N/A'}
            </span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full" />
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="font-semibold">First Used:</span>
            <span>{new Date(referral.firstUsedAt).toLocaleDateString()}</span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full" />
          <span
            className="rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-semibold"
            style={getStatusBadgeStyles(user?.kycStatus)}
          >
            {user?.kycStatus || 'Pending'}
          </span>
          <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded border border-[#E3E7EE] dark:border-white/10 font-mono tracking-tighter ml-auto">
            ID: {referral.id}
          </div>
        </div>

        {/* Investor Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <FaUser style={{ color: 'var(--primary-blue)' }} />
            Investor Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Full Name" value={user?.name} />
            <InfoCard label="Email" value={user?.email} />
            <InfoCard label="Contact" value={user?.mobile} />
            <InfoCard label="User Type" value={user?.type} />
            <InfoCard label="KYC Status" value={user?.kycStatus} />
            <InfoCard
              label="Location"
              value={address ? `${address.city}, ${address.state}` : 'N/A'}
            />
          </div>
        </section>

        {/* Rewards/Usage Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <TbMoneybag style={{ color: 'var(--primary-blue)' }} />
            Referral Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E3E7EE] dark:border-white/10 p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[#0B2545] dark:text-white font-semibold mb-1">
                  Usage Count
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                  Total times referral used
                </p>
              </div>
              <div
                className="text-28 font-bold"
                style={{ color: 'var(--primary-blue)' }}
              >
                {referral.usageCount || 0}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E3E7EE] dark:border-white/10 p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[#0B2545] dark:text-white font-semibold mb-1">
                  Reward Limit
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                  Maximum rewards allowed
                </p>
              </div>
              <div
                className="text-28 font-bold"
                style={{ color: 'var(--primary-green)' }}
              >
                {referral.rewardLimit || 0}
              </div>
            </div>
          </div>
        </section>

        {/* Activity History */}
        <section className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-[#E3E7EE] dark:border-white/10">
          <h3 className="flex items-center gap-2 mb-4 font-16 font-bold text-[#0B2545] dark:text-white">
            <FiRefreshCcw style={{ color: 'var(--primary-blue)' }} />
            Activity Timeline
          </h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                {activities.map((item: IActivity, index: number) => (
                  <li key={item.id} className="flex gap-4 items-start">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor:
                          index === 0
                            ? 'var(--primary-green)'
                            : 'var(--primary-blue)',
                      }}
                    />
                    <div>
                      <p className="font-semibold text-[#0B2545] dark:text-white">
                        {item.label || item.metadata?.message || item.type}
                      </p>
                      <p className="text-xs">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No activities found.
              </p>
            )}
          </div>
        </section>
      </div>
    </CommonModal>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-[#E3E7EE] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">
        {label}
      </p>
      <p className="font-16 text-[#0B2545] dark:text-white font-semibold truncate">
        {value || 'N/A'}
      </p>
    </div>
  );
}
