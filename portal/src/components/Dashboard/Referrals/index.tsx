import { useState, useRef, useEffect } from 'react';
// import { CiShare2 } from 'react-icons/ci';
import { FiCheck, FiCopy, FiShare2, FiMail } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import ReferalFormModal from './ReferralFormModal';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  useBrokerInviteOwners,
  type InviteOwner,
} from '@/api/brokerInviteOwners.api';
import KycGate from '@/components/KycGate';

import ReferralAssetDetails from './ReferralFormModal/ReferralAssetDetails';
import InvestorReferralDetails from './ReferralFormModal/InvestorReferralDetails';
import { motion } from 'framer-motion';
import { useBrokerLeads, type BrokerLead } from '@/api/brokerLeads.api';
import Loader from '@/components/Loader';
import NoData from '@/components/Dashboard/NoData';
import { FiUsers, FiHome } from 'react-icons/fi';
import { useProfile } from '@/api';

type Referral = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  sentDate: string;
  activities: {
    id: string;
    title: string;
    timestamp: string;
  }[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Referrals() {
  const [activeTab, setActiveTab] = useState<'investor' | 'asset'>('asset');
  const [openId, setOpenId] = useState<string | null>('1');
  const [openReferralModal, setOpenReferralModal] = useState(false);
  const brokerId = useSelector((s: RootState) => s.authLogin.user?.id);
  const authToken = useSelector((s: RootState) => s.authLogin.token);
  const userReferralCode = useSelector(
    (s: RootState) => s.authLogin.user?.referralCode
  );
  // The cached redux/localStorage user can be stale (set from the login
  // response rather than the full profile) — fetch /accounts/me directly
  // as a fallback so the referral code reliably shows up.
  const { data: profileRes } = useProfile(authToken || undefined, {
    enabled: !userReferralCode,
  });
  const brokerReferralCode =
    userReferralCode ||
    (profileRes?.success ? profileRes.data?.referralCode : undefined);

  const TAKE = 10;
  const [page, setPage] = useState(0);

  const { data: inviteRes, isLoading: isAssetLoading } = useBrokerInviteOwners(
    {
      skip: page * TAKE,
      take: TAKE,
      brokerId: brokerId as number,
    },
    {
      enabled: !!brokerId && activeTab === 'asset',
    }
  );

  const { data: leadsRes, isLoading: isInvestorLoading } = useBrokerLeads({
    skip: page * TAKE,
    take: TAKE,
    type: 'InvestorSignup',
    brokerId: brokerId as number,
  });

  const isLoading = activeTab === 'asset' ? isAssetLoading : isInvestorLoading;

  const invitePayload = inviteRes?.success === true ? inviteRes.data : null;
  const leadsPayload = leadsRes?.success === true ? leadsRes.data : null;

  const invites = invitePayload?.data ?? [];
  const leads = leadsPayload?.data ?? [];

  const totalCount =
    activeTab === 'asset'
      ? (invitePayload?.count ?? 0)
      : (leadsPayload?.count ?? 0);

  return (
    <section className="w-full text-[#0B2545] dark:text-white font-work pt-36 xl:pt-40 pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 lg:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full pt-4">
            <KycGate message="Lead management is available only after KYC approval.">
              <div className="p-4 md:p-6 space-y-6 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl w-full">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between gap-2 flex-col sm:flex-row w-full pb-5 border-b-2 border-[#E3E7EE] dark:border-white/10"
                >
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between md:pb-0">
                      <h2 className="font-serif font-24 md:font-36 font-semibold text-[#0B2545] dark:text-white">
                        Referrals
                      </h2>
                    </div>
                    <p className="font-16 text-center sm:text-left text-gray-500 dark:text-gray-400">
                      Track and manage your referral network.
                    </p>
                  </div>
                  {activeTab === 'investor' && (
                    <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto shrink-0">
                      <span className="font-12 text-gray-500 dark:text-gray-400">
                        Your Referral Code:{' '}
                        <span className="font-semibold text-[#0B2545] dark:text-white">
                          {brokerReferralCode || 'Loading…'}
                        </span>
                      </span>
                      {brokerReferralCode && (
                        <ShareMenu
                          signupUrl={`${window.location.origin}/signup?ref=${brokerReferralCode}&type=investor`}
                          shareMessage={`Join Fracto and start investing using my referral link:\n\n${window.location.origin}/signup?ref=${brokerReferralCode}&type=investor`}
                          emailSubject="Join Fracto and start investing"
                          label="Share Investor Referral"
                          variant="button"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="flex bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-full p-1 shadow-sm w-full md:w-fit"
                >
                  <button
                    onClick={() => {
                      setActiveTab('asset');
                      setPage(0);
                    }}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer
                      ${
                        activeTab === 'asset'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                      }`}
                  >
                    Asset Owner Referrals
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('investor');
                      setPage(0);
                    }}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer
                      ${
                        activeTab === 'investor'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                      }`}
                  >
                    Investor Referrals
                  </button>
                </motion.div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="py-20">
                      <Loader isFullPage={false} />
                    </div>
                  ) : activeTab === 'investor' ? (
                    leads.length === 0 ? (
                      <NoData
                        title="No Investor Referrals"
                        description="You haven't referred any Investor yet. Start building your network today."
                        icon={<FiUsers size={32} />}
                      />
                    ) : (
                      leads.map((item: BrokerLead) => (
                        <div key={item.id}>
                          <ReferralCard
                            referral={{
                              id: String(item.id),
                              name: item.user.name,
                              email: item.user.email,
                              referralCode:
                                item.referredCode ?? item.referralCode,
                              sentDate: item.firstUsedAt,
                              activities: [
                                {
                                  id: '1',
                                  title: `Investor KYC: ${item.user.kycStatus}`,
                                  timestamp: new Date(
                                    item.updatedAt
                                  ).toLocaleString(),
                                },
                              ],
                            }}
                            investorData={item}
                            isOpen={openId === String(item.id)}
                            onToggle={() =>
                              setOpenId(
                                openId === String(item.id)
                                  ? null
                                  : String(item.id)
                              )
                            }
                          />
                        </div>
                      ))
                    )
                  ) : invites.length === 0 ? (
                    <NoData
                      title="No Asset Owner Referrals"
                      description="Invite asset owners to onboard their properties and earn commissions."
                      icon={<FiHome size={32} />}
                    />
                  ) : (
                    invites.map((item: InviteOwner) => (
                      <div key={item.id}>
                        <ReferralCard
                          referral={{
                            id: String(item.id),
                            name: item.propertyDetails.assetTitle,
                            email: item.assetOwnerEmail,
                            referralCode: item.campaign.code,
                            sentDate: item.createdAt,
                            activities: [
                              {
                                id: '1',
                                title: `Asset Owner ${item.assetOwnerStatus}`,
                                timestamp: new Date(
                                  item.createdAt
                                ).toLocaleString(),
                              },
                              {
                                id: '2',
                                title: `Admin Status: ${item.adminStatus}`,
                                timestamp: new Date(
                                  item.createdAt
                                ).toLocaleString(),
                              },
                            ],
                          }}
                          fullData={item}
                          isOpen={openId === String(item.id)}
                          onToggle={() =>
                            setOpenId(
                              openId === String(item.id)
                                ? null
                                : String(item.id)
                            )
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-center items-center gap-6 mt-6 text-sm">
                  <button
                    disabled={
                      page === 0 ||
                      isLoading ||
                      (activeTab === 'asset' && invites.length === 0)
                    }
                    onClick={() => setPage((p) => p - 1)}
                    className="text-[#0B2545] dark:text-white hover:text-[#1F4FE0] dark:hover:text-[#60a5fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    ‹ Previous
                  </button>

                  <span className="text-gray-500 dark:text-gray-400">
                    Page {page + 1} of{' '}
                    {Math.max(1, Math.ceil(totalCount / TAKE))}
                  </span>

                  <button
                    disabled={isLoading || (page + 1) * TAKE >= totalCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="text-[#0B2545] dark:text-white hover:text-[#1F4FE0] dark:hover:text-[#60a5fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </KycGate>

            <>
              {openReferralModal && (
                <ReferalFormModal onClose={() => setOpenReferralModal(false)} />
              )}
            </>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ShareMenu({
  signupUrl,
  shareMessage,
  emailSubject,
  label = 'Share',
  variant = 'link',
}: {
  signupUrl: string;
  shareMessage: string;
  emailSubject: string;
  label?: string;
  variant?: 'link' | 'button';
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const shareChannels = [
    {
      label: 'WhatsApp',
      icon: <FaWhatsapp className="text-green-500" size={16} />,
      href: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      label: 'Telegram',
      icon: <FaTelegramPlane className="text-[#229ED9]" size={16} />,
      href: `https://t.me/share/url?url=${encodeURIComponent(signupUrl)}&text=${encodeURIComponent(shareMessage)}`,
    },
    {
      label: 'Facebook',
      icon: <FaFacebook className="text-[#1877F2]" size={16} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(signupUrl)}`,
    },
    {
      label: 'X (Twitter)',
      icon: <FaXTwitter className="text-[#0B2545] dark:text-white" size={16} />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      label: 'Email',
      icon: <FiMail className="text-gray-500 dark:text-gray-400" size={16} />,
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareMessage)}`,
    },
  ];

  return (
    <div ref={shareRef} className="relative">
      <button
        onClick={() => setShareOpen((p) => !p)}
        className={
          variant === 'button'
            ? 'flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white text-sm font-semibold shadow-md hover:opacity-90 transition cursor-pointer whitespace-nowrap'
            : 'flex items-center gap-1.5 text-[#4F46E5] dark:text-[#73B7FF] text-sm hover:underline cursor-pointer'
        }
        title="Share referral link"
      >
        <FiShare2 size={16} /> {label}
      </button>

      {shareOpen && (
        <div className="absolute right-0 top-7 z-30 w-48 rounded-lg bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-xl text-sm overflow-hidden">
          {shareChannels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="w-full px-3 py-2 flex items-center gap-2 text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {channel.icon}
              {channel.label}
            </a>
          ))}
          <button
            onClick={copyShareLink}
            className="w-full px-3 py-2 flex items-center gap-2 text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
          >
            {linkCopied ? (
              <FiCheck size={16} className="text-green-500" />
            ) : (
              <FiCopy size={16} className="text-gray-500 dark:text-gray-400" />
            )}
            {linkCopied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

function ReferralCard({
  referral,
  fullData,
  investorData,
  isOpen,
  onToggle,
}: {
  referral: Referral;
  fullData?: InviteOwner;
  investorData?: BrokerLead;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const signupUrl = `${window.location.origin}/signup?ref=${referral.referralCode}&type=asset_owner`;
  const ownerName = fullData?.assetOwnerDetails?.firstName
    ? `${fullData.assetOwnerDetails.firstName} ${fullData.assetOwnerDetails.lastName ?? ''}`.trim()
    : 'there';
  const shareMessage = `Hi ${ownerName}, list your property "${referral.name}" on Fracto using my referral link:\n\n${signupUrl}`;
  const emailSubject = `List your property "${referral.name}" on Fracto`;

  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center p-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex flex-row gap-4 items-center">
            <h3 className="font-20 text-[#0B2545] dark:text-white font-semibold">
              {referral.name}
            </h3>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <p className="font-14 text-gray-500 dark:text-gray-400 mt-1">
                Code: {referral.referralCode}
              </p>

              <button
                onClick={copyReferral}
                className="text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white transition cursor-pointer"
                title="Copy Referrral Code"
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              </button>
            </div>
            {copied && (
              <div
                className="absolute top-0 mt-2 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0
                bg-black/80 text-white text-sm px-3 py-1 rounded-md shadow-lg animate-fade-in"
              >
                Referrral copied!
              </div>
            )}
          </div>
          <p className="font-14 text-gray-500 dark:text-gray-400 line-clamp-1">
            {referral.email}
          </p>
          <div>
            <p className="font-14 text-gray-500 dark:text-gray-400">
              Sent: {new Date(referral.sentDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 mt-1 sm:mt-0">
          {fullData && (
            <ShareMenu
              signupUrl={signupUrl}
              shareMessage={shareMessage}
              emailSubject={emailSubject}
            />
          )}
          <button
            onClick={() => setOpenDetails(true)}
            className="text-[#4F46E5] dark:text-[#73B7FF] text-sm hover:underline cursor-pointer"
          >
            View Details
          </button>
          {openDetails && fullData && (
            <ReferralAssetDetails
              referral={fullData}
              onClose={() => setOpenDetails(false)}
            />
          )}
          {openDetails && investorData && (
            <InvestorReferralDetails
              referral={investorData}
              onClose={() => setOpenDetails(false)}
            />
          )}
          <button
            onClick={onToggle}
            className="text-[#4F46E5] dark:text-[#73B7FF] text-sm hover:underline cursor-pointer"
          >
            {isOpen ? 'Hide Activity' : 'Show Activity'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="bg-white dark:bg-[#0d1a27] rounded-lg p-4">
            <h4 className="font-16 font-medium mb-4 border-b-2 border-[#E3E7EE] dark:border-white/10 pb-4 text-[#0B2545] dark:text-white">
              Activity Timeline
            </h4>

            {referral.activities.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No activity yet
              </p>
            ) : (
              <div className="">
                {referral.activities.map((activity, index: number) => (
                  <TimelineItem
                    key={activity.id}
                    {...activity}
                    isLast={index === referral.activities.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TimelineItem({
  title,
  timestamp,
  isLast,
}: {
  title: string;
  timestamp: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className="h-6 w-6 p-1 bg-green/12 rounded-full flex items-center justify-center shrink-0">
          <div className="rounded-full h-3 w-3  bg-green shrink-0" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-green" />}
      </div>
      <div className="pb-8 space-y-2">
        <p className="font-16 font-semibold text-[#0B2545] dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
      </div>
    </div>
  );
}
