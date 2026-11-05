import CommonModal from '@/components/CommonModal';
import ImageWithFallback from '@/components/Common/ImageWithFallback';
import { FiCopy, FiCheck, FiCamera, FiCheckCircle } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
import { useState, useEffect } from 'react';
import { COUNTRY_FLAG, splitCamelCase } from '@/types/userDashboard';
import type { User } from '@/types/userDashboard';
import ChangePasswordModal from './chnagePassword/ChangePasswordModal';
import ProfilePictureModal from './ProfilePictureModal';
import { useOnboarding } from '@/hooks';

interface Props {
  user: User | null;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}

export default function ProfileHeader({
  user,
  isEditing,
  setIsEditing,
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referredCode, setReferredCode] = useState('');

  const [openProfilePicture, setOpenProfilePicture] = useState(false);
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const code = user?.referredCode || localStorage.getItem('referredCode');
    if (code) setReferredCode(code);
  }, [user]);

  const handleConnect = () => {
    if (!connectCode) return;
    setConnecting(true);
    setTimeout(() => {
      localStorage.setItem('referredCode', connectCode);

      const localUserRaw = localStorage.getItem('hof_user');
      if (localUserRaw) {
        try {
          const localUser = JSON.parse(localUserRaw);
          localUser.referredCode = connectCode;
          localStorage.setItem('hof_user', JSON.stringify(localUser));
        } catch (e) {
          console.error('Error updating local user with referredCode', e);
        }
      }

      setReferredCode(connectCode);
      setConnecting(false);
      setOpenConnectModal(false);
      setConnectCode('');
    }, 1000);
  };

  const copyEmail = async () => {
    try {
      if (!user?.email) return;
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const { isApproved, isRejected, isSubmitted, isUnderReview, isCompany } =
    useOnboarding();

  const profilePhotoUrl = user?.profileImage ?? '';
  const initials = (user?.firstname?.[0] || '') + (user?.lastname?.[0] || '');

  return (
    <div className="relative rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 items-center">
      <div className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none" />

      <div className="relative shrink-0 group">
        <div
          className={`h-24 w-24 rounded-full ${isApproved ? 'bg-[#33BD56]' : isRejected ? 'bg-[#EF4444]' : isSubmitted || isUnderReview ? 'bg-[#F59E0B]' : 'bg-slate-300'} p-[3px] shadow-lg relative`}
        >
          <div className="h-full w-full rounded-full bg-white dark:bg-[#132436] flex items-center justify-center overflow-hidden">
            {profilePhotoUrl ? (
              <ImageWithFallback
                src={profilePhotoUrl}
                className="h-full w-full object-cover"
                fallbackText={initials}
              />
            ) : (
              <span className="text-2xl font-semibold tracking-wide">
                {initials || '?'}
              </span>
            )}
          </div>

          <div
            className={`
              absolute inset-0 rounded-full
              bg-black/40 backdrop-blur-[1px]
              flex items-center justify-center gap-3
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              cursor-pointer
            `}
            onClick={() => setOpenProfilePicture(true)}
          >
            <div
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20
                   flex items-center justify-center text-white transition"
            >
              <FiCamera size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left relative">
        <div className="flex md:flex-row justify-between md:justify-start gap-3">
          <h2 className="font-28 font-semibold tracking-wide text-[#0B2545] dark:text-white whitespace-nowrap">
            {user?.firstname} {user?.lastname}{' '}
            {user?.countryId && (
              <span className="text-lg">{COUNTRY_FLAG[user.countryId]}</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`relative px-4 my-2 rounded-full flex items-center justify-center gap-1 text-[12px] h-6 ${isApproved ? 'bg-[#33BD56] text-white' : isRejected ? 'bg-[#EF4444] text-white' : isSubmitted || isUnderReview ? 'bg-[#F59E0B] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}
            >
              {isApproved ? (
                <FiCheckCircle className="text-white" size={12} />
              ) : isRejected ? (
                <RxCross2 className="text-white" size={12} />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {isApproved
                ? 'Verified'
                : isRejected
                  ? 'Rejected'
                  : isSubmitted || isUnderReview
                    ? 'Under Review'
                    : 'Unverified'}
            </span>

            {isCompany && (
              <span
                className={`px-3 py-1 rounded-full text-[12px] border ${user?.kybStatus?.toLowerCase() === 'approved' ? 'bg-[#33BD56]/10 border-[#33BD56]/20 text-[#33BD56]' : user?.kybStatus?.toLowerCase() === 'rejected' ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'}`}
              >
                KYB: {user?.kybStatus || 'Draft'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-start gap-4 mt-1">
          <p className="text-gray-500 dark:text-gray-400 font-16 whitespace-nowrap">
            {user?.email}
          </p>

          <button
            onClick={copyEmail}
            className="text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white transition"
            title="Copy email"
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          </button>
        </div>
        {copied && (
          <div
            className="absolute top-0 mt-2 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0
      bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white text-sm px-3 py-1 rounded-md shadow-lg animate-fade-in"
          >
            Email copied
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[14px] bg-gray-100 dark:bg-white/10 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white whitespace-nowrap">
            {splitCamelCase(user?.type)}
          </span>

          {referredCode ? (
            <div className="flex items-center gap-2 bg-[#73B7FF]/10 px-3 py-1 rounded-full border border-[#73B7FF]/20">
              <span className="text-[12px] text-[#73B7FF] font-medium">
                Referred By:
              </span>
              <span className="text-[13px] font-bold text-[#0B2545] dark:text-white">
                {referredCode}
              </span>
            </div>
          ) : (
            <div className="flex hidden items-center gap-2">
              <button
                onClick={() => setOpenConnectModal(true)}
                className="text-[13px] text-[#73B7FF] hover:underline font-medium"
              >
                Connect with Channel Partner
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col  gap-2 sm:gap-4 sm:w-auto">
        <button
          onClick={() => {
            if (isEditing) {
              // Trigger save in ProfileDetails
              document.getElementById('profile-save-btn')?.click();
            } else {
              setIsEditing(true);
            }
          }}
          className="
            w-full sm:w-auto whitespace-nowrap
            inline-flex items-center justify-center
            px-6 py-2.5
            rounded-xl
            font-16 font-semibold
            text-white
            bg-gradient-to-r from-[#4F46E5] to-[#2563EB]
            transition-all duration-300
            hover:shadow-lg hover:shadow-blue-500/20 hover:brightness-110
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/60"
        >
          {isEditing ? 'Update' : 'Update Profile'}
        </button>
        <button
          onClick={() => setOpen(true)}
          className="
            w-full sm:w-auto whitespace-nowrap
            inline-flex items-center justify-center
            px-6 py-2.5
            rounded-xl
            font-16 font-semibold
            text-[#0B2545] dark:text-white
            border border-[#E3E7EE] dark:border-white/10
            bg-gray-50 dark:bg-white/5
            transition-all duration-300
            hover:bg-gray-100 dark:hover:bg-white/10
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20"
        >
          Change Password
        </button>
      </div>
      <ChangePasswordModal open={open} onClose={() => setOpen(false)} />
      <ProfilePictureModal
        isOpen={openProfilePicture}
        onClose={() => setOpenProfilePicture(false)}
        currentImage={profilePhotoUrl}
        initials={initials}
      />

      <CommonModal
        isOpen={openConnectModal}
        onClose={() => setOpenConnectModal(false)}
        title="Connect with Channel Partner"
        className="max-w-[500px] mx-auto"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Enter the referral code provided by your Channel Partner to link
            your account and access exclusive benefits.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Referral Code
            </label>
            <input
              type="text"
              value={connectCode}
              onChange={(e) => setConnectCode(e.target.value)}
              placeholder="e.g. BRK12345"
              className="w-full bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-xl px-4 py-3 text-[#0B2545] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#73B7FF]/50 transition"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={!connectCode || connecting}
            className="w-full bg-gradient-to-r from-[#2A5A8D] to-[#4F86C0] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-blue-500/20 transition disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Now'}
          </button>
        </div>
      </CommonModal>
    </div>
  );
}
