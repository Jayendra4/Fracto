import { Link, useLocation } from 'react-router-dom';
import { IoCloseSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { scrollToSection, getUserName } from '@/utils';
import { formatRole } from '@/types/roles';
import {
  FaRegEdit,
  FaHome,
  // FaBuilding,
  FaInfoCircle,
  FaTachometerAlt,
  FaWallet,
  FaAngleRight,
  FaUserPlus,
  FaArrowRight,
  FaQuestionCircle,
} from 'react-icons/fa';
import { FiShield, FiLogOut, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { useLocalUser } from '@/hooks/useLocalUser';
import { useOnboarding } from '@/hooks';
import { ThemeSwitchMobile } from '@/components/ThemeSwitch';

// const DASH_NAV_LINKS_AUTH = [
//   { label: 'Overview', id: '/dashboard' },
//   { label: 'My Assets', id: '/dashboard/assets' },
//   { label: 'Verify Kyc', id: '/dashboard/kyc' },
// ];

export default function MobileSidebar({
  open,
  sidebarRef,
  close,
  handleLogout,
  navLinks,
}: {
  open: boolean;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  close: () => void;
  handleLogout: () => void;
  navLinks: { label: string; id: string }[];
}) {
  const { isAuthenticated, user, role } = useSelector(
    (state: RootState) => state.authLogin
  );
  const roleLower = role?.toLowerCase() || '';
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const location = useLocation();
  const savedUser = useLocalUser();
  const userName = getUserName(user);
  const profilePhotoUrl = savedUser?.profileImage ?? '';

  const {
    isSubmitted,
    isUnderReview,
    isApproved,
    isRejected,
    needsOnboarding,
    // isCompany,
  } = useOnboarding();

  // const MOB_NAV_LINKS = isAuthenticated
  //   ? isCompany
  //     ? [
  //         { label: 'Overview', id: '/dashboard' },
  //         { label: 'My Assets', id: '/dashboard/assets' },
  //         { label: 'Onboarding Steps', id: '/dashboard/onboarding' },
  //       ]
  //     : DASH_NAV_LINKS_AUTH
  //   : [];
  const pathname = location.pathname;
  // const isDashboard = pathname.startsWith('/dashboard');

  const shouldHideLink = (id: string) =>
    id === '/dashboard' && pathname.startsWith('/dashboard');

  const getLinkIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('how it work'))
      return <FaQuestionCircle className="shrink-0" />;
    // if (l.includes('property')) return <FaBuilding className="shrink-0" />;
    if (l.includes('about')) return <FaInfoCircle className="shrink-0" />;
    // if (l.includes('support') || l.includes('chat'))
    //   return <FiMessageCircle className="shrink-0" />;
    if (l.includes('dashboard'))
      return <FaTachometerAlt className="shrink-0" />;
    if (l.includes('overview')) return <FaHome className="shrink-0" />;
    if (l.includes('my asset')) return <FaWallet className="shrink-0" />;
    if (l.includes('kyc') || l.includes('onboarding'))
      return <FiShield className="shrink-0" />;
    return <FaAngleRight className="shrink-0" />;
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-[var(--bg)]/95 text-[var(--fg)] backdrop-blur-xl z-50 shadow-2xl transform transition-all duration-500 ease-out overflow-y-auto overflow-x-hidden
      ${
        open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } border-l border-[var(--fg)]/10 flex flex-col`}
    >
      <div className="flex justify-between items-center p-6 shrink-0">
        <Link to="/" onClick={close}>
          {isDark ? (
            <img
              src="/images/header/hof-logo-dark.svg"
              className={`h-9  opacity-95 hover:scale-105 transition-transform`}
              height={36}
              width={180}
              alt="Logo"
            />
          ) : (
            <img
              src="/images/header/hof-logo-light.svg"
              className={`h-9 opacity-95 hover:scale-105 transition-transform`}
              alt="Logo"
              height={36}
              width={180}
            />
          )}
        </Link>

        <button
          onClick={close}
          className="w-10 h-10 flex items-center justify-center
      rounded-xl bg-[var(--fg)]/5 hover:bg-[var(--fg)]/10
      hover:rotate-90 transition-all duration-300 group"
          aria-label="close button"
        >
          <IoCloseSharp
            size={24}
            className="group-hover:text-[#3A76C0] transition-colors"
          />
        </button>
      </div>

      <div className="flex-grow">
        {isAuthenticated && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-4 bg-[var(--fg)]/[0.04] backdrop-blur-md border border-[var(--fg)]/10 rounded-2xl p-5 shadow-sm hover:bg-[var(--fg)]/[0.06] transition-all duration-300 group/profile">
              {(() => {
                const statusColor = isApproved
                  ? 'from-[#22C55E] to-[#4ADE80]'
                  : isRejected
                    ? 'from-[#EF4444] to-[#F87171]'
                    : isSubmitted || isUnderReview
                      ? 'from-[#F59E0B] to-[#FBBF24]'
                      : 'from-slate-300 to-slate-400';

                return (
                  <div
                    className={`w-16 h-16 rounded-full shrink-0 p-[2px] shadow-lg bg-gradient-to-tr ${statusColor} group-hover/profile:scale-110 transition-transform duration-500`}
                  >
                    <div className="w-full h-full rounded-full bg-[var(--bg)] p-[1px] overflow-hidden">
                      {profilePhotoUrl ? (
                        <img
                          src={profilePhotoUrl}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4f8edc] to-[#2b4d73] rounded-full">
                          <span className="font-bold text-xl text-white">
                            {userName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--fg)]/30 mb-0.5">
                  WELCOME BACK
                </span>
                <span className="text-lg font-bold text-[var(--fg)] leading-tight tracking-tight truncate">
                  {userName}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#3A76C0] mt-1 opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3A76C0] inline-block animate-pulse" />
                  {formatRole(roleLower)}
                </p>
              </div>

              <Link
                to="/dashboard/profile"
                onClick={close}
                className="
                  ml-auto
                  w-10 h-10
                  rounded-xl
                  bg-[var(--fg)]/5
                  border border-[var(--fg)]/10
                  flex items-center justify-center
                  text-[var(--fg)]/40
                  hover:text-[#3A76C0]
                  hover:bg-[#3A76C0]/10
                  hover:border-[#3A76C0]/20
                  transition-all duration-300
                "
                title="Edit profile"
              >
                <FaRegEdit size={18} />
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 px-4">
          <div className="mb-2">
            <ThemeSwitchMobile />
          </div>

          <div className="space-y-6">
            <section>
              <p className="px-4 text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--fg)]/30 mb-3">
                Main Menu
              </p>
              <div className="flex flex-col gap-1">
                {navLinks
                  .filter(({ id }) => !shouldHideLink(id))
                  .map(({ label, id }) => (
                    <Link
                      key={id}
                      to={id.startsWith('/') ? id : ''}
                      onClick={(e) => {
                        if (id.startsWith('/')) {
                          close();
                          return;
                        }
                        e.preventDefault();
                        scrollToSection(id);
                        close();
                      }}
                      className="group flex items-center gap-4 py-3.5 px-5 rounded-2xl hover:bg-[var(--fg)]/[0.03] active:scale-[0.98] transition-all duration-300 border border-transparent hover:border-[var(--fg)]/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--fg)]/[0.03] group-hover:bg-[#3A76C0]/10 flex items-center justify-center text-[var(--fg)]/40 group-hover:text-[#3A76C0] transition-colors">
                        {getLinkIcon(label)}
                      </div>
                      <span className="text-base font-semibold text-[var(--fg)]/70 group-hover:text-[var(--fg)] transition-colors">
                        {label}
                      </span>
                      <FaAngleRight
                        className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#3A76C0]"
                        size={14}
                      />
                    </Link>
                  ))}

                {isAuthenticated && (
                  <Link
                    to={'/dashboard/my-club'}
                    onClick={close}
                    className="group flex items-center gap-4 py-3.5 px-5 rounded-2xl hover:bg-[var(--fg)]/[0.03] active:scale-[0.98] transition-all duration-300 border border-transparent hover:border-[var(--fg)]/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--fg)]/[0.03] group-hover:bg-[#3A76C0]/10 flex items-center justify-center text-[var(--fg)]/40 group-hover:text-[#3A76C0] transition-colors">
                      <FiUsers size={18} />
                    </div>
                    <span className="text-base font-semibold text-[var(--fg)]/70 group-hover:text-[var(--fg)] transition-colors">
                      My Club
                    </span>
                    <FaAngleRight
                      className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#3A76C0]"
                      size={14}
                    />
                  </Link>
                )}

                <Link
                  to={'/dashboard/chat'}
                  onClick={close}
                  className="group flex items-center gap-4 py-3.5 px-5 rounded-2xl hover:bg-[var(--fg)]/[0.03] active:scale-[0.98] transition-all duration-300 border border-transparent hover:border-[var(--fg)]/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--fg)]/[0.03] group-hover:bg-[#3A76C0]/10 flex items-center justify-center text-[var(--fg)]/40 group-hover:text-[#3A76C0] transition-colors">
                    <FiMessageCircle size={18} />
                  </div>
                  <span className="text-base font-semibold text-[var(--fg)]/70 group-hover:text-[var(--fg)] transition-colors">
                    Chat
                  </span>
                  <FaAngleRight
                    className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#3A76C0]"
                    size={14}
                  />
                </Link>

                {!needsOnboarding && (
                  <Link
                    to={
                      roleLower === 'company'
                        ? '/dashboard/onboarding'
                        : '/dashboard/kyc'
                    }
                    onClick={close}
                    className="group flex items-center gap-4 py-3.5 px-5 rounded-2xl hover:bg-[var(--fg)]/[0.03] active:scale-[0.98] transition-all duration-300 border border-transparent hover:border-[var(--fg)]/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--fg)]/[0.03] group-hover:bg-[#3A76C0]/10 flex items-center justify-center text-[var(--fg)]/40 group-hover:text-[#3A76C0] transition-colors">
                      <FiShield size={18} />
                    </div>
                    <span className="text-base font-semibold text-[var(--fg)]/70 group-hover:text-[var(--fg)] transition-colors">
                      {roleLower === 'company'
                        ? 'Onboarding Status'
                        : 'KYC Status'}
                    </span>
                    <FaAngleRight
                      className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#3A76C0]"
                      size={14}
                    />
                  </Link>
                )}
              </div>
            </section>

            {/* {!isDashboard && MOB_NAV_LINKS.length > 0 && (
              <section>
                <p className="px-4 text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--fg)]/30 mb-3">
                  Quick Actions
                </p>
                <div className="flex flex-col gap-1">
                  {MOB_NAV_LINKS.filter(({ id }) => {
                    if (
                      (id === '/dashboard/kyc' ||
                        id === '/dashboard/onboarding') &&
                      !needsOnboarding
                    ) {
                      return false;
                    }
                    return true;
                  }).map(({ label, id }) => (
                    <Link
                      key={id}
                      to={id.startsWith('/') ? id : ''}
                      onClick={(e) => {
                        if (id.startsWith('/')) {
                          close();
                          return;
                        }
                        e.preventDefault();
                        scrollToSection(id);
                        close();
                      }}
                      className="group bg-red-500 flex items-center gap-4 py-3.5 px-5 rounded-2xl hover:bg-[var(--fg)]/[0.03] active:scale-[0.98] transition-all duration-300 border border-transparent hover:border-[var(--fg)]/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--fg)]/[0.03] group-hover:bg-[#3A76C0]/10 flex items-center justify-center text-[var(--fg)]/40 group-hover:text-[#3A76C0] transition-colors">
                        {getLinkIcon(label)}
                      </div>
                      <span className="text-base font-semibold text-[var(--fg)]/70 group-hover:text-[var(--fg)] transition-colors">
                        {label}
                      </span>
                      <FaAngleRight
                        className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#3A76C0]"
                        size={14}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )} */}
          </div>
        </div>
      </div>

      <div className="shrink-0 p-6 border-t border-[var(--fg)]/10 bg-[var(--bg)]/50 backdrop-blur-md">
        {isAuthenticated ? (
          <button
            onClick={() => {
              handleLogout();
              close();
            }}
            className="w-full bg-red-500/[0.05] hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl text-base font-bold transition-all duration-300 border border-red-500/20 active:scale-[0.95] flex items-center justify-center gap-3 overflow-hidden relative group/logout"
          >
            <FiLogOut
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />
            Sign Out
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              onClick={close}
              className="w-full bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.95] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden relative group/login"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/login:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              Sign In{' '}
              <FaArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <Link
              to="/signup"
              onClick={close}
              className="w-full bg-[var(--fg)]/[0.03] text-[var(--fg)] py-4 rounded-2xl text-base font-bold border border-[var(--fg)]/10 hover:bg-[var(--fg)]/5 hover:border-[var(--fg)]/20 active:scale-[0.95] transition-all duration-300 flex items-center justify-center gap-3 group/signup"
            >
              <FaUserPlus
                size={16}
                className="text-[#3A76C0] group-hover:scale-110 transition-transform"
              />
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
