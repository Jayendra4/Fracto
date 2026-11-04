import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import type { RootState } from '@/redux/store';
import {
  // FiArrowLeft, -- was used by the now-hidden inline back button
  // FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
} from 'react-icons/fi';
import { useAssetById, type IAssetDetailMeta } from '@/api/rwa.api';
import {
  // useAcceptNda,
  // useCastVote,
  // useClubMembershipStatus,
  usePaidMembers,
  // type VoteChoice,
} from '@/api/group.api';
// import { useSpvById } from '@/api/spv.api';
import ImageGallery from '@/components/Property/ImageGallery';
import StatusModal from '@/components/Modals/Status';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getMetaValue(meta: IAssetDetailMeta[] | undefined, key: string) {
  return meta?.find((m) => m.metaKey === key)?.metaValue ?? '';
}

// function formatVoteDate(d?: string | null) {
//   if (!d) return '';
//   return new Date(d).toLocaleString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     timeZone: 'UTC',
//   });
// }

function getDocUrl(rawUrl: string) {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_BASE_URL}/storage/${rawUrl}`;
}

function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-[var(--inner-card)] border border-[var(--fg)]/5 rounded-2xl p-5 md:p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">{title}</h2>
      )}
      {children}
    </motion.div>
  );
}

// function StepBadge({
//   label,
//   tone,
// }: {
//   label: string;
//   tone: 'pending' | 'done' | 'rejected';
// }) {
//   return (
//     <motion.span
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
//         tone === 'done'
//           ? 'bg-green/10 text-green'
//           : tone === 'rejected'
//             ? 'bg-red-500/10 text-red-500'
//             : 'bg-[#F5A623]/10 text-[#F5A623]'
//       }`}
//     >
//       {label}
//     </motion.span>
//   );
// }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--fg)]/5 last:border-0">
      <span className="text-[var(--fg)]/50 text-sm">{label}</span>
      <span className="text-[var(--fg)] text-sm font-medium">
        {value || '-'}
      </span>
    </div>
  );
}

export default function SecondaryClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  // const [ndaChecked, setNdaChecked] = useState(false);
  // const [termsChecked, setTermsChecked] = useState(false);

  const { data: assetRes, isLoading } = useAssetById(id);
  const asset = assetRes?.success ? assetRes.data : undefined;

  // const currentUser = useSelector((state: RootState) => state.authLogin.user);
  // const isAssetOwner =
  //   !!currentUser?.id &&
  //   !!asset?.accountId &&
  //   currentUser.id === asset.accountId;

  const PAID_MEMBERS_TAKE = 10;
  const [paidMembersPage, setPaidMembersPage] = useState(1);
  const { data: paidMembersData } = usePaidMembers(id, paidMembersPage);
  const paidMembers = paidMembersData?.members ?? [];
  const totalPaidMembers = paidMembersData?.totalMembers ?? 0;
  const paidMembersTotalPages = Math.max(
    1,
    Math.ceil(totalPaidMembers / PAID_MEMBERS_TAKE)
  );

  // const { data: spvDetail, isLoading: isSpvLoading } = useSpvById(asset?.spvId);

  // const { mutate: castVote, isPending: isVoting } = useCastVote();

  // const {
  //   data: membershipStatus,
  //   isLoading: isMembershipStatusLoading,
  //   refetch: refetchMembershipStatus,
  // } = useClubMembershipStatus(asset?.secondaryClubId ?? undefined);
  // const { mutate: acceptNda, isPending: isAcceptingNda } = useAcceptNda();
  // const ndaAccepted = !!membershipStatus?.ndaAccepted;
  // const adminApproved =
  //   membershipStatus?.status === 'Approved' || !!membershipStatus?.approvedAt;
  // const adminRejected = membershipStatus?.status === 'Rejected';
  // const adminPending = membershipStatus?.status === 'PENDINGADMINAPPROVAL';

  // const handleAcceptNda = () => {
  //   if (!asset?.secondaryClubId) return;
  //   acceptNda(asset.secondaryClubId, {
  //     onSuccess: () => {
  //       refetchMembershipStatus();
  //     },
  //     onError: (err: any) => {
  //       setStatusModal({
  //         open: true,
  //         status: 'error',
  //         title: 'Request Failed',
  //         message: err?.message || 'Failed to accept NDA. Please try again.',
  //       });
  //     },
  //   });
  // };

  // const handleVote = (choice: VoteChoice) => {
  //   if (!asset || !asset.secondaryClubId) return;

  //   castVote(
  //     {
  //       assetId: asset.id,
  //       secondaryClubId: asset.secondaryClubId,
  //       choice,
  //     },
  //     {
  //       onSuccess: (res: any) => {
  //         if (res?.success === false) {
  //           setStatusModal({
  //             open: true,
  //             status: 'error',
  //             title: 'Vote Failed',
  //             message:
  //               res?.message || 'Failed to submit your vote. Please try again.',
  //           });
  //           return;
  //         }
  //         setStatusModal({
  //           open: true,
  //           status: 'success',
  //           title: 'Vote Submitted',
  //           message: `Your vote (${choice}) has been recorded successfully.`,
  //         });
  //       },
  //       onError: (err: any) => {
  //         setStatusModal({
  //           open: true,
  //           status: 'error',
  //           title: 'Vote Failed',
  //           message:
  //             err?.message || 'Failed to submit your vote. Please try again.',
  //         });
  //       },
  //     }
  //   );
  // };

  if (isLoading) {
    return (
      <section className="w-full bg-[var(--bg)] min-h-screen pt-34 xl:pt-40 font-work pb-20 transition-all duration-300">
        <div className="w-full  max-w-[1600px] mx-auto text-center py-20 text-[var(--fg)]/40 text-sm">
          Loading club details…
        </div>
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="w-full bg-[var(--bg)] min-h-screen pt-34 xl:pt-40 font-work pb-20 transition-all duration-300">
        <div className="w-full  max-w-[1600px] mx-auto text-center py-20">
          <p className="text-[var(--fg)]/60 mb-4">Club not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-lg bg-[#3A76C0] text-white font-medium hover:opacity-90 transition"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  const city = getMetaValue(asset.meta, 'city');
  const state = getMetaValue(asset.meta, 'state');
  const location = [city, state].filter(Boolean).join(', ');
  const assetSubType =
    asset.assetSubType || getMetaValue(asset.meta, 'assetSubType');
  const shortDescription = getMetaValue(asset.meta, 'shortDescription');
  const detailedDescription = getMetaValue(asset.meta, 'detailedDescription');
  const marketValue = getMetaValue(asset.meta, 'marketValue');
  const netOperationalIncome = getMetaValue(asset.meta, 'netOperationalIncome');
  const expectedAppreciationPercentage = getMetaValue(
    asset.meta,
    'expectedAppreciationPercentage'
  );
  const expectedYieldPercentage = getMetaValue(
    asset.meta,
    'expectedYieldPercentage'
  );
  const rentalIncomeMonthly = getMetaValue(asset.meta, 'rentalIncomeMonthly');
  const landArea = getMetaValue(asset.meta, 'landArea');
  const builtupArea = getMetaValue(asset.meta, 'builtupArea');
  const yearOfConstruction = getMetaValue(asset.meta, 'yearOfConstruction');
  const assetAge = getMetaValue(asset.meta, 'assetAge');
  const titleStatus = getMetaValue(asset.meta, 'titleStatus');
  const reraRegistrationNumber = getMetaValue(
    asset.meta,
    'reraRegistrationNumber'
  );
  const pincode = getMetaValue(asset.meta, 'pincode');
  const mapUrl = getMetaValue(asset.meta, 'mapUrl');

  // const voteStatus = asset.voteStatus;
  // const canVote = !voteStatus || voteStatus === 'Active';

  const diligenceDocs = asset.documents.filter(
    (doc) =>
      doc.documentType !== 'ASSET_IMAGE' && doc.documentType !== 'ASSET_VIDEO'
  );

  return (
    <section className="w-full bg-[var(--bg)] min-h-screen pt-34 xl:pt-40 font-work pb-20 transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full "
      >
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Back button hidden — the dashboard shell now provides a shared
          back button above this page's content.
          <motion.button
            variants={itemVariants}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
          >
            <FiArrowLeft />
            Back
          </motion.button>
          */}

          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-serif sm:text-3xl font-semibold text-[var(--fg)] tracking-tight">
                {asset.assetTitle}
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5A623]/10 text-[#F5A623]">
                Club Member View
              </span>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--fg)]/10 text-[#1F4FE0] hover:bg-[#1F4FE0]/10 text-xs font-semibold transition"
                >
                  <FiMapPin size={13} />
                  Google Location
                </a>
              )}
            </div>
            <p className="text-[var(--fg)]/40 text-sm">
              {asset.assetType}
              {assetSubType ? ` — ${assetSubType}` : ''} · Status:{' '}
              {asset.status}
            </p>
          </motion.div>

          <Card title="Gallery" className="[&>div]:py-0!">
            <ImageGallery documents={asset.documents} />
          </Card>

          <Card title="About This Asset">
            {shortDescription && (
              <p className="text-[var(--fg)]/60 text-sm leading-relaxed mb-2">
                {shortDescription}
              </p>
            )}
            {detailedDescription &&
              detailedDescription !== shortDescription && (
                <p className="text-[var(--fg)]/60 text-sm leading-relaxed mb-4">
                  {detailedDescription}
                </p>
              )}
            <div>
              <InfoRow label="Asset Type" value={asset.assetType} />
              <InfoRow label="Sub Type" value={assetSubType} />
              <InfoRow label="Location" value={location} />
              <InfoRow label="Pincode" value={pincode} />
              <InfoRow
                label="Ownership Model"
                value={
                  (asset.ownershipModel == 'Others'
                    ? asset.ownershipModelOther
                    : asset.ownershipModel) ?? ''
                }
              />
              <InfoRow label="Current Owner" value={asset.currentOwnerName} />
              <InfoRow label="Status" value={asset.status} />
              {asset.rwaRequest?.fractionalizationStatus && (
                <InfoRow
                  label="Fractionalization Status"
                  value={asset.rwaRequest.fractionalizationStatus}
                />
              )}
            </div>
          </Card>

          <Card title="Property Specifications">
            <div>
              <InfoRow
                label="Land Area"
                value={landArea ? `${landArea} sq. ft.` : ''}
              />
              <InfoRow
                label="Built-up Area"
                value={builtupArea ? `${builtupArea} sq. ft.` : ''}
              />
              <InfoRow
                label="Year of Construction"
                value={yearOfConstruction}
              />
              <InfoRow
                label="Asset Age"
                value={assetAge ? `${assetAge} yr(s)` : ''}
              />
              <InfoRow label="Title Status" value={titleStatus} />
              <InfoRow
                label="RERA Registration Number"
                value={reraRegistrationNumber}
              />
            </div>
          </Card>

          <Card title="Teaser Information">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  label: 'Market Value',
                  value: marketValue
                    ? `₹${Number(marketValue).toLocaleString('en-IN')}`
                    : '',
                },
                {
                  label: 'Net Operational Income',
                  value: netOperationalIncome
                    ? `₹${Number(netOperationalIncome).toLocaleString('en-IN')}`
                    : '',
                },
                {
                  label: 'Monthly Rental Income',
                  value: rentalIncomeMonthly
                    ? `₹${Number(rentalIncomeMonthly).toLocaleString('en-IN')}`
                    : '',
                },
                {
                  label: 'Expected Yield',
                  value: expectedYieldPercentage
                    ? `${expectedYieldPercentage}%`
                    : '',
                },
                {
                  label: 'Expected Appreciation',
                  value: expectedAppreciationPercentage
                    ? `${expectedAppreciationPercentage}%`
                    : '',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[var(--fg)]/10 rounded-xl p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[var(--fg)]/40 mb-1">
                    {item.label}
                  </p>
                  <p className="text-[var(--fg)] font-semibold text-sm">
                    {item.value || '-'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {asset.assetOwner && (
            <Card title="Asset Owner">
              <div>
                <InfoRow label="Name" value={asset.assetOwner.name} />
                <InfoRow label="Email" value={asset.assetOwner.email} />
                <InfoRow label="Mobile" value={asset.assetOwner.mobile} />
              </div>
            </Card>
          )}

          <Card title="Documents">
            {diligenceDocs.length === 0 ? (
              <p className="text-[var(--fg)]/40 text-sm py-4 text-center">
                No documents uploaded for this asset yet.
              </p>
            ) : (
              <div>
                {diligenceDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 border-b border-[var(--fg)]/5 last:border-0"
                  >
                    <span className="text-[var(--fg)]/70 text-sm">
                      {doc.documentName}
                    </span>
                    <a
                      href={getDocUrl(doc.url ?? doc.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3A76C0] text-sm font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {!asset?.spvId && (
            <Card title="Club Members">
              {paidMembers.length === 0 ? (
                <p className="text-[var(--fg)]/40 text-sm py-4 text-center">
                  No paid members yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[var(--fg)]/40 uppercase text-xs tracking-wider border-b border-[var(--fg)]/10">
                        <th className="py-3 pr-4 font-medium">Name</th>
                        <th className="py-3 pr-4 font-medium">Mobile</th>
                        <th className="py-3 pr-4 font-medium">Email</th>
                        <th className="py-3 pr-4 font-medium">Amount Paid</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-[var(--fg)]/5 last:border-0"
                        >
                          <td className="py-3.5 pr-4 text-[var(--fg)] font-medium whitespace-nowrap">
                            {member.account.firstname} {member.account.lastname}
                          </td>
                          <td className="py-3.5 pr-4 text-[var(--fg)]/70 whitespace-nowrap">
                            {member.account.mobile}
                          </td>
                          <td className="py-3.5 pr-4 text-[var(--fg)]/70 whitespace-nowrap">
                            {member.account.email}
                          </td>
                          <td className="py-3.5 pr-4 text-[var(--fg)]/70">
                            ₹{Number(member.amountPaid).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                member.paymentStatus === 'PAID'
                                  ? 'bg-green/10 text-green'
                                  : 'bg-[#F5A623]/10 text-[#F5A623]'
                              }`}
                            >
                              {member.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {paidMembersTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-5">
                  <button
                    disabled={paidMembersPage === 1}
                    onClick={() => setPaidMembersPage((p) => p - 1)}
                    className="p-2 rounded-md border border-[var(--fg)]/20 text-[var(--fg)] disabled:opacity-40"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  {Array.from({ length: paidMembersTotalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPaidMembersPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm border ${
                          paidMembersPage === pageNum
                            ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                            : 'text-[var(--fg)] border-[var(--fg)]/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={paidMembersPage === paidMembersTotalPages}
                    onClick={() => setPaidMembersPage((p) => p + 1)}
                    className="p-2 rounded-md border border-[var(--fg)]/20 text-[var(--fg)] disabled:opacity-40"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </Card>
          )}
          {/* 
          {asset?.spvId && (
            <Card title="SPV Members">
              {isSpvLoading ? (
                <p className="text-[var(--fg)]/40 text-sm py-4 text-center">
                  Loading SPV members…
                </p>
              ) : !spvDetail || spvDetail.members.length === 0 ? (
                <p className="text-[var(--fg)]/40 text-sm py-4 text-center">
                  No SPV members yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[var(--fg)]/40 uppercase text-xs tracking-wider border-b border-[var(--fg)]/10">
                        <th className="py-3 pr-4 font-medium">Name</th>
                        <th className="py-3 pr-4 font-medium">Email</th>
                        <th className="py-3 pr-4 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spvDetail.members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-[var(--fg)]/5 last:border-0"
                        >
                          <td className="py-3.5 pr-4 text-[var(--fg)] font-medium whitespace-nowrap">
                            {member.account.firstname} {member.account.lastname}
                          </td>
                          <td className="py-3.5 pr-4 text-[var(--fg)]/70 whitespace-nowrap">
                            {member.account.email}
                          </td>
                          <td className="py-3.5 pr-4 text-[var(--fg)]/70 whitespace-nowrap">
                            {new Date(member.createdAt).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )} */}

          {/* {!isAssetOwner && (
            <Card title="Club Vote — Proceed to SPV?">
              {(asset.voteStartDate || asset.voteEndDate) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {voteStatus === 'Active' && (
                    <motion.span
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-green shrink-0"
                    />
                  )}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      voteStatus === 'Active'
                        ? 'bg-green/10 text-green'
                        : voteStatus === 'Ended'
                          ? 'bg-[var(--fg)]/10 text-[var(--fg)]/60'
                          : 'bg-[#F5A623]/10 text-[#F5A623]'
                    }`}
                  >
                    {voteStatus === 'Active'
                      ? 'Voting Live'
                      : voteStatus === 'Ended'
                        ? 'Voting Ended'
                        : 'Voting Scheduled'}
                  </motion.span>
                  <span className="text-[var(--fg)]/40 text-xs">
                    {voteStatus === 'Ended'
                      ? `Ended ${formatVoteDate(asset.voteEndDate)}`
                      : voteStatus === 'Active'
                        ? `Ends ${formatVoteDate(asset.voteEndDate)}`
                        : `Starts ${formatVoteDate(asset.voteStartDate)}`}
                  </span>
                </div>
              )}

              {asset.hasVoted ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green"
                >
                  <FiCheck />
                  You Voted {asset.choice}
                </motion.div>
              ) : !canVote ? (
                <p className="text-[var(--fg)]/40 text-sm">
                  {voteStatus === 'Ended'
                    ? 'Voting has ended for this club.'
                    : `Voting hasn't started yet — check back on ${formatVoteDate(asset.voteStartDate)}.`}
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleVote('Yes')}
                    disabled={isVoting}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-green text-green hover:bg-green/10 transition-colors disabled:opacity-50"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote('No')}
                    disabled={isVoting}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleVote('Abstain')}
                    disabled={isVoting}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[var(--fg)]/15 text-[var(--fg)]/70 hover:bg-[var(--fg)]/5 transition-colors disabled:opacity-50"
                  >
                    Abstain
                  </button>
                </div>
              )}
            </Card>
          )} */}

          {/* {asset.hasVoted && (
            <Card>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  Step 2 — Accept NDA &amp; Club Terms
                </h2>
                {!isMembershipStatusLoading && ndaAccepted && (
                  <StepBadge label="NDA Accepted" tone="done" />
                )}
              </div>
              <p className="text-[var(--fg)]/50 text-sm mb-4">
                Required before your access request is sent to Admin for
                approval.
              </p>

              {isMembershipStatusLoading ? (
                <p className="text-[var(--fg)]/40 text-sm">Checking status…</p>
              ) : ndaAccepted ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green"
                >
                  <FiCheck />
                  NDA &amp; Club Terms accepted
                </motion.div>
              ) : (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ndaChecked}
                    onChange={(e) => setNdaChecked(e.target.checked)}
                    className="mt-0.5 accent-[#3A76C0]"
                  />
                  <span className="text-[var(--fg)]/70 text-sm">
                    I accept the Confidentiality / NDA Terms and the Investment
                    Club Membership Agreement.
                  </span>
                </label>
              )}
            </Card>
          )} */}
          {/* 
          {asset.hasVoted && (
            <Card>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  Step 3 — Admin Approval
                </h2>
                {!isMembershipStatusLoading &&
                  (adminApproved || adminRejected || adminPending) && (
                    <StepBadge
                      label={
                        adminApproved
                          ? 'Approved'
                          : adminRejected
                            ? 'Rejected'
                            : 'Pending Admin Review'
                      }
                      tone={
                        adminApproved
                          ? 'done'
                          : adminRejected
                            ? 'rejected'
                            : 'pending'
                      }
                    />
                  )}
              </div>

              {isMembershipStatusLoading ? (
                <p className="text-[var(--fg)]/40 text-sm">Checking status…</p>
              ) : adminApproved ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green"
                >
                  <FiCheck />
                  Approved — you now have Approved Investor access to this
                  club&apos;s data room.
                </motion.div>
              ) : adminPending ? (
                <p className="text-[var(--fg)]/50 text-sm">
                  Your access request has been sent to Admin for review. This
                  usually takes 1 business day.
                </p>
              ) : (
                <>
                  {adminRejected && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mb-4"
                    >
                      Your access request was rejected by Admin
                      {membershipStatus?.rejectionReason
                        ? `: ${membershipStatus.rejectionReason}`
                        : '.'}
                    </motion.p>
                  )}
                  <p className="text-[var(--fg)]/50 text-sm mb-4">
                    {ndaAccepted || ndaChecked
                      ? 'Confirm below to send your access request to Admin for review. This usually takes 1 business day.'
                      : 'Accept the NDA & Club Terms in Step 2 first, then confirm below to send your access request to Admin.'}
                  </p>
                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsChecked}
                      onChange={(e) => setTermsChecked(e.target.checked)}
                      className="mt-0.5 accent-[#3A76C0]"
                    />
                    <span className="text-[var(--fg)]/70 text-sm">
                      I confirm the information provided is accurate and consent
                      to sending my access request to Admin for approval.
                    </span>
                  </label>
                  <button
                    onClick={handleAcceptNda}
                    disabled={
                      !(ndaAccepted || ndaChecked) ||
                      !termsChecked ||
                      isAcceptingNda
                    }
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[var(--fg)]/15 text-[var(--fg)] hover:bg-[var(--fg)]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAcceptingNda
                      ? 'Submitting...'
                      : adminRejected
                        ? 'Resubmit for Admin Approval →'
                        : 'Accept & Send for Admin Approval →'}
                  </button>
                </>
              )}
            </Card>
          )} */}
        </div>
      </motion.div>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
    </section>
  );
}
