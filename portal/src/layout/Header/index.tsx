import { useEffect, useState, useRef, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useOnboarding } from '@/hooks';
import { logout } from '@/redux/slices/authLoginSlice';
import { useShowCorporateKycHeader } from '@/hooks/useShowCorporateKycHeader';
import {
  HeaderNav,
  HeaderBanner,
  HeaderDesktopAuth,
  MobileSidebar,
} from '@/components/Header';
import { setActiveRoute } from '@/redux/slices/uiSlice';
import DashboardNav from '@/components/Header/DashboardNav';
import KycHeader from '@/components/Dashboard/KycHeader';
// import DashboardUserNav from '@/components/Header/DashboardNav/DashboardUserNav';
import ThemeSwitch from '@/components/ThemeSwitch';

const NAV_LINKS_DEFAULT = [
  { label: 'How it works', id: '/how-it-work' },
  { label: 'Clubs', id: '/primary-club' },
  // { label: 'Properties', id: '/properties' },
  { label: 'About', id: '/about' },
  // { label: 'Support', id: '/contact-us' },
];

const NAV_LINKS_AUTH = [
  { label: 'How It Work', id: '/how-it-work' },
  { label: 'Clubs', id: '/primary-club' },
  // { label: 'Properties', id: '/properties' },
  { label: 'Dashboard', id: '/dashboard' },
];

const DASHBOARD_TABS_BY_ROLE = {
  corporateinvestor: [
    // Overview, My Club, KYC Verification & Reports now live in the
    // sidebar (AssetOwnerDashboard shell) — only standalone pages stay here.
    { label: 'My Holdings', path: '/dashboard/holdings' },
    { label: 'Marketplace', path: '/dashboard/marketplace' },
    { label: 'Clubs', path: '/primary-club' },
  ],
  broker: [
    { label: 'Overview', path: '/dashboard' },
    { label: 'KYC Verification', path: '/dashboard/kyc' },
    { label: 'My Assets', path: '/dashboard/assets' },
    { label: 'Leads', path: '/dashboard/leads' },
    { label: 'Commissions', path: '/dashboard/commissions' },
    { label: 'My Holdings', path: '/dashboard/holdings' },
    { label: 'My Club', path: '/dashboard/my-club' },
    { label: 'Marketplace', path: '/dashboard/marketplace' },
    // { label: 'Properties', path: '/dashboard/properties' },
    { label: 'Clubs', path: '/primary-club' },
    // { label: 'RWA', path: '/dashboard/rwa' },
    // { label: 'Asset Onboarding', path: '/dashboard/asset-onboarding' },
    { label: 'Referrals', path: '/dashboard/referrals' },
    { label: 'Transactions and Reports', path: '/dashboard/transactions' },
  ],
  company: [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Onboarding Steps', path: '/dashboard/onboarding' },
    { label: 'My Assets', path: '/dashboard/assets' },
    { label: 'My Holdings', path: '/dashboard/holdings' },
    { label: 'My Club', path: '/dashboard/my-club' },
    { label: 'Marketplace', path: '/dashboard/marketplace' },
    { label: 'Clubs', path: '/primary-club' },
    // { label: 'RWA', path: '/dashboard/rwa' },
    { label: 'Transactions and Reports', path: '/dashboard/transactions' },
  ],
  assetowner: [
    { label: 'Overview', path: '/dashboard' },
    { label: 'KYC Verification', path: '/dashboard/kyc' },
    { label: 'My Assets', path: '/dashboard/assets' },
    { label: 'My Holdings', path: '/dashboard/holdings' },
    { label: 'My Club', path: '/dashboard/my-club' },
    { label: 'Marketplace', path: '/dashboard/marketplace' },
    { label: 'Clubs', path: '/primary-club' },
    // { label: 'RWA', path: '/dashboard/rwa' },
    { label: 'Transactions and Reports', path: '/dashboard/transactions' },
  ],
} as const;

type DashboardRole = keyof typeof DASHBOARD_TABS_BY_ROLE;

export default function Header(): JSX.Element {
  // const { rwaBlocked, rwaOptional } = useOnboarding();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(setActiveRoute(location.pathname));
  }, [location.pathname, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { isAuthenticated, role } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { needsOnboarding } = useOnboarding();

  const pathname = location.pathname;
  const isDashboard = pathname.startsWith('/dashboard');

  // const dashboardRole: DashboardRole =
  //   role === 'company' ? 'company' : 'corporateinvestor';

  const roleLower = role?.toLowerCase() as DashboardRole | undefined;

  const baseTabs =
    isDashboard && roleLower ? (DASHBOARD_TABS_BY_ROLE[roleLower] ?? []) : [];

  const dashboardTabs = baseTabs.filter((tab) => {
    if (tab.path === '/dashboard/kyc' || tab.path === '/dashboard/onboarding') {
      return needsOnboarding;
    }
    return true;
  });

  const isOnCompleteProfile = pathname === '/complete-profile';
  const isKybPage = pathname.includes('/kyb');
  const isKycPage = pathname.includes('/kyc');
  const isRwaPage = pathname.includes('/rwa');
  const isUserKyc = pathname.includes('/user-kyc');
  const isDashboardKycPage = pathname === '/dashboard/kyc';
  const isNotification = pathname === '/notifications';

  const step = useSelector((state: RootState) => state.kyb.step);
  // const userKycStep = useSelector((state: RootState) => state.userKyc.step);
  // const directorKycStep = useSelector(
  //   (state: RootState) => state.directorKyc.step
  // );

  const showCorporateKycHeader = useShowCorporateKycHeader();

  const normalizedRole = role?.toLowerCase();

  const showBanner =
    isAuthenticated &&
    needsOnboarding &&
    normalizedRole !== 'corporateinvestor' &&
    !isOnCompleteProfile &&
    !isKybPage &&
    !isKycPage &&
    !isRwaPage &&
    !isUserKyc &&
    !isDashboard &&
    !isNotification;

  const showKybStepper =
    isAuthenticated && needsOnboarding && isKybPage && step >= 1;

  const showRwaStepper = isAuthenticated && needsOnboarding && isRwaPage;

  const showCompleteProfileDoItLater =
    isAuthenticated && needsOnboarding && isOnCompleteProfile;

  const showKycDoItLater =
    isAuthenticated &&
    needsOnboarding &&
    isKycPage &&
    !isOnCompleteProfile &&
    !isDashboardKycPage;

  const showUserKyc =
    isAuthenticated && needsOnboarding && isUserKyc && !isDashboardKycPage;

  const borderTop =
    showKybStepper ||
    showRwaStepper ||
    showCompleteProfileDoItLater ||
    showKycDoItLater ||
    showUserKyc;
  // ? 'border-b-2 border-white/20'
  // : '';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch({ type: 'APP/RESET' });
    window.location.href = '/login';
  };

  const NAV_LINKS = isAuthenticated ? NAV_LINKS_AUTH : NAV_LINKS_DEFAULT;

  return (
    <>
      <div className="w-full fixed top-0 left-0 z-50 bg-[var(--bg)] text-[var(--fg)] border-b border-[var(--fg)]/15">
        <nav
          className={`w-full z-40 font-work ${
            scrolled ? 'min-h-10' : 'min-h-15 lg:min-h-20'
          }`}
        >
          <div className={`w-full px-4 lg:px-10 ${borderTop}`}>
            <div className="mx-auto py-4 flex flex-col gap-3 max-w-[1600px]">
              <div className="w-full flex justify-between items-center gap-3">
                <div className="flex flex-row items-center justify-between">
                  <HeaderNav navLinks={isDashboard ? [] : NAV_LINKS} />
                  {/* {isDashboard && roleLower === 'corporateinvestor' && (
                    <DashboardUserNav tabs={dashboardTabs} />
                  )} */}
                </div>
                <div className="flex gap-4 items-center justify-center">
                  {!isAuthenticated && <ThemeSwitch />}
                  <HeaderDesktopAuth
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    dropdownRef={dropdownRef}
                    onMenuOpen={() => setOpen(true)}
                    handleLogout={handleLogout}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {isDashboard &&
          normalizedRole !== 'assetowner' &&
          normalizedRole !== 'corporateinvestor' &&
          normalizedRole !== 'broker' &&
          normalizedRole !== 'company' && <DashboardNav tabs={dashboardTabs} />}

        {/* <HeaderSteppers
          step={step}
          userKycStep={userKycStep}
          showKybStepper={showKybStepper}
          showRwaStepper={showRwaStepper}
          showCompleteProfileDoItLater={showCompleteProfileDoItLater}
          showKycDoItLater={showKycDoItLater}
          showUserKyc={showUserKyc}
          directorKycStep={directorKycStep}
          rwaOptional={rwaOptional}
          rwaBlocked={rwaBlocked}
          isAuthenticated={isAuthenticated}
        /> */}

        {showCorporateKycHeader && <KycHeader scrolled={scrolled} />}
        {showBanner && <HeaderBanner scrolled={scrolled} />}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <MobileSidebar
        open={open}
        sidebarRef={sidebarRef}
        close={() => setOpen(false)}
        handleLogout={handleLogout}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
