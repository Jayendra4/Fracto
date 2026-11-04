import { useState, useEffect, useRef, type JSX } from 'react';
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  Home,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  PlusCircle,
  Wallet as WalletIcon,
  FileText,
  MessageSquare,
  TrendingUp,
  // BarChart3,
  Settings,
  ClubIcon,
  Compass,
  // Store,
  ArrowLeftRight,
  Briefcase,
  Users,
  type LucideIcon,
} from 'lucide-react';

import OverviewTab from './AssetOwner/tabs/OverviewTab';
import InvestorOverviewTab from './AssetOwner/tabs/InvestorOverviewTab';
import Kyc from '../Kyc';
import Wallet from '../Wallet';
import Profile from '../Profile';
import MyAssetsTab from './AssetOwner/tabs/MyAssetsTab';
import AddAssetTab from './AssetOwner/tabs/AddAssetTab';
import DocumentsTab from './AssetOwner/tabs/DocumentsTab';
import InvestorInterestTab from './AssetOwner/tabs/InvestorInterestTab';
import ReportsTab from './AssetOwner/tabs/ReportsTab';
import MyClub from '../MyClub';
import GovernanceTab from './AssetOwner/tabs/GovernanceTab';
import ReturnsDashboardTab from './AssetOwner/tabs/ReturnsDashboardTab';
import InvestorDocumentsTab from './AssetOwner/tabs/InvestorDocumentsTab';
import Referrals from '../Referrals';
import Chat from '../Chat';
import DiscoverClubsTab from './AssetOwner/tabs/DiscoverClubsTab';
import AssetMarketplaceTab from './AssetOwner/tabs/AssetMarketplaceTab';
import Holdings from '../Holdings';
import HoldingDetail from '../Holdings/HoldingDetail';
import Marketplace from '../Marketplace';
import MarketplaceDetails from '../Marketplace/MarketplaceDetails';
import JoinGroup from '../../CommunityOfHouse/JoinGroup';
import SavedAssets from '@/pages/SavedAssets/SavedAssets';
import Onboarding from '../Onboarding';
import CompanyKyb from '@/pages/Private/CompanyKyb';
import DirectorKyc from '@/pages/Private/DirectorKyc';
import Transactions from '../Transactions';
import ReferredAssets from '@/pages/Private/Rwa/ReferredAssets';
import ReferredAssetDetail from '@/pages/Private/Rwa/RefferedAssetDetail';
import PropertyFractionDetails from '@/components/Dashboard/Assets/PropertyFractionDetails';

interface SidebarItem {
  page: string;
  label: string;
  icon: LucideIcon;
  path?: string;
}

interface SidebarGroup {
  label: string;
  icon: LucideIcon;
  children: SidebarItem[];
}

type SidebarEntry = SidebarItem | SidebarGroup;

// Reskins standalone pages (KYC, Wallet, Profile — all built with the app's
// general CustomInput/CustomButton/CustomSelect components) to match this
// dashboard's compact light/dark theme, without forking those shared components.
export const DASHBOARD_THEME_OVERRIDE = `
  [&_h1]:font-serif! [&_h1]:font-24! [&_h1]:md:font-30! [&_h1]:font-semibold!
  [&_h1]:text-[#0B2545]! [&_h1]:dark:text-white!
  [&_h2]:font-serif! [&_h2]:font-24! [&_h2]:md:font-30! [&_h2]:font-semibold!
  [&_h2]:text-[#0B2545]! [&_h2]:dark:text-white!
  [&_h3]:font-14! [&_h3]:md:font-16! [&_h3]:font-semibold!
  [&_h3]:text-[#0B2545]! [&_h3]:dark:text-white!
  [&_input]:bg-gray-50! [&_input]:dark:bg-white/5!
  [&_input]:border! [&_input]:border-gray-300! [&_input]:dark:border-white/10!
  [&_input]:rounded-lg! [&_input]:py-2! [&_input]:px-3!
  [&_input]:text-[12px]! [&_input]:font-normal! [&_input]:shadow-none!
  [&_textarea]:bg-gray-50! [&_textarea]:dark:bg-white/5!
  [&_textarea]:border! [&_textarea]:border-gray-300! [&_textarea]:dark:border-white/10!
  [&_textarea]:rounded-lg! [&_textarea]:text-[12px]! [&_textarea]:shadow-none!
  [&_label]:text-[12px]! [&_label]:font-medium! [&_label]:h-auto! [&_label]:mb-2!
  [&_label]:text-gray-500! [&_label]:dark:text-gray-400!
  [&_button.text-left]:bg-gray-50! [&_button.text-left]:dark:bg-white/5!
  [&_button.text-left]:border! [&_button.text-left]:border-gray-300! [&_button.text-left]:dark:border-white/10!
  [&_button.text-left]:rounded-lg! [&_button.text-left]:py-2! [&_button.text-left]:px-3!
  [&_button.text-left]:text-[12px]! [&_button.text-left]:font-normal! [&_button.text-left]:shadow-none!
  [&_button:not([type])]:bg-white! [&_button:not([type])]:dark:bg-white/5!
  [&_button:not([type])]:border! [&_button:not([type])]:border-[#E3E7EE]! [&_button:not([type])]:dark:border-white/10!
  [&_button:not([type])]:text-gray-800! [&_button:not([type])]:dark:text-white!
  [&_button:not([type])]:rounded-lg! [&_button:not([type])]:py-2! [&_button:not([type])]:px-4!
  [&_button:not([type])]:text-[12px]! [&_button:not([type])]:font-semibold!
  [&_button.bg-transparent]:bg-white! [&_button.bg-transparent]:dark:bg-white/5!
  [&_button.bg-transparent]:border! [&_button.bg-transparent]:border-[#E3E7EE]! [&_button.bg-transparent]:dark:border-white/10!
  [&_button.bg-transparent]:text-gray-800! [&_button.bg-transparent]:dark:text-white!
  [&_button.bg-transparent]:rounded-lg! [&_button.bg-transparent]:py-2! [&_button.bg-transparent]:px-4!
  [&_button.bg-transparent]:text-[12px]! [&_button.bg-transparent]:font-semibold!
  [&_button[type=submit]]:bg-[#1F4FE0]! [&_button[type=submit]]:bg-none!
  [&_button[type=submit]]:text-white! [&_button[type=submit]]:rounded-lg!
  [&_button[type=submit]]:py-2! [&_button[type=submit]]:px-4!
  [&_button[type=submit]]:text-[12px]! [&_button[type=submit]]:font-semibold!
  [&_button[type=submit]]:shadow-md! [&_button[type=submit]]:mt-0!
  [&_button[type=submit]]:hover:bg-[#153eb2]! [&_button[type=submit]]:hover:brightness-100!
  [&_button[type=button]:not(.text-left)]:bg-[#1F4FE0]! [&_button[type=button]:not(.text-left)]:bg-none!
  [&_button[type=button]:not(.text-left)]:text-white! [&_button[type=button]:not(.text-left)]:rounded-lg!
  [&_button[type=button]:not(.text-left)]:py-2! [&_button[type=button]:not(.text-left)]:px-4!
  [&_button[type=button]:not(.text-left)]:text-[12px]! [&_button[type=button]:not(.text-left)]:font-semibold!
  [&_button[type=button]:not(.text-left)]:shadow-md! [&_button[type=button]:not(.text-left)]:mt-0!
  [&_button[type=button]:not(.text-left):disabled]:opacity-50!
  [&_.bg-green-500]:bg-[#1F4FE0]!
`;

export default function AssetOwnerDashboard(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  // Shared :id param for whichever route matched (my-holdings/:id or
  // marketplace/:id) — only one of those sections is ever active at once.
  const { id: routeIdParam } = useParams<{ id: string }>();
  const { role, user } = useSelector((state: RootState) => state.authLogin);
  const normalizedRole = (role || user?.type || user?.role || '').toLowerCase();
  const isCorporateInvestor = normalizedRole === 'corporateinvestor';

  // Match the active page based on route path
  let activePage:
    | 'dashboard'
    | 'kyc'
    | 'onboarding'
    | 'kyb'
    | 'onboarding-kyc'
    | 'onboarding-user-kyc'
    | 'my-club'
    | 'my-assets'
    | 'add-asset'
    | 'wallet'
    | 'documents'
    | 'messages'
    | 'interest'
    | 'reports'
    | 'settings'
    | 'clubs-section'
    | 'spv-list'
    | 'governance'
    | 'my-holdings'
    | 'returns-dashboard'
    | 'refer-earn'
    | 'marketplace'
    | 'primary-club-details'
    | 'referred-assets'
    | 'property-fraction-details' = 'dashboard';
  const path = location.pathname.replace(/\/$/, ''); // Remove trailing slash
  if (path.endsWith('/onboarding/kyc')) {
    activePage = 'onboarding-kyc';
  } else if (path.endsWith('/onboarding/user-kyc')) {
    activePage = 'onboarding-user-kyc';
  } else if (path.endsWith('/kyc')) {
    activePage = 'kyc';
  } else if (path.endsWith('/onboarding/kyb')) {
    activePage = 'kyb';
  } else if (path.endsWith('/onboarding')) {
    activePage = 'onboarding';
  } else if (path.includes('/my-club')) {
    activePage = 'my-club';
  } else if (path.endsWith('/my-assets')) {
    activePage = 'my-assets';
  } else if (path.endsWith('/add-asset')) {
    activePage = 'add-asset';
  } else if (path.endsWith('/wallet')) {
    activePage = 'wallet';
  } else if (path.endsWith('/documents')) {
    activePage = 'documents';
  } else if (path.endsWith('/messages')) {
    activePage = 'messages';
  } else if (path.endsWith('/interest')) {
    activePage = 'interest';
  } else if (path.endsWith('/reports')) {
    activePage = 'reports';
  } else if (path.endsWith('/settings') || path.endsWith('/profile')) {
    activePage = 'settings';
  } else if (
    path.endsWith('/clubs-section') ||
    path.endsWith('/discover-clubs')
  ) {
    activePage = 'clubs-section';
  } else if (path.endsWith('/spv-list')) {
    activePage = 'spv-list';
  } else if (path.endsWith('/governance')) {
    activePage = 'governance';
  } else if (path.includes('/my-holdings') || path.includes('/holdings')) {
    activePage = 'my-holdings';
  } else if (path.endsWith('/returns-dashboard')) {
    activePage = 'returns-dashboard';
  } else if (path.endsWith('/refer-earn')) {
    activePage = 'refer-earn';
  } else if (path.includes('/marketplace')) {
    activePage = 'marketplace';
  } else if (path.includes('/primary-club-details')) {
    activePage = 'primary-club-details';
  } else if (path.includes('/rwa/referred-assets')) {
    activePage = 'referred-assets';
  } else if (path.includes('/PropertyFractionDetails/')) {
    activePage = 'property-fraction-details';
  }

  // "My Assets" page's Listed/Holdings toggle — switched via local state only,
  // not navigation, so it stays on a single URL (/dashboard/my-assets)
  // instead of bouncing between /dashboard/my-assets and /dashboard/my-holdings.
  const [myAssetsSubTab, setMyAssetsSubTab] = useState<'listed' | 'holdings'>(
    activePage === 'my-holdings' ? 'holdings' : 'listed'
  );
  useEffect(() => {
    if (path.endsWith('/my-holdings') || path.endsWith('/holdings')) {
      setMyAssetsSubTab('holdings');
    } else if (path.endsWith('/my-assets')) {
      setMyAssetsSubTab('listed');
    }
  }, [path]);

  // Detail View & Sub-Tab States
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<
    null | 'sora' | 'crescent'
  >(null);
  const [soraTab, setSoraTab] = useState<
    'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  >('overview');
  const [crescentTab, setCrescentTab] = useState<
    'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  >('overview');
  const [aaIndex, setAaIndex] = useState(1);

  // Sync route query params to internal sub-tabs
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const assetParam = searchParams.get('asset');
    const tabParam = searchParams.get('tab');
    const stepParam = searchParams.get('step');

    if (assetParam === 'sora' || assetParam === 'crescent') {
      setSelectedAssetDetail(assetParam);
    } else {
      setSelectedAssetDetail(null);
    }

    if (
      tabParam === 'overview' ||
      tabParam === 'lifecycle' ||
      tabParam === 'distributions' ||
      tabParam === 'docsgov'
    ) {
      if (assetParam === 'sora') {
        setSoraTab(tabParam);
      } else if (assetParam === 'crescent') {
        setCrescentTab(tabParam);
      }
    }

    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (!isNaN(stepNum)) {
        setAaIndex(stepNum);
      }
    } else {
      // No step in the URL — always start a fresh Add Asset flow at Step 1
      // (aaIndex otherwise persists from a previous session since this
      // component doesn't unmount on dashboard tab switches).
      setAaIndex(1);
    }
  }, [location.search]);

  // Signoff state
  const [crescentSignoffNote, setCrescentSignoffNote] = useState('');
  const [crescentSignoffStatus, setCrescentSignoffStatus] = useState<
    'pending' | 'agreed' | 'objected'
  >('pending');

  // Calculator inputs & values
  const [fpHasRental, setFpHasRental] = useState(true);
  const [fpHasTimeshare, setFpHasTimeshare] = useState(false);
  const [fpValue, setFpValue] = useState('90000000');
  const [fpRaise, setFpRaise] = useState('36000000');
  const [fpRent, setFpRent] = useState('525000');
  const [fpEsc, setFpEsc] = useState('5');
  const [fpOpex, setFpOpex] = useState('18');
  const [fpHold, setFpHold] = useState('5');
  const [fpTsNights, setFpTsNights] = useState('150');
  const [fpTsRate, setFpTsRate] = useState('9500');
  const [fpTsFee, setFpTsFee] = useState('12');
  const [fpSaleMargin, setFpSaleMargin] = useState('20');

  // Calculated Outputs
  const [calcOutputs, setCalcOutputs] = useState({
    grossYield: '—',
    netYield: '—',
    tsYield: '—',
    distVal: '—',
    irrRange: '—',
    cons: { yield: '—', val: '—', irr: '—' },
    base: { yield: '—', val: '—', irr: '—' },
    opt: { yield: '—', val: '—', irr: '—' },
    kpiVal: '₹47.2Cr',
    kpiRaisedSub: '39% of listed value',
    kpiValueLiveTag: false,
    kpiValueSub: 'Across portfolio',
  });

  // Mobile sidebar toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar dropdown groups (CorporateInvestor's "My Holdings" / "Management")
  // — only one group stays expanded at a time.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const lastActiveGroupRef = useRef<string | null>(null);

  // Asset owners can also be investors — let them switch between the two
  // dashboard views on the same 'dashboard' page instead of picking one.
  const [ownerDashboardView, setOwnerDashboardView] = useState<
    'owner' | 'investor'
  >('owner');

  // Custom Modal State — kept as one object (was 4 separate useState calls
  // that were always read/written together) so a confirm-dialog open/close
  // triggers a single re-render instead of up to 4.
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    text: string;
    onConfirm: (() => void) | null;
  }>({ open: false, title: '', text: '', onConfirm: null });

  // Recalculate yields on input changes
  useEffect(() => {
    const valueNum = parseFloat(fpValue) || 0;
    const raiseNum = parseFloat(fpRaise) || 0;
    const rentNum = parseFloat(fpRent) || 0;
    const escNum = parseFloat(fpEsc) || 0;
    const opexNum = parseFloat(fpOpex) || 18;
    const tsNightsNum = parseFloat(fpTsNights) || 0;
    const tsRateNum = parseFloat(fpTsRate) || 0;
    const tsFeeNum = parseFloat(fpTsFee) || 12;

    let computedNetYield = 0;
    let baseIRR = 0;
    let gYield = '—';
    let nYield = '—';
    let tYield = '—';
    let dVal = '—';
    let iRange = '—';

    let consData = { yield: '—', val: '—', irr: '—' };
    let baseData = { yield: '—', val: '—', irr: '—' };
    let optData = { yield: '—', val: '—', irr: '—' };

    if (fpHasRental && valueNum > 0 && rentNum > 0) {
      const annualRent = rentNum * 12;
      const gross = (annualRent / valueNum) * 100;
      computedNetYield = gross * (1 - opexNum / 100);
      const distPerLakh = (computedNetYield / 100) * 100000;
      baseIRR = computedNetYield + escNum / 2;

      gYield = `${gross.toFixed(1)}%`;
      nYield = `${computedNetYield.toFixed(1)}%`;
      dVal = `₹${distPerLakh.toFixed(0)}/yr`;
    }

    if (fpHasTimeshare && valueNum > 0 && tsNightsNum > 0 && tsRateNum > 0) {
      const tsGrossAnnual = tsNightsNum * tsRateNum;
      const tsGrossYield = (tsGrossAnnual / valueNum) * 100;
      const tsNetYield = tsGrossYield * (1 - tsFeeNum / 100);
      tYield = `${tsNetYield.toFixed(1)}%`;
      if (!fpHasRental) {
        baseIRR = tsNetYield + 2;
      }
    }

    if (baseIRR > 0) {
      iRange = `${(baseIRR - 1.5).toFixed(1)}–${(baseIRR + 1.5).toFixed(1)}%`;

      const scenarios = {
        cons: { yieldAdj: -1.2, valAdj: 18, irrAdj: -2.3 },
        base: { yieldAdj: 0, valAdj: 26, irrAdj: 0 },
        opt: { yieldAdj: 1.2, valAdj: 35, irrAdj: 2.4 },
      };

      consData = {
        yield: `${(computedNetYield + scenarios.cons.yieldAdj).toFixed(1)}%`,
        val: `+${scenarios.cons.valAdj}%`,
        irr: `${(baseIRR + scenarios.cons.irrAdj).toFixed(1)}%`,
      };
      baseData = {
        yield: `${(computedNetYield + scenarios.base.yieldAdj).toFixed(1)}%`,
        val: `+${scenarios.base.valAdj}%`,
        irr: `${(baseIRR + scenarios.base.irrAdj).toFixed(1)}%`,
      };
      optData = {
        yield: `${(computedNetYield + scenarios.opt.yieldAdj).toFixed(1)}%`,
        val: `+${scenarios.opt.valAdj}%`,
        irr: `${(baseIRR + scenarios.opt.irrAdj).toFixed(1)}%`,
      };
    }

    // Update Dashboard KPIs live from this draft asset's entered value
    const baseValueCr = 47.2;
    const baseRaiseCr = 18.6;
    const draftValueCr = valueNum / 10000000;

    let kpiVal = '₹47.2Cr';
    let kpiRaisedSub = '39% of listed value';
    let kpiValueLiveTag = false;
    let kpiValueSub = 'Across portfolio';

    if (valueNum > 0) {
      kpiVal = `₹${(baseValueCr + draftValueCr).toFixed(1)}Cr`;
      kpiValueSub = 'Across portfolio (incl. Lakeview draft)';
      kpiValueLiveTag = true;

      if (raiseNum > 0) {
        const newRaisedPct = (
          (baseRaiseCr / (baseValueCr + draftValueCr)) *
          100
        ).toFixed(0);
        kpiRaisedSub = `${newRaisedPct}% of updated listed value`;
      }
    }

    setCalcOutputs({
      grossYield: gYield,
      netYield: nYield,
      tsYield: tYield,
      distVal: dVal,
      irrRange: iRange,
      cons: consData,
      base: baseData,
      opt: optData,
      kpiVal,
      kpiRaisedSub,
      kpiValueLiveTag,
      kpiValueSub,
    });
  }, [
    fpHasRental,
    fpHasTimeshare,
    fpValue,
    fpRaise,
    fpRent,
    fpEsc,
    fpOpex,
    fpHold,
    fpTsNights,
    fpTsRate,
    fpTsFee,
    fpSaleMargin,
  ]);

  const showConfirm = (title: string, text: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, title, text, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  const allSidebarLinks: SidebarEntry[] = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'kyc', label: 'My Onboarding', icon: ShieldCheck },
    { page: 'clubs-section', label: 'Discover Club', icon: Compass },
    { page: 'add-asset', label: 'Add Asset', icon: PlusCircle },
    {
      label: 'My Holdings',
      icon: Briefcase,
      children: [
        { page: 'my-assets', label: 'My Assets', icon: Building2 },
        { page: 'my-club', label: 'My Club', icon: ClubIcon },
        // { page: 'spv-list', label: 'SPV List', icon: Store },
      ],
    },
    {
      page: 'marketplace',
      label: 'Secondary Marketplace',
      icon: ArrowLeftRight,
    },
    {
      page: 'referred-assets',
      label: 'Broker Referred Assets',
      icon: Users,
      path: '/dashboard/rwa/referred-assets',
    },
    { page: 'wallet', label: 'Wallet', icon: WalletIcon },
    {
      label: 'Management',
      icon: FileText,
      children: [
        { page: 'interest', label: 'Investor Interest', icon: TrendingUp },
        { page: 'documents', label: 'Documents & Compliance', icon: FileText },
        { page: 'messages', label: 'Messages', icon: MessageSquare },
        { page: 'settings', label: 'Profile & Settings', icon: Settings },
      ],
    },
  ];

  // Corporate investors don't own assets, so they get their own sidebar
  // (asset-owner-only sections like My Assets/Add Asset/Investor Interest
  // are irrelevant to them) with investor-focused pages, grouped into
  // dropdowns (My Holdings / Management) to match the broker sidebar.
  const corporateInvestorLinks: SidebarEntry[] = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'kyc', label: 'My Onboarding', icon: ShieldCheck },
    { page: 'clubs-section', label: 'Discover Club', icon: Compass },
    {
      label: 'My Holdings',
      icon: Briefcase,
      children: [
        { page: 'my-club', label: 'My Clubs', icon: ClubIcon },
        { page: 'my-holdings', label: 'My Assets', icon: Briefcase },
        // { page: 'spv-list', label: 'SPV List', icon: Store },
      ],
    },
    {
      page: 'marketplace',
      label: 'Secondary Marketplace',
      icon: ArrowLeftRight,
    },
    { page: 'wallet', label: 'My Wallet', icon: WalletIcon },
    {
      label: 'Management',
      icon: FileText,
      children: [
        { page: 'messages', label: 'Messages', icon: MessageSquare },
        { page: 'documents', label: 'Documents', icon: FileText },
      ],
    },
    { page: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  // Company accounts get the exact same sidebar as asset owners — the only
  // difference is the verification step: AssetOwner does individual KYC,
  // Company does the Onboarding Steps wizard (KYB + Directors KYC) instead,
  // rendered inside this same shell (see the 'onboarding' activePage below).
  const companyLinksAll: SidebarEntry[] = allSidebarLinks.map((link) =>
    'page' in link && link.page === 'kyc'
      ? {
          page: 'onboarding',
          label: 'Onboarding Steps',
          icon: ShieldCheck,
          path: '/dashboard/onboarding',
        }
      : link
  );

  // Once a Company's KYC AND KYB are both Approved, "Onboarding Steps" has
  // nothing left to do — hide it from the sidebar.
  const companyLinks =
    user?.kycStatus === 'Approved' && user?.kybStatus === 'Approved'
      ? companyLinksAll.filter(
          (link) => !('page' in link) || link.page !== 'onboarding'
        )
      : companyLinksAll;

  // Once an AssetOwner's / CorporateInvestor's KYC is Approved, "My
  // Onboarding" has nothing left to do — hide it from the sidebar.
  const assetOwnerLinksBase =
    user?.kycStatus === 'Approved'
      ? allSidebarLinks.filter(
          (link) => !('page' in link) || link.page !== 'kyc'
        )
      : allSidebarLinks;

  // Plain investors don't own assets in the "My Holdings" sense the way
  // asset owners do — the dropdown there is really their asset list, so
  // relabel it "My Assets" for that role only.
  const assetOwnerLinks =
    normalizedRole === 'investor'
      ? assetOwnerLinksBase.map((link) =>
          'children' in link && link.label === 'My Holdings'
            ? { ...link, label: 'My Assets' }
            : link
        )
      : assetOwnerLinksBase;

  const corporateInvestorLinksFiltered =
    user?.kycStatus === 'Approved'
      ? corporateInvestorLinks.filter(
          (link) => 'children' in link || link.page !== 'kyc'
        )
      : corporateInvestorLinks;

  const sidebarLinks = isCorporateInvestor
    ? corporateInvestorLinksFiltered
    : normalizedRole === 'company'
      ? companyLinks
      : assetOwnerLinks;

  // Whichever dropdown group contains the active page should be expanded.
  // Computed synchronously (not via useEffect) so it lands in the very
  // first render after navigation — an effect-based version applies one
  // render late, which briefly shows the group collapsed and then makes it
  // pop back open, reading as the dropdown "closing" when a child is clicked.
  if (isCorporateInvestor) {
    const activeGroupLabel =
      corporateInvestorLinks.find(
        (entry): entry is SidebarGroup =>
          'children' in entry &&
          entry.children.some((child) => child.page === activePage)
      )?.label ?? null;

    if (
      activeGroupLabel !== null &&
      lastActiveGroupRef.current !== activeGroupLabel
    ) {
      lastActiveGroupRef.current = activeGroupLabel;
      if (openGroup !== activeGroupLabel) {
        setOpenGroup(activeGroupLabel);
      }
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white pt-[60px] md:pt-[80px] transition-all duration-300">
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
        {/* Sidebar Container */}
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
            <Home className="w-4 h-4 shrink-0" />
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
            {sidebarLinks.map((link) => {
              if ('children' in link) {
                const GroupIcon = link.icon;
                const isOpen = openGroup === link.label;
                const hasActiveChild = link.children.some(
                  (child) =>
                    child.page === activePage ||
                    (child.page === 'my-assets' && activePage === 'my-holdings')
                );
                return (
                  <div key={link.label}>
                    <button
                      onClick={() =>
                        setOpenGroup((prev) =>
                          prev === link.label ? null : link.label
                        )
                      }
                      className={`px-5 py-3 font-14 flex items-center gap-3 text-left transition-all border-l-4 border-transparent w-full cursor-pointer ${
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
                      <span className="truncate flex-1">{link.label}</span>
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
                      {link.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active =
                          activePage === child.page ||
                          (child.page === 'my-assets' &&
                            activePage === 'my-holdings');
                        return (
                          <button
                            key={child.page}
                            onClick={() => {
                              navigate(
                                child.path ?? `/dashboard/${child.page}`
                              );
                              setMobileMenuOpen(false);
                            }}
                            className={`pl-10 pr-5 py-2.5 font-14 flex items-center gap-3 text-left transition-all border-l-4 w-full cursor-pointer ${
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
                            <span className="truncate">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const linkPath = 'path' in link ? link.path : undefined;
              const active = linkPath
                ? path === linkPath.replace(/\/$/, '')
                : activePage === link.page;
              const IconComponent = link.icon;
              return (
                <button
                  key={link.page}
                  onClick={() => {
                    navigate(
                      linkPath ??
                        (link.page === 'dashboard'
                          ? '/dashboard'
                          : `/dashboard/${link.page}`)
                    );
                    setMobileMenuOpen(false);
                  }}
                  className={`px-5 py-3 font-14 flex items-center gap-3 text-left transition-all border-l-4 ${
                    active
                      ? 'text-[#0B2545] dark:text-[#60a5fa] font-bold bg-[#E8EEFC] dark:bg-blue-900/20 border-[#1F4FE0]'
                      : 'text-[#5B6472] dark:text-gray-400 font-medium hover:bg-[#F8FAFD] dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? 'text-[#1F4FE0] dark:text-[#60a5fa]'
                        : 'text-[#5B6472] dark:text-gray-400'
                    }`}
                  />
                  <span className="truncate">{link.label}</span>
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
          {activePage !== 'dashboard' && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-1.5 font-12 font-semibold text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} /> Back
            </button>
          )}

          {activePage === 'kyc' && (
            <div
              className={`[&>div]:pt-0! [&>div]:px-0! [&>div]:min-h-0! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <Kyc />
            </div>
          )}

          {activePage === 'onboarding' && (
            <div
              className={`[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section]:px-0! [&_>section>div]:pt-0!
              [--fg:#0B2545] dark:[--fg:#ffffff]
              [--inner-card:#ffffff] dark:[--inner-card:#132436]
              [--card:#ffffff] dark:[--card:#132436]
              [--primary:#1F4FE0] dark:[--primary:#60a5fa]
              ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <Onboarding />
            </div>
          )}

          {activePage === 'kyb' && (
            <div
              className={`[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0! [&>section>div]:pt-0! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <CompanyKyb />
            </div>
          )}

          {activePage === 'onboarding-kyc' && (
            <div
              className={`[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0! [&>section>div]:pt-0! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <DirectorKyc />
            </div>
          )}

          {activePage === 'onboarding-user-kyc' && (
            <div
              className={`[&>section]:pt-0! [&>section]:pb-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0! [&>section>div]:pt-0! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <Kyc />
            </div>
          )}

          {activePage === 'wallet' && (
            <div
              className={`[&>section]:pt-0! [&>section]:px-0! [&>section]:py-0! [&>section]:h-auto! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <Wallet />
            </div>
          )}

          {activePage === 'dashboard' &&
            (isCorporateInvestor ? (
              <InvestorOverviewTab navigate={navigate} />
            ) : normalizedRole === 'assetowner' ||
              normalizedRole === 'company' ? (
              <div className="space-y-5">
                <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10">
                  <button
                    onClick={() => setOwnerDashboardView('owner')}
                    className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                      ownerDashboardView === 'owner'
                        ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {normalizedRole === 'company' ? 'Company' : 'Asset Owner'}
                  </button>
                  <button
                    onClick={() => setOwnerDashboardView('investor')}
                    className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                      ownerDashboardView === 'investor'
                        ? 'bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Investor
                  </button>
                </div>

                {ownerDashboardView === 'owner' ? (
                  <OverviewTab navigate={navigate} />
                ) : (
                  <InvestorOverviewTab navigate={navigate} />
                )}
              </div>
            ) : (
              <OverviewTab navigate={navigate} />
            ))}

          {activePage === 'my-club' && (
            <div className="[&>section]:pt-0! [&>section]:px-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
              <MyClub />
            </div>
          )}

          {(activePage === 'my-assets' || activePage === 'my-holdings') && (
            <div className="space-y-4">
              {!(path.endsWith('/saved-assets') || routeIdParam) && (
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
              )}

              {myAssetsSubTab === 'holdings' ? (
                <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent! [&>section>div]:px-0! [&_.py-5.mb-6]:py-0!">
                  {path.endsWith('/saved-assets') ? (
                    <SavedAssets />
                  ) : routeIdParam ? (
                    <HoldingDetail />
                  ) : (
                    <Holdings />
                  )}
                </div>
              ) : (
                <MyAssetsTab
                  navigate={navigate}
                  selectedAssetDetail={selectedAssetDetail}
                  setSelectedAssetDetail={(val) => {
                    if (val) {
                      navigate(`/dashboard/my-assets?asset=${val}`);
                    } else {
                      navigate('/dashboard/my-assets');
                    }
                  }}
                  soraTab={soraTab}
                  setSoraTab={(val) =>
                    navigate(`/dashboard/my-assets?asset=sora&tab=${val}`)
                  }
                  crescentTab={crescentTab}
                  setCrescentTab={(val) =>
                    navigate(`/dashboard/my-assets?asset=crescent&tab=${val}`)
                  }
                  showConfirm={showConfirm}
                  crescentSignoffStatus={crescentSignoffStatus}
                  setCrescentSignoffStatus={setCrescentSignoffStatus}
                  crescentSignoffNote={crescentSignoffNote}
                  setCrescentSignoffNote={setCrescentSignoffNote}
                />
              )}
            </div>
          )}

          {activePage === 'add-asset' && (
            <AddAssetTab
              aaIndex={aaIndex}
              setAaIndex={(val) => {
                const params = new URLSearchParams(location.search);
                params.set('step', String(val));
                navigate(`/dashboard/add-asset?${params.toString()}`);
              }}
              showConfirm={showConfirm}
              fpHasRental={fpHasRental}
              setFpHasRental={setFpHasRental}
              fpHasTimeshare={fpHasTimeshare}
              setFpHasTimeshare={setFpHasTimeshare}
              fpValue={fpValue}
              setFpValue={setFpValue}
              fpRaise={fpRaise}
              setFpRaise={setFpRaise}
              fpRent={fpRent}
              setFpRent={setFpRent}
              fpEsc={fpEsc}
              setFpEsc={setFpEsc}
              fpOpex={fpOpex}
              setFpOpex={setFpOpex}
              fpHold={fpHold}
              setFpHold={setFpHold}
              fpTsNights={fpTsNights}
              setFpTsNights={setFpTsNights}
              fpTsRate={fpTsRate}
              setFpTsRate={setFpTsRate}
              fpTsFee={fpTsFee}
              setFpTsFee={setFpTsFee}
              fpSaleMargin={fpSaleMargin}
              setFpSaleMargin={setFpSaleMargin}
              calcOutputs={calcOutputs}
            />
          )}

          {activePage === 'documents' &&
            (isCorporateInvestor ? <InvestorDocumentsTab /> : <DocumentsTab />)}

          {activePage === 'messages' && (
            <div className="space-y-6">
              <div className="pagehead">
                <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                  Messages
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                  Direct conversations with Admin and other members.
                </p>
              </div>
              <div className="bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-hidden [&>section]:pt-0! [&>section]:h-[600px]! [&>section]:min-h-0!">
                <Chat />
              </div>
            </div>
          )}

          {activePage === 'interest' && <InvestorInterestTab />}

          {activePage === 'reports' &&
            (normalizedRole === 'company' ? (
              <div className="[&>div]:pt-0! [&>div]:px-0! [&>div]:pb-0!">
                <Transactions />
              </div>
            ) : (
              <ReportsTab />
            ))}

          {activePage === 'clubs-section' && <DiscoverClubsTab />}

          {activePage === 'spv-list' && <AssetMarketplaceTab />}

          {activePage === 'governance' && <GovernanceTab />}

          {activePage === 'marketplace' && (
            <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
              {routeIdParam ? <MarketplaceDetails /> : <Marketplace />}
            </div>
          )}

          {activePage === 'primary-club-details' && (
            <div className="[&>div]:bg-transparent! [&>div>div]:mt-0! [&>div>div]:min-h-0! [&>div>div]:py-0!">
              <JoinGroup />
            </div>
          )}

          {activePage === 'referred-assets' && (
            <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
              {routeIdParam ? <ReferredAssetDetail /> : <ReferredAssets />}
            </div>
          )}

          {activePage === 'property-fraction-details' && (
            <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
              <PropertyFractionDetails />
            </div>
          )}

          {activePage === 'returns-dashboard' && <ReturnsDashboardTab />}

          {activePage === 'refer-earn' && (
            <div className="[&>section]:pt-0! [&>section]:px-0! [&>section]:pb-0!">
              <Referrals />
            </div>
          )}

          {activePage === 'settings' && (
            <div
              className={`[&_section]:pt-0! [&_section]:px-0! [&_section]:min-h-0! ${DASHBOARD_THEME_OVERRIDE}`}
            >
              <Profile />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#132436] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="font-semibold font-18 text-[#0B2545] dark:text-white mb-2">
                {confirmModal.title}
              </h3>
              <p className="font-14 text-gray-500 dark:text-gray-400 leading-relaxed">
                {confirmModal.text}
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
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
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
