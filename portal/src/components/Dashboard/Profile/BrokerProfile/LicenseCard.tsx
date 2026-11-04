import { FiCheckCircle } from 'react-icons/fi';
import { BrokerProfileInput } from '.';
import type { User } from '@/types/userDashboard';

export default function LicenseCard({ user }: { user: User }) {
  const isVerified = user?.isVerified;
  const kycStatus = user?.kycStatus || (isVerified ? 'Approved' : 'Pending');

  return (
    <div className="p-6 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl">
      <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white mb-4 pb-4 border-b border-gray-150 dark:border-white/5">
        License & Verification
      </h3>

      {!user?.hasLicense ? (
        <div className="py-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
            The user has not added their license details yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BrokerProfileInput
            label="License Number"
            value={user.licenseNumber || '-'}
          />
          <BrokerProfileInput
            label="License Expiry"
            value={
              user.licenseExpiry
                ? new Intl.DateTimeFormat('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).format(new Date(user.licenseExpiry))
                : '-'
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 px-0.5">
            KYC Status
          </label>
          <div
            className={`mt-2 w-fit flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border
            ${
              kycStatus === 'Approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}
          >
            <FiCheckCircle
              className={
                kycStatus === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
              }
            />
            {kycStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
