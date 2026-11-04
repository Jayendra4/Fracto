import { Link, useNavigate } from 'react-router-dom';
import { VscVerifiedFilled } from 'react-icons/vsc';
import { LuBadgeX } from 'react-icons/lu';
import {
  FiChevronDown,
  // FiFileText,
  // FiLock,
  FiLogOut,
  // FiShield,
  FiBell,
  FiMessageCircle,
  // FiMessageCircle,
} from 'react-icons/fi';
import { IoWalletOutline } from 'react-icons/io5';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/modeSlice';
import { getUserName } from '@/utils';
import { useLocalUser } from '@/hooks/useLocalUser';
import { useEffect, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyNotifications, useMyWallet } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { formatRole } from '@/types/roles';
import { useChatNotifications } from '@/provider/ChatNotificationProvider';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useOnboarding } from '@/hooks';

interface HeaderDesktopAuthProps {
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onMenuOpen: () => void;
  handleLogout: () => void;
}

export default function HeaderDesktopAuth({
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onMenuOpen,
  handleLogout,
}: HeaderDesktopAuthProps) {
  const { isAuthenticated, user, role } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { unreadCount } = useChatNotifications();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';

  const roleLower = role?.toLowerCase();
  const navigate = useNavigate();
  const userName = getUserName(user);
  const savedUser = useLocalUser();

  const { data } = useMyWallet({
    enabled: isAuthenticated,
  });
  const profilePhotoUrl = savedUser?.profileImage ?? '';
  const [referralCopied, setReferralCopied] = useState(false);

  const copyReferralCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!savedUser?.referralCode) return;

    try {
      await navigator.clipboard.writeText(savedUser.referralCode);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  const walletBalance = isAuthenticated
    ? (data?.data?.availableBalance ?? 0)
    : 0;

  const queryClient = useQueryClient();

  const { data: notificationData } = useMyNotifications({
    enabled: isAuthenticated,
  });

  const hasUnread =
    notificationData?.pages?.some(
      (page) =>
        page.success &&
        Array.isArray(page?.data?.data) &&
        page.data.data.some((n) => n.readAt === null)
    ) ?? false;

  const {
    isApproved,
    isRejected,
    isSubmitted,
    isUnderReview,
    // needsOnboarding,
  } = useOnboarding();

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    };

    window.addEventListener('fcm-notification', handler);
    return () => window.removeEventListener('fcm-notification', handler);
  }, [queryClient]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, dropdownRef, setDropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      {isAuthenticated ? (
        <div className="hidden lg:flex items-center justify-center gap-3 xl:gap-5 2xl:gap-7 relative">
          <div className="flex items-center rounded-2xl bg-[var(--fg)]/5 border border-[var(--fg)]/10 overflow-hidden shadow-sm">
            <Link
              to={'/dashboard/messages'}
              className="group relative flex items-center justify-center w-10 h-10 xl:w-12 xl:h-12 hover:bg-[var(--fg)]/8 transition-all duration-300"
              aria-label="Message"
            >
              <FiMessageCircle
                className={`text-xl xl:text-2xl transition-colors duration-300 ${isDark ? 'text-[var(--fg)]/70 group-hover:text-[var(--fg)]' : 'text-slate-500 group-hover:text-slate-800'}`}
              />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[var(--bg)]"></span>
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-[var(--fg)]/10" />

            <button
              onClick={() => navigate('/notifications')}
              className="group relative flex items-center justify-center w-10 h-10 xl:w-12 xl:h-12 hover:bg-[var(--fg)]/8 transition-all duration-300 cursor-pointer"
              aria-label="Open notifications"
            >
              <FiBell
                className={`text-xl xl:text-2xl transition-colors duration-300 ${isDark ? 'text-[var(--fg)]/70 group-hover:text-[var(--fg)]' : 'text-slate-500 group-hover:text-slate-800'}`}
              />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[var(--bg)]"></span>
                </span>
              )}
            </button>
          </div>

          <button
            title="wallet"
            onClick={() => navigate('/dashboard/wallet')}
            className="group relative flex items-center gap-3 xl:gap-4 px-3 py-2 xl:px-5 xl:py-2.5 rounded-2xl bg-[var(--fg)]/5 hover:bg-[var(--fg)]/8 border border-[var(--fg)]/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            aria-label="wallet"
          >
            <div className="flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-[var(--fg)]/5 group-hover:bg-[var(--fg)]/10 transition-colors">
              <IoWalletOutline
                className={`text-xl xl:text-2xl ${isDark ? 'text-[var(--fg)]' : 'text-slate-600'}`}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] xl:text-[10px] uppercase tracking-[0.1em] font-semibold text-[var(--fg)]/40 leading-none mb-1.5">
                Balance
              </span>
              <span className="font-14 xl:text-lg font-bold text-[var(--fg)] leading-none tracking-tight w-18 xl:w-25">
                ₹ <AnimatedNumber value={Number(walletBalance)} />
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 xl:gap-5 pl-2 xl:pl-6 border-l border-[var(--fg)]/10 ml-1 xl:ml-2">
            {(() => {
              const statusColor = isApproved
                ? 'from-[#22C55E] to-[#4ADE80]'
                : isRejected
                  ? 'from-[#EF4444] to-[#F87171]'
                  : isSubmitted || isUnderReview
                    ? 'from-[#F59E0B] to-[#FBBF24]'
                    : 'from-slate-300 to-slate-400';

              const badgeColor = isApproved
                ? 'text-[#22C55E]'
                : isRejected
                  ? 'text-[#EF4444]'
                  : isSubmitted || isUnderReview
                    ? 'text-[#F59E0B]'
                    : 'text-slate-400';

              const badgeBorder = isApproved
                ? 'border-[#22C55E]'
                : isRejected
                  ? 'border-[#EF4444]'
                  : isSubmitted || isUnderReview
                    ? 'border-[#F59E0B]'
                    : 'border-slate-400';

              return (
                <Link
                  to="/dashboard/settings"
                  className={`group relative w-10 h-10 xl:w-12 xl:h-12 rounded-full p-[2px] transition-all duration-300 hover:scale-105 active:scale-95 shadow-md bg-gradient-to-tr ${statusColor}`}
                  aria-label="Open profile"
                >
                  <div className="w-full h-full rounded-full bg-[var(--bg)] p-[1px] overflow-hidden">
                    <img
                      src={profilePhotoUrl || '/images/menu.svg'}
                      alt="profile"
                      className={`w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110 ${!profilePhotoUrl && !isDark ? 'invert' : ''}`}
                    />
                  </div>

                  <div className="absolute -bottom-0.5 -right-0.5 transform scale-100 z-10">
                    <div
                      className={`flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-lg border-2 ${badgeBorder}`}
                    >
                      {isApproved ? (
                        <VscVerifiedFilled className={badgeColor} size={14} />
                      ) : (
                        <LuBadgeX className={badgeColor} size={14} />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })()}

            <div
              ref={dropdownRef}
              className="relative flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((prev) => !prev);
              }}
            >
              <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-500">
                <div className="flex items-center gap-1 xl:gap-2">
                  <span className="text-sm xl:text-lg font-semibold text-[var(--fg)] leading-tight tracking-tight">
                    Hi, {userName}
                  </span>
                  <FiChevronDown
                    className={`text-lg xl:text-xl text-[var(--fg)]/30 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                      dropdownOpen ? 'rotate-180 text-[#3A76C0]' : ''
                    }`}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A76C0] mt-1.5 leading-snug opacity-80 max-w-[130px] xl:max-w-[170px] line-clamp-3">
                  {formatRole(roleLower)}
                </p>
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-2xl bg-[var(--bg)]/80 backdrop-blur-xl text-[var(--fg)] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[var(--fg)]/10 z-[100] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Profile Section */}
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-4 px-5 py-5 hover:bg-[var(--fg)]/5 transition-all duration-300 group/item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--fg)]/10 group-hover/item:border-[#3A76C0]/50 transition-colors">
                        <img
                          src={profilePhotoUrl || '/images/menu.svg'}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate group-hover/item:text-[#3A76C0] transition-colors">
                          {userName}
                        </p>
                        <p className="text-[11px] text-[var(--fg)]/50 truncate font-medium">
                          {savedUser?.email}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--fg)]/5 group-hover/item:bg-[#3A76C0]/10 text-[var(--fg)]/40 group-hover/item:text-[#3A76C0] transition-all">
                        <FaRegEdit className="text-sm" />
                      </div>
                    </Link>

                    {savedUser?.referralCode && (
                      <div className="px-5 pb-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--fg)]/40 mb-1.5">
                          Your Referral Code
                        </p>
                        <button
                          type="button"
                          onClick={copyReferralCode}
                          title="Copy Referral Code"
                          className="group/ref flex items-center justify-between w-full gap-2 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-gradient-to-r from-[#3A76C0]/10 to-[#60A5FA]/10 border border-[#3A76C0]/30 hover:border-[#3A76C0]/50 transition-all cursor-pointer"
                        >
                          <span className="font-mono text-[11px] font-bold tracking-wider text-[#3A76C0] truncate">
                            {savedUser.referralCode}
                          </span>
                          <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-md bg-[#3A76C0]/10 text-[#3A76C0]/80 group-hover/ref:bg-[#3A76C0]/20 group-hover/ref:text-[#3A76C0] transition-colors">
                            {referralCopied ? (
                              <FiCheck size={11} />
                            ) : (
                              <FiCopy size={11} />
                            )}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="h-px bg-[var(--fg)]/10 mx-2" />

                    {/* Menu Items */}
                    <div className="p-2">
                      <div className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-[var(--fg)]/70">
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#75C9EB]/10 flex items-center justify-center text-[#75C9EB]">
                            {isDark ? (
                              <FiMoon size={16} />
                            ) : (
                              <FiSun size={16} />
                            )}
                          </span>
                          Appearance
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isDark}
                          title={
                            isDark
                              ? 'Switch to light mode'
                              : 'Switch to dark mode'
                          }
                          onClick={() => dispatch(toggleTheme())}
                          className={`relative w-11 h-6 rounded-full shrink-0 cursor-pointer transition-colors duration-300 ${
                            isDark ? 'bg-[#1F4FE0]' : 'bg-[var(--fg)]/15'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
                              isDark ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            {isDark ? (
                              <FiMoon size={11} className="text-[#1F4FE0]" />
                            ) : (
                              <FiSun size={11} className="text-amber-500" />
                            )}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-[var(--fg)]/10 mx-2 mb-1" />

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95 group/logout"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/logout:rotate-12 transition-transform">
                          <FiLogOut size={18} />
                        </div>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex justify-end items-center gap-4">
          <Link
            to="/login"
            className="group relative flex items-center justify-center px-8 py-2.5 text-base font-bold text-[var(--fg)] bg-transparent border-2 border-[var(--fg)]/10 hover:border-[#3A76C0]/50 rounded-xl transition-all duration-300 active:scale-95 shadow-sm whitespace-nowrap overflow-hidden"
          >
            <span className="relative z-10 transition-colors group-hover:text-[#3A76C0]">
              Login
            </span>
            <div className="absolute inset-0 bg-[#3A76C0]/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <Link
            to="/signup"
            className="group relative flex items-center justify-center px-8 py-2.5 text-base font-extrabold bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white rounded-xl transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-[0_4px_15px_rgba(58,118,192,0.3)] hover:shadow-[0_8px_25px_rgba(58,118,192,0.4)] whitespace-nowrap"
            aria-label="sign-up"
          >
            Get Started
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      )}

      <div className="lg:hidden flex items-center gap-2 sm:gap-4">
        {isAuthenticated && (
          <>
            <button
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-transparent active:bg-[var(--fg)]/5 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/dashboard/messages')}
            >
              <FiMessageCircle
                className={`text-xl ${isDark ? 'text-[var(--fg)]/60' : 'text-slate-500'}`}
              />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[var(--bg)]"></span>
                </span>
              )}
            </button>

            <button
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-transparent active:bg-[var(--fg)]/5 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/dashboard/wallet')}
              aria-label="Open wallet"
            >
              <IoWalletOutline
                className={`text-xl ${isDark ? 'text-[var(--fg)]/60' : 'text-slate-500'}`}
              />
            </button>
          </>
        )}
        <button
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-transparent active:bg-[var(--fg)]/5 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/notifications')}
          aria-label="Open profile"
        >
          <FiBell
            className={`text-1xl ${isDark ? 'text-[var(--fg)]/60' : 'text-slate-500'}`}
          />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[var(--bg)]"></span>
            </span>
          )}
        </button>

        <button
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent active:bg-[var(--fg)]/5 transition-all duration-300"
          onClick={onMenuOpen}
          aria-label="Open Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`w-5 h-0.5 rounded-full ${isDark ? 'bg-[var(--fg)]/70' : 'bg-slate-500'}`}
            ></span>
            <span
              className={`w-3 h-0.5 rounded-full ${isDark ? 'bg-[var(--fg)]/70' : 'bg-slate-500'}`}
            ></span>
            <span
              className={`w-4 h-0.5 rounded-full ${isDark ? 'bg-[var(--fg)]/70' : 'bg-slate-500'}`}
            ></span>
          </div>
        </button>
      </div>
    </>
  );
}
