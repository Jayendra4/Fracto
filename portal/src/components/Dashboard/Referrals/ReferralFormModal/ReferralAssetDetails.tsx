import { FaUser } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { FiBarChart, FiRefreshCcw } from 'react-icons/fi';
import { MdOutlineImageSearch } from 'react-icons/md';
import { TbMoneybag } from 'react-icons/tb';
import type { InviteOwner } from '@/api/brokerInviteOwners.api';
import CommonModal from '@/components/CommonModal';

export default function ReferralAssetDetails({
  referral,
  onClose,
}: {
  referral: InviteOwner;
  onClose: () => void;
}) {
  const propertyDetails = referral?.propertyDetails;
  const campaign = referral?.campaign;

  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'N/A';
    const num = parseInt(value, 10);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatArea = (value: string | undefined) => {
    if (!value) return 'N/A';
    const num = parseInt(value, 10);
    if (isNaN(num)) return value;
    return `${num.toLocaleString('en-IN')} sq. ft.`;
  };

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
      title={propertyDetails?.assetTitle || 'Unnamed Asset'}
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
              {campaign?.code || 'N/A'}
            </span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full" />
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Sent:</span>
            <span>{new Date(referral.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full" />
          <span
            className="rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-semibold"
            style={getStatusBadgeStyles(referral.assetOwnerStatus)}
          >
            {referral.assetOwnerStatus || 'Pending'}
          </span>
          <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded border border-[#E3E7EE] dark:border-white/10 font-mono tracking-tighter ml-auto">
            ID: {referral.id}
          </div>
        </div>

        {/* Asset Owner Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <FaUser style={{ color: 'var(--primary-blue)' }} />
            Asset Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="First Name"
              value={referral.assetOwnerDetails?.firstName}
            />
            <InfoCard
              label="Last Name"
              value={referral.assetOwnerDetails?.lastName}
            />
            <InfoCard
              label="Contact"
              value={referral.assetOwnerDetails?.mobile}
            />
            <InfoCard label="Email" value={referral.assetOwnerEmail} />
            <InfoCard label="Owner Status" value={referral.assetOwnerStatus} />
            <InfoCard label="Admin Status" value={referral.adminStatus} />
            <InfoCard
              label="Onboarding Active"
              value={referral.isAssetOnBording ? 'Yes' : 'No'}
            />
          </div>
        </section>

        {/* Commission Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <TbMoneybag style={{ color: 'var(--primary-blue)' }} />
            Commission Details
          </h3>
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E3E7EE] dark:border-white/10 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[#0B2545] dark:text-white font-semibold mb-1">
                Proposed Commission
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                Final rate subject to platform approval
              </p>
            </div>
            <div
              className="text-28 font-bold"
              style={{ color: 'var(--primary-green)' }}
            >
              {referral.proposedCommissionPct}%
            </div>
          </div>
        </section>

        {/* Asset Details Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <MdOutlineImageSearch style={{ color: 'var(--primary-blue)' }} />
            Asset view
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Asset Type" value={propertyDetails?.assetType} />
            <InfoCard
              label="Ownership Model"
              value={propertyDetails?.ownershipModel}
            />
            <InfoCard
              label="Market Value"
              value={formatCurrency(propertyDetails?.marketValue)}
            />
          </div>
        </section>

        {/* Location Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <FaLocationDot style={{ color: 'var(--primary-blue)' }} />
            Asset Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label="City" value={propertyDetails?.city} />
            <InfoCard label="State" value={propertyDetails?.state} />
            <InfoCard label="Pincode" value={propertyDetails?.pincode} />
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded border border-[#E3E7EE] dark:border-white/10 italic text-gray-500 dark:text-gray-400 text-sm">
            Full address: {propertyDetails?.city}, {propertyDetails?.state},{' '}
            {propertyDetails?.country} - {propertyDetails?.pincode}
          </div>
        </section>

        {/* Size Section */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
            <FiBarChart style={{ color: 'var(--primary-blue)' }} />
            Size & Valuation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Land Area"
              value={formatArea(propertyDetails?.landArea)}
            />
            <InfoCard
              label="Built-up Area"
              value={formatArea(propertyDetails?.builtupArea)}
            />
          </div>
        </section>

        {referral.brokerNote && (
          <section>
            <h3 className="flex items-center gap-2 mb-4 font-18 font-semibold text-[#0B2545] dark:text-white border-b border-[#E3E7EE] dark:border-white/10 pb-2">
              <FiRefreshCcw style={{ color: 'var(--primary-blue)' }} />
              Channel Partner Note
            </h3>
            <div
              className="p-4 rounded-lg border leading-relaxed shadow-sm"
              style={{
                backgroundColor: 'var(--status-warning-bg)',
                color: 'var(--status-warning-fg)',
                borderColor: 'rgba(234, 179, 8, 0.2)',
              }}
            >
              {referral.brokerNote}
            </div>
          </section>
        )}

        {/* Activity History */}
        <section className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-[#E3E7EE] dark:border-white/10">
          <h3 className="flex items-center gap-2 mb-4 font-16 font-bold text-[#0B2545] dark:text-white">
            <FiRefreshCcw style={{ color: 'var(--primary-blue)' }} />
            Referral Activity History
          </h3>
          <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex gap-4 items-start">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: 'var(--primary-green)' }}
              />
              <div>
                <p className="font-semibold text-[#0B2545] dark:text-white">
                  Referral Created
                </p>
                <p className="text-xs">
                  {new Date(referral.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              />
              <div>
                <p className="font-semibold text-[#0B2545] dark:text-white">
                  Invitation Sent
                </p>
                <p className="text-xs">
                  Sent to: <u>{referral.assetOwnerEmail}</u>
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: 'var(--status-warning-fg)' }}
              />
              <div>
                <p className="font-semibold text-[#0B2545] dark:text-white">
                  Status Update
                </p>
                <p className="text-xs">
                  Current: <b>{referral.assetOwnerStatus}</b> (Admin:{' '}
                  {referral.adminStatus})
                </p>
              </div>
            </li>
          </ul>
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
