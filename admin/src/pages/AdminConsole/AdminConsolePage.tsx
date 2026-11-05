import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

// Import our RTK Query APIs
import { useGetAccountsQuery, useUpdateUserStatusMutation } from '@/store/api/accountsApi';
import { useGetKycAccountsQuery, useUpdateKycStatusMutation } from '@/store/api/kycApi';
import { useGetAllAssetsQuery } from '@/store/api/assetsApi';

// Import our modular tabs
import {
  DashboardTab,
  AssetPhasesTab,
  AssetReviewTab,
  CMSListingTab,
  ListingApprovalTab,
  GovAssetMgmtTab,
  ProfitMechanismTab,
  TimeshareTab,
  ExitMgmtTab,
  InvestorPhasesTab,
  InvestorAccessTab,
  SecondaryMarketTab,
  GroupsOverviewTab,
  GroupInterestDetailsTab,
  ClubMembersTab,
  ClubVotersTab,
  GroupSharingTab,
  ClubMgmtTab,
  UserMgmtTab,
  UserDetailTab,
  KycReviewTab,
  SpvMgmtTab,
  BrokerMgmtTab,
  RmAssignmentTab,
  PaymentsTrackingTab,
  ManualPaymentsTab,
  DepositRequestTab,
  WithdrawRequestTab,
  TicketsTab,
  AuditLogsTab,
  StatusLegendTab,
  ComplianceReportsTab,
  SettingsTab,
  ConsentTab,
  ChatMessage,
  SPV,
  Vote,
  ProfitMechanism,
  Booking,
  AssetChecks,
  RelationshipManager,
  RmAssignment,
  SupportTicket,
  ExitTimeline,
} from './tabs';

interface AdminConsolePageProps {
  activeTab?: string;
}

export function AdminConsolePage({ activeTab: propActiveTab }: AdminConsolePageProps) {
  const { activeTab: pathTab } = useParams<{ activeTab: string }>();
  const activeTab = propActiveTab || pathTab || 'dashboard';
  const navigate = useNavigate();

  // ----------------------------------------------------
  // Local States for Interactivity
  // ----------------------------------------------------
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      who: 'Legal Auditor',
      text: 'Checked title registry. Awaiting physical mutation copy.',
      in: true,
    },
    {
      id: 2,
      who: 'Operations',
      text: 'Spoke to owner. They will upload the copy by tomorrow morning.',
      in: false,
    },
    {
      id: 3,
      who: 'Legal Auditor',
      text: 'Great. Once uploaded, I will verify and sign off within 2 hours.',
      in: true,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // SPV Modal State
  const [spvModalOpen, setSpvModalOpen] = useState(false);
  const [newSpvName, setNewSpvName] = useState('');
  const [newSpvAsset, setNewSpvAsset] = useState('Heritage Court, Udaipur');
  const [newSpvFractions, setNewSpvFractions] = useState('50,000');
  const [spvs, setSpvs] = useState<SPV[]>([
    {
      id: 'FRACTO-SPV-014',
      name: 'Marina Bay SPV Ltd',
      asset: 'Marina Bay Residency, Goa',
      fractions: '100,000',
      status: 'Active (Funded)',
      step: 4,
    },
    {
      id: 'FRACTO-SPV-021',
      name: 'Lakeview Udaipur SPV',
      asset: 'Lakeview Commercial, Udaipur',
      fractions: '75,000',
      status: 'Gathering Funds',
      step: 3,
    },
    {
      id: 'FRACTO-SPV-027',
      name: 'Heritage Udaipur SPV',
      asset: 'Heritage Court, Udaipur',
      fractions: '50,000',
      status: 'Due Diligence',
      step: 2,
    },
  ]);

  // Vote Modal State
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteAsset, setNewVoteAsset] = useState('Sora Heights, Mumbai');
  const [newVoteEndTime, setNewVoteEndTime] = useState('3 days');
  const [votes, setVotes] = useState<Vote[]>([
    {
      id: 'VOTE-801',
      title: 'Approve Lease Agreement (Tenant: Cafe Coffee Day)',
      asset: 'Sora Heights, Mumbai',
      status: 'Active',
      yes: 68,
      no: 12,
      daysLeft: 3,
    },
    {
      id: 'VOTE-798',
      title: 'Approve Refurbishment Expenditure (₹4.5L)',
      asset: 'Lakeview Commercial',
      status: 'Passed',
      yes: 84,
      no: 16,
      daysLeft: 0,
    },
  ]);

  // Profit Mech Tagging States
  const [profitMechanisms, setProfitMechanisms] = useState<Record<string, ProfitMechanism>>({
    'Lakeview Commercial': { rental: true, timeshare: false, exit: true },
    'Heritage Court': { rental: true, timeshare: false, exit: false },
    'Marina Bay Residency': { rental: true, timeshare: true, exit: true },
    'Sora Heights': { rental: true, timeshare: true, exit: false },
  });

  // Booking approvals / Timeshare Income page
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-091',
      guest: 'Anil Mehta',
      checkin: '2026-08-01',
      checkout: '2026-08-04',
      status: 'Pending Approval',
      rate: 12500,
      total: 37500,
    },
    {
      id: 'BK-089',
      guest: 'Sanjay Dutt',
      checkin: '2026-07-22',
      checkout: '2026-07-25',
      status: 'Approved',
      rate: 12500,
      total: 37500,
    },
  ]);

  // Asset Checklist in Listing Approval
  const [assetChecklist, setAssetChecklist] = useState<Record<string, AssetChecks>>({
    'Heritage Court': { legal: true, valuation: true, dd: true, cms: false, owner: false },
    'Lakeview Commercial': { legal: true, valuation: true, dd: true, cms: true, owner: true },
    'Marina Bay Residency': { legal: true, valuation: true, dd: true, cms: true, owner: true },
  });

  // Selected User Detail in Operations
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);

  // RM Assignments list
  const [rms] = useState<RelationshipManager[]>([
    {
      name: 'Riya Sharma',
      email: 'riya.sharma@frac.in',
      activeUsers: 45,
      pendingKyc: 3,
      workload: 'Moderate',
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@frac.in',
      activeUsers: 68,
      pendingKyc: 7,
      workload: 'High',
    },
    { name: 'Nisha K.', email: 'nisha.k@frac.in', activeUsers: 22, pendingKyc: 1, workload: 'Low' },
  ]);
  const [rmAssignments, setRmAssignments] = useState<RmAssignment[]>([
    { user: 'Mudit V. Dudhoria', role: 'Investor', rm: 'Riya Sharma' },
    { user: 'Young Attitude Group', role: 'Prospective Co-owner', rm: 'Riya Sharma' },
    { user: 'Raj Kumar Associates', role: 'Partner', rm: 'Amit Patel' },
    { user: 'Sora Heights Owner', role: 'Prospective Co-owner', rm: 'Nisha K.' },
  ]);

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-2101',
      user: 'Mudit V. Dudhoria',
      subject: 'Payout delayed by 2 days',
      status: 'Open',
      priority: 'High',
      date: '2026-07-14',
    },
    {
      id: 'TCK-2098',
      user: 'Raj Kumar Associates',
      subject: 'Commission rate query',
      status: 'In-Progress',
      priority: 'Medium',
      date: '2026-07-13',
    },
    {
      id: 'TCK-2077',
      user: 'Anil Mehta',
      subject: 'KYC Document upload failure',
      status: 'Resolved',
      priority: 'High',
      date: '2026-07-10',
    },
  ]);

  // Exit timeline status (Lakeview Exit Management)
  const [exitTimeline, setExitTimeline] = useState<ExitTimeline>({
    votePassed: true,
    exitSpvTriggered: true,
    buyerFundsEscrowed: false,
    distributionReady: false,
  });

  // ----------------------------------------------------
  // RTK Query API Hooks
  // ----------------------------------------------------
  const {
    data: accountsResponse,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useGetAccountsQuery({ take: 20 }, { skip: activeTab !== 'usermgmt' });
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const {
    data: kycResponse,
    isLoading: kycLoading,
    refetch: refetchKyc,
  } = useGetKycAccountsQuery(
    { take: 20 },
    { skip: activeTab !== 'kyc' && activeTab !== 'dashboard' }
  );
  const [updateKycStatus] = useUpdateKycStatusMutation();

  const { data: assetsResponse } = useGetAllAssetsQuery(
    { take: 20 },
    { skip: activeTab !== 'assetphases' && activeTab !== 'dashboard' }
  );

  const realAccounts = accountsResponse?.data || [];
  const realKyc = kycResponse?.data || [];
  const realAssets = assetsResponse?.data || [];

  // ----------------------------------------------------
  // Helper Actions & Triggers
  // ----------------------------------------------------
  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: Date.now(), who: 'You (Admin)', text: chatInput, in: false },
    ]);
    setChatInput('');
    toast.success('Message sent to review log');
  };

  const handleCreateSPV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpvName.trim()) return;
    const newId = `FRACTO-SPV-0${Math.floor(Math.random() * 90) + 10}`;
    setSpvs([
      ...spvs,
      {
        id: newId,
        name: newSpvName,
        asset: newSpvAsset,
        fractions: newSpvFractions,
        status: 'Drafting Docs',
        step: 1,
      },
    ]);
    setSpvModalOpen(false);
    setNewSpvName('');
    toast.success(`SPV ${newId} initiated successfully`);
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoteTitle.trim()) return;
    const newId = `VOTE-${Math.floor(Math.random() * 900) + 100}`;
    setVotes([
      ...votes,
      {
        id: newId,
        title: newVoteTitle,
        asset: newVoteAsset,
        status: 'Active',
        yes: 0,
        no: 0,
        daysLeft: parseInt(newVoteEndTime) || 3,
      },
    ]);
    setVoteModalOpen(false);
    setNewVoteTitle('');
    toast.success(`Vote ${newId} published to investment clubs`);
  };

  const toggleProfitMech = (asset: string, field: keyof ProfitMechanism) => {
    setProfitMechanisms((prev) => {
      const current = prev[asset] || { rental: false, timeshare: false, exit: false };
      const updated = { ...current, [field]: !current[field] };
      toast.success(`${asset} profit mechanism updated`);
      return { ...prev, [asset]: updated };
    });
  };

  const approveBooking = (id: string) => {
    setBookings((prev) => prev.map((bk) => (bk.id === id ? { ...bk, status: 'Approved' } : bk)));
    toast.success(`Booking ${id} approved`);
  };

  const toggleChecklist = (asset: string, field: keyof AssetChecks) => {
    setAssetChecklist((prev) => {
      const current = prev[asset] || {
        legal: false,
        valuation: false,
        dd: false,
        cms: false,
        owner: false,
      };
      const updated = { ...current, [field]: !current[field] };
      return { ...prev, [asset]: updated };
    });
  };

  const approveAllChecks = (assetName: string) => {
    setAssetChecklist((prev) => ({
      ...prev,
      [assetName]: { legal: true, valuation: true, dd: true, cms: true, owner: true },
    }));
    toast.success(`All checks approved for ${assetName}`);
  };

  const handleGoLive = (assetName: string) => {
    const checks = assetChecklist[assetName];
    if (checks && checks.legal && checks.valuation && checks.dd && checks.cms && checks.owner) {
      toast.success(`${assetName} has been successfully deployed LIVE on the platform!`);
    } else {
      toast.error(`Please complete all checklist items before taking ${assetName} live.`);
    }
  };

  const handleUserStatusUpdate = async (accountId: number | string, status: string) => {
    try {
      await updateUserStatus({ accountId: Number(accountId), status: status as any }).unwrap();
      toast.success(`User status updated to ${status}`);
      refetchAccounts();
      if (selectedUserDetail && selectedUserDetail.id === accountId) {
        setSelectedUserDetail({ ...selectedUserDetail, status });
      }
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleKycAction = async (kycId: number, action: 'Approved' | 'Rejected') => {
    try {
      await updateKycStatus({ id: kycId, action: action as any }).unwrap();
      toast.success(`KYC request ${action}`);
      refetchKyc();
    } catch (err) {
      toast.error('Failed to verify KYC request');
    }
  };

  const openUserDetail = (user: any) => {
    setSelectedUserDetail(user);
    navigate('/userdetail');
  };

  const assignRM = (userName: string, rmName: string) => {
    setRmAssignments((prev) =>
      prev.map((assignment) =>
        assignment.user === userName ? { ...assignment, rm: rmName } : assignment
      )
    );
    toast.success(`RM ${rmName} assigned to ${userName}`);
  };

  // Switch Render for Modular Tab Panels
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            realKyc={realKyc}
            realAssets={realAssets}
            activeVotesCount={votes.filter((v) => v.status === 'Active').length}
          />
        );
      case 'assetphases':
        return <AssetPhasesTab realAssets={realAssets} />;
      case 'assetreview':
        return <AssetReviewTab />;
      case 'cms':
        return <CMSListingTab />;
      case 'listing-approval':
        return <ListingApprovalTab />;
      case 'govassetmgmt':
        return <GovAssetMgmtTab />;
      case 'profitmechanism':
      case 'profittypes':
        return <ProfitMechanismTab />;
      case 'timeshare':
        return <TimeshareTab />;
      case 'exitmgmt':
        return <ExitMgmtTab />;
      case 'investorphases':
        return <InvestorPhasesTab />;
      case 'investoraccess':
        return <InvestorAccessTab />;
      case 'secondarymarket':
        return <SecondaryMarketTab />;
      case 'consent':
        return <ConsentTab />;
      case 'groupsoverview':
        return <GroupsOverviewTab />;
      case 'groupsoverview-detail':
        return <GroupInterestDetailsTab />;
      case 'clubmembers':
        return <ClubMembersTab />;
      case 'clubvoters':
        return <ClubVotersTab />;
      case 'groupsharing':
        return <GroupSharingTab />;
      case 'club-management':
        return <ClubMgmtTab />;
      case 'usermgmt':
        return (
          <UserMgmtTab
            accountsLoading={accountsLoading}
            realAccounts={realAccounts}
            openUserDetail={openUserDetail}
          />
        );
      case 'userdetail':
        return selectedUserDetail ? (
          <UserDetailTab
            selectedUserDetail={selectedUserDetail}
            handleUserStatusUpdate={handleUserStatusUpdate}
          />
        ) : (
          <div className="text-slate-400 py-8 text-center">
            No user selected. Please select a user from User Management.
          </div>
        );
      case 'kyc':
        return (
          <KycReviewTab
            kycLoading={kycLoading}
            realKyc={realKyc}
            handleKycAction={handleKycAction}
          />
        );
      case 'spv':
      case 'spvmgmt':
        return <SpvMgmtTab spvs={spvs} setSpvModalOpen={setSpvModalOpen} />;
      case 'broker':
      case 'brokermgmt':
        return <BrokerMgmtTab />;
      case 'rm':
      case 'rmassignment':
        return <RmAssignmentTab />;
      case 'payments':
        return <PaymentsTrackingTab />;
      case 'manual-payments':
        return <ManualPaymentsTab />;
      case 'deposit-request':
        return <DepositRequestTab />;
      case 'withdraw-request':
        return <WithdrawRequestTab />;
      case 'tickets':
        return <TicketsTab />;
      case 'auditlogs':
        return <AuditLogsTab />;
      case 'statuslegend':
        return <StatusLegendTab />;
      case 'reports':
        return <ComplianceReportsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <div className="text-slate-400 py-8 text-center">Tab not found: {activeTab}</div>;
    }
  };

  return (
    <>
      <div className="w-full mx-auto space-y-6">{renderTabContent()}</div>

      {spvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Initiate New Asset SPV</h3>
            <form onSubmit={handleCreateSPV} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-semibold block">SPV Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heritage Udaipur SPV"
                  value={newSpvName}
                  onChange={(e) => setNewSpvName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-semibold block">
                  Target Onboarding Asset
                </label>
                <select
                  value={newSpvAsset}
                  onChange={(e) => setNewSpvAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="Heritage Court, Udaipur">Heritage Court, Udaipur</option>
                  <option value="Lakeview Commercial, Udaipur">Lakeview Commercial, Udaipur</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-semibold block">
                  Total Fraction Units
                </label>
                <input
                  type="text"
                  required
                  value={newSpvFractions}
                  onChange={(e) => setNewSpvFractions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSpvModalOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
                >
                  Initiate SPV
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {voteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Vote Proposal Agenda</h3>
            <form onSubmit={handleCreateVote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-355 font-semibold block">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approve Lease Extension"
                  value={newVoteTitle}
                  onChange={(e) => setNewVoteTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-355 font-semibold block">
                  Target Asset Pool
                </label>
                <select
                  value={newVoteAsset}
                  onChange={(e) => setNewVoteAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="Sora Heights, Mumbai">Sora Heights, Mumbai</option>
                  <option value="Lakeview Commercial">Lakeview Commercial</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-355 font-semibold block">
                  Voting Window (Days)
                </label>
                <input
                  type="text"
                  required
                  value={newVoteEndTime}
                  onChange={(e) => setNewVoteEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVoteModalOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
                >
                  Publish Agenda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
