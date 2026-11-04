import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import type { IconType } from 'react-icons';
import {
  FiArrowLeft,
  FiHome,
  FiGrid,
  FiCheckSquare,
  FiUserPlus,
  FiPlusCircle,
  // FiShare2,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiBookOpen,
  FiMessageSquare,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  // FiShoppingBag,
  FiRepeat,
  FiBriefcase,
  FiCompass,
  FiFolder,
  FiCreditCard,
  FiAward,
} from 'react-icons/fi';

// Tab components
import DashboardTab from './tabs/DashboardTab';
import MyOnboardingTab from './tabs/MyOnboardingTab';
import SubmitLeadTab from './tabs/SubmitLeadTab';
import ListAnAssetTab from './tabs/ListAnAssetTab';
import BrokerAssetDetail from './tabs/BrokerAssetDetail';
import ShareInviteTab from './tabs/ShareInviteTab';
import MyReferralsTab from './tabs/MyReferralsTab';
import CommissionLedgerTab from './tabs/CommissionLedgerTab';
import CommissionStatus from '@/components/Dashboard/Commissions/CommissionStatus';
import PayoutRequestsTab from './tabs/PayoutRequestsTab';
import ComplianceDocumentsTab from './tabs/ComplianceDocumentsTab';
import TrainingRulesTab from './tabs/TrainingRulesTab';
import MessagesTab from './tabs/MessagesTab';
import Profile from '@/components/Dashboard/Profile';
import AssetMarketplaceTab from '@/components/Dashboard/Overview/AssetOwner/tabs/AssetMarketplaceTab';
import Marketplace from '@/components/Dashboard/Marketplace';
import MarketplaceDetails from '@/components/Dashboard/Marketplace/MarketplaceDetails';
import Holdings from '@/components/Dashboard/Holdings';
import HoldingDetail from '@/components/Dashboard/Holdings/HoldingDetail';
import DiscoverClubsTab from '@/components/Dashboard/Overview/AssetOwner/tabs/DiscoverClubsTab';
import Wallet from '@/components/Dashboard/Wallet';
import MyAssetsTab from '@/components/Dashboard/Overview/AssetOwner/tabs/MyAssetsTab';
import MyClub from '@/components/Dashboard/MyClub';
import InvestorOverviewTab from '@/components/Dashboard/Overview/AssetOwner/tabs/InvestorOverviewTab';
import { DASHBOARD_THEME_OVERRIDE } from '@/components/Dashboard/Overview/AssetOwnerDashboard';

interface TabItem {
  name: string;
  path: string;
  icon: IconType;
}

interface TabGroup {
  name: string;
  icon: IconType;
  children: TabItem[];
}

type TabEntry = TabItem | TabGroup;

const tabConfig: TabEntry[] = [
  { name: 'Dashboard', path: 'dashboard', icon: FiGrid },
  { name: 'Discover Club', path: 'clubs-section', icon: FiCompass },
  { name: 'KYC', path: 'kyc', icon: FiCheckSquare },
  { name: 'Add an Asset', path: 'add-asset', icon: FiPlusCircle },
  {
    name: 'My Holdings',
    icon: FiBriefcase,
    children: [
      { name: 'My Club', path: 'my-club', icon: FiAward },
      { name: 'My Assets', path: 'my-assets', icon: FiFolder },
      { name: 'My Investors', path: 'my-referrals', icon: FiUsers },
      // { name: 'SPV List', path: 'spv-list', icon: FiShoppingBag },
    ],
  },
  { name: 'Secondary Marketplace', path: 'marketplace', icon: FiRepeat },
  {
    name: 'Wallets',
    icon: FiCreditCard,
    children: [
      { name: 'My Wallet', path: 'wallet', icon: FiCreditCard },
      {
        name: 'Payout Requests',
        path: 'payout-requests',
        icon: FiTrendingUp,
      },
      {
        name: 'Commission Ledger',
        path: 'commission-ledger',
        icon: FiDollarSign,
      },
    ],
  },

  // { name: 'Share / Invite', path: 'share-invite', icon: FiShare2 },
  {
    name: 'Management',
    icon: FiShield,
    children: [
      {
        name: 'Compliance Documents',
        path: 'compliance-documents',
        icon: FiShield,
      },
      { name: 'Training & Rules', path: 'training-rules', icon: FiBookOpen },
      { name: 'Messages', path: 'messages', icon: FiMessageSquare },
      { name: 'Submit Lead', path: 'submit-lead', icon: FiUserPlus },
      { name: 'Profile & Settings', path: 'profile', icon: FiSettings },
    ],
  },
];

const flatTabConfig: TabItem[] = tabConfig.flatMap((entry) =>
  'children' in entry ? entry.children : [entry]
);

export default function BrokerDashboardShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Authentication & Authorization check
  const { role, isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const user = useSelector((state: RootState) => state.authLogin.user);
  const currentRole = role || user?.type || user?.role;
  const normalizedRole = currentRole?.toLowerCase();

  const filteredTabConfig: TabEntry[] =
    user?.kycStatus === 'Approved'
      ? tabConfig.filter((entry) => !('path' in entry) || entry.path !== 'kyc')
      : tabConfig;

  // Toast alert states
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile sidebar state (AssetOwnerDashboard synchronized toggle style)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // "My Assets" page's Listed/Holdings toggle — switched via local state only,
  // not navigation, so it stays on a single URL (/dashboard/my-assets)
  // instead of bouncing between /dashboard/my-assets and /dashboard/my-holdings.
  const [myAssetsSubTab, setMyAssetsSubTab] = useState<'listed' | 'holdings'>(
    pathname === '/dashboard/my-holdings' || pathname === '/dashboard/holdings'
      ? 'holdings'
      : 'listed'
  );
  useEffect(() => {
    if (
      pathname === '/dashboard/my-holdings' ||
      pathname === '/dashboard/holdings'
    ) {
      setMyAssetsSubTab('holdings');
    } else if (pathname === '/dashboard/my-assets') {
      setMyAssetsSubTab('listed');
    }
  }, [pathname]);

  // Sidebar dropdown groups (Add Asset / My Holdings / Wallets / Management)
  // — only one group stays expanded at a time.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const lastActiveGroupRef = useRef<string | null>(null);

  // Brokers can also invest — let them switch between their Channel Partner
  // dashboard and the Investor dashboard on the same 'Dashboard' tab.
  const [dashboardView, setDashboardView] = useState<'broker' | 'investor'>(
    'broker'
  );

  // My Assets state — mirrors AssetOwnerDashboard's setup so the shared
  // MyAssetsTab component (same list, same detail view) works identically here.
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<
    null | 'sora' | 'crescent'
  >(null);
  const [soraTab, setSoraTab] = useState<
    'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  >('overview');
  const [crescentTab, setCrescentTab] = useState<
    'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  >('overview');
  const [crescentSignoffStatus, setCrescentSignoffStatus] = useState<
    'pending' | 'agreed' | 'objected'
  >('pending');
  const [crescentSignoffNote, setCrescentSignoffNote] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<(() => void) | null>(
    null
  );

  const showConfirm = (title: string, text: string, onConfirm: () => void) => {
    setModalTitle(title);
    setModalText(text);
    setOnModalConfirm(() => onConfirm);
    setModalOpen(true);
  };

  const closeConfirm = () => {
    setModalOpen(false);
  };

  // Determine active tab based on path
  const currentSubPath = pathname.replace(/^\/dashboard\/?/, '');
  const activeTabItem =
    flatTabConfig.find(
      (tab) =>
        tab.path === currentSubPath ||
        (tab.path === 'my-assets' &&
          (currentSubPath === 'my-assets' ||
            currentSubPath.startsWith('my-assets/'))) ||
        (tab.path === 'my-assets' &&
          (currentSubPath === 'holdings' ||
            currentSubPath.startsWith('holdings/') ||
            currentSubPath === 'my-holdings' ||
            currentSubPath.startsWith('my-holdings/'))) ||
        (tab.path === 'commission-ledger' &&
          currentSubPath.startsWith('commissions/')) ||
        (tab.path === 'marketplace' &&
          currentSubPath.startsWith('marketplace/')) ||
        (tab.path === 'my-club' &&
          (currentSubPath === 'my-club' ||
            currentSubPath.startsWith('my-club/'))) ||
        (tab.name === 'Dashboard' && currentSubPath === '') ||
        (tab.path === 'profile' && currentSubPath === 'settings')
    ) || flatTabConfig[0];
  const activeTab = activeTabItem.name;

  // Whichever dropdown group contains the active tab should be expanded.
  // Computed synchronously (not via useEffect) so it lands in the very
  // first render after navigation — an effect-based version applies one
  // render late, which briefly shows the group collapsed and then makes it
  // pop back open, reading as the dropdown "closing" when a child is clicked.
  const activeGroupName =
    tabConfig.find(
      (entry): entry is TabGroup =>
        'children' in entry &&
        entry.children.some((child) => child.name === activeTab)
    )?.name ?? null;

  if (
    activeGroupName !== null &&
    lastActiveGroupRef.current !== activeGroupName
  ) {
    lastActiveGroupRef.current = activeGroupName;
    if (openGroup !== activeGroupName) {
      setOpenGroup(activeGroupName);
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedRole !== 'broker') {
    return <Navigate to="/dashboard" replace />;
  }

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2600);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-5">
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10">
              <button
                onClick={() => setDashboardView('broker')}
                className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                  dashboardView === 'broker'
                    ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Channel Partner
              </button>
              <button
                onClick={() => setDashboardView('investor')}
                className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                  dashboardView === 'investor'
                    ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Investor
              </button>
            </div>

            {dashboardView === 'broker' ? (
              <DashboardTab />
            ) : (
              <InvestorOverviewTab navigate={navigate} />
            )}
          </div>
        );
      case 'KYC':
        return (
          <div
            className={`[&>div]:pt-0! [&>div]:px-0! [&>div]:min-h-0! ${DASHBOARD_THEME_OVERRIDE}`}
          >
            <MyOnboardingTab showToast={triggerToast} />
          </div>
        );
      case 'Submit Lead':
        return <SubmitLeadTab />;
      case 'Add an Asset':
        return <ListAnAssetTab />;
      case 'My Assets': {
        const pathParts = pathname.split('/');

        // Detail views (a specific asset or holding record) are real,
        // separate URLs — unaffected by the Listed/Holdings toggle below.
        const holdingsIndex = pathParts.findIndex(
          (part) => part === 'holdings' || part === 'my-holdings'
        );
        const holdingId =
          holdingsIndex !== -1 ? pathParts[holdingsIndex + 1] : undefined;
        if (holdingId) {
          return (
            <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0!">
              <HoldingDetail />
            </div>
          );
        }

        const assetsIndex = pathParts.findIndex((part) => part === 'my-assets');
        const assetId =
          assetsIndex !== -1 ? pathParts[assetsIndex + 1] : undefined;
        if (assetId) {
          return <BrokerAssetDetail id={assetId} />;
        }

        // Listed/Holdings is a local toggle, not a navigation — stays on a
        // single URL (/dashboard/my-assets) instead of bouncing the route.
        const subTabs = (
          <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10">
            <button
              onClick={() => setMyAssetsSubTab('listed')}
              className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                myAssetsSubTab === 'listed'
                  ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Listed
            </button>
            <button
              onClick={() => setMyAssetsSubTab('holdings')}
              className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                myAssetsSubTab === 'holdings'
                  ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Holdings
            </button>
          </div>
        );

        if (myAssetsSubTab === 'holdings') {
          return (
            <div className="space-y-4">
              {subTabs}
              <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0! [&_.py-5.mb-6]:py-0!">
                <Holdings />
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {subTabs}
            <MyAssetsTab
              navigate={navigate}
              selectedAssetDetail={selectedAssetDetail}
              setSelectedAssetDetail={setSelectedAssetDetail}
              soraTab={soraTab}
              setSoraTab={setSoraTab}
              crescentTab={crescentTab}
              setCrescentTab={setCrescentTab}
              showConfirm={showConfirm}
              crescentSignoffStatus={crescentSignoffStatus}
              setCrescentSignoffStatus={setCrescentSignoffStatus}
              crescentSignoffNote={crescentSignoffNote}
              setCrescentSignoffNote={setCrescentSignoffNote}
            />
          </div>
        );
      }
      case 'SPV List':
        return <AssetMarketplaceTab />;
      case 'Secondary Marketplace': {
        const pathParts = pathname.split('/');
        const marketplaceIndex = pathParts.findIndex(
          (part) => part === 'marketplace'
        );
        const marketplaceId =
          marketplaceIndex !== -1 ? pathParts[marketplaceIndex + 1] : undefined;
        return (
          <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
            {marketplaceId ? <MarketplaceDetails /> : <Marketplace />}
          </div>
        );
      }
      case 'My Club':
        return (
          <div className="[&>section]:pt-0! [&>section]:px-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
            <MyClub />
          </div>
        );
      case 'My Wallet':
        return <Wallet />;
      case 'Discover Club':
        return <DiscoverClubsTab />;
      case 'Share / Invite':
        return <ShareInviteTab />;
      case 'My Investors':
        return <MyReferralsTab showToast={triggerToast} />;
      case 'Commission Ledger':
        if (
          pathname.includes('/commissions/') &&
          pathname.endsWith('/status')
        ) {
          return (
            <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0!">
              <CommissionStatus />
            </div>
          );
        }
        return <CommissionLedgerTab showToast={triggerToast} />;
      case 'Payout Requests':
        return <PayoutRequestsTab />;
      case 'Compliance Documents':
        return <ComplianceDocumentsTab />;
      case 'Training & Rules':
        return <TrainingRulesTab />;
      case 'Messages':
        return <MessagesTab />;
      case 'Profile & Settings':
        return (
          <div className="[&_section]:pt-0! [&_section]:px-0! [&_section]:min-h-0!">
            <Profile />
          </div>
        );
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="w-full  bg-[var(--bg)] text-[var(--fg)] pt-[60px] md:pt-[80px] transition-all duration-300">
      {/* Mobile Arrow Toggle Button attached to Sidebar edge & synchronized */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`md:hidden fixed left-0 top-[85px] z-50 text-gray-700 dark:text-gray-200 hover:text-blue-500 flex items-center justify-center transition-transform duration-300 active:scale-95 cursor-pointer ${
          mobileMenuOpen ? 'translate-x-56' : 'translate-x-0'
        }`}
        aria-label="Toggle Sidebar"
        title={mobileMenuOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {mobileMenuOpen ? (
          <FiChevronLeft className="w-5 h-5" />
        ) : (
          <FiChevronRight className="w-5 h-5" />
        )}
      </button>

      <div className="flex min-h-[calc(100vh-80px)] relative">
        <div
          className={`fixed md:sticky top-0 md:top-[80px] bottom-0 left-0 z-40 w-56 bg-white dark:bg-[#0f1d2c] border-r border-[#E3E7EE] dark:border-white/10 py-6 transition-transform duration-300 md:translate-x-0 h-screen md:h-[calc(100vh-80px)] overflow-y-auto scrollbar-ui ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Back to Home"
            className="px-5 py-3 mb-2 font-14 flex items-center gap-3 text-left transition-all border-l-4 border-transparent w-full cursor-pointer text-[#5B6472] dark:text-gray-400 font-medium hover:bg-[#F8FAFD] dark:hover:bg-white/5"
          >
            <FiHome className="w-4 h-4 shrink-0" />
            <span className="truncate">Home</span>
          </button>
          <div className="hidden md:block border-b border-[#E3E7EE] dark:border-white/10 mb-2" />

          <div className="md:hidden flex justify-between items-center px-6 mb-4 pb-3 border-b border-[#E3E7EE] dark:border-white/10">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Navigation
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
              title="Close Sidebar"
            >
              <FiChevronLeft size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {filteredTabConfig.map((entry) => {
              if ('children' in entry) {
                const GroupIcon = entry.icon;
                const isOpen = openGroup === entry.name;
                const hasActiveChild = entry.children.some(
                  (child) => child.name === activeTab
                );
                return (
                  <div key={entry.name}>
                    <button
                      onClick={() =>
                        setOpenGroup((prev) =>
                          prev === entry.name ? null : entry.name
                        )
                      }
                      className={`px-5 py-3 text-xs md:text-sm flex items-center gap-3 text-left transition-all border-l-4 border-transparent w-full cursor-pointer ${
                        hasActiveChild
                          ? 'text-[#1F4FE0] dark:text-[#60a5fa] font-semibold'
                          : 'text-[#5B6472] dark:text-gray-400 font-medium hover:bg-[#F8FAFD] dark:hover:bg-white/5'
                      }`}
                    >
                      <GroupIcon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          hasActiveChild
                            ? 'text-[#1F4FE0] dark:text-[#60a5fa]'
                            : 'text-[#5B6472] dark:text-gray-400'
                        }`}
                      />
                      <span className="truncate flex-1">{entry.name}</span>
                      <FiChevronDown
                        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      {entry.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active = activeTab === child.name;
                        return (
                          <button
                            key={child.name}
                            onClick={() => {
                              navigate(`/dashboard/${child.path}`);
                              setMobileMenuOpen(false);
                            }}
                            className={`pl-10 pr-5 py-2.5 text-xs md:text-sm flex items-center gap-3 text-left transition-all border-l-4 w-full cursor-pointer ${
                              active
                                ? 'text-[#0B2545] dark:text-[#60a5fa] font-bold bg-[#E8EEFC] dark:bg-blue-900/20 border-[#1F4FE0]'
                                : 'text-[#5B6472] dark:text-gray-400 font-medium hover:bg-[#F8FAFD] dark:hover:bg-white/5 border-transparent'
                            }`}
                          >
                            <ChildIcon
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                active
                                  ? 'text-[#1F4FE0] dark:text-[#60a5fa]'
                                  : 'text-[#5B6472] dark:text-gray-400'
                              }`}
                            />
                            <span className="truncate">{child.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const Icon = entry.icon;
              const active = activeTab === entry.name;
              return (
                <button
                  key={entry.name}
                  onClick={() => {
                    navigate(
                      entry.path === 'dashboard'
                        ? '/dashboard'
                        : `/dashboard/${entry.path}`
                    );
                    setMobileMenuOpen(false);
                  }}
                  className={`px-5 py-3 text-xs md:text-sm flex items-center gap-3 text-left transition-all border-l-4 w-full ${
                    active
                      ? 'text-[#0B2545] dark:text-[#60a5fa] font-bold bg-[#E8EEFC] dark:bg-blue-900/20 border-[#1F4FE0]'
                      : 'text-[#5B6472] dark:text-gray-400 font-medium hover:bg-[#F8FAFD] dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? 'text-[#1F4FE0] dark:text-[#60a5fa]'
                        : 'text-[#5B6472] dark:text-gray-400'
                    }`}
                  />
                  <span className="truncate">{entry.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden relative">
          {activeTab !== 'Dashboard' && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-1.5 font-12 font-semibold text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} /> Back
            </button>
          )}

          {renderTabContent()}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 text-sm">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Confirmation Modal (used by MyAssetsTab) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#132436] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="font-semibold font-18 text-[#0B2545] dark:text-white mb-2">
                {modalTitle}
              </h3>
              <p className="font-14 text-gray-500 dark:text-gray-400 leading-relaxed">
                {modalText}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg font-12 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onModalConfirm) onModalConfirm();
                  closeConfirm();
                }}
                className="px-4 py-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white font-12 font-semibold rounded-lg shadow-md transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
