import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useOnboarding } from '@/hooks';

export function useShowCorporateKycHeader() {
  const location = useLocation();

  const { role, isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  const { needsOnboarding, hasDirectors } = useOnboarding();

  const pathname = location.pathname;

  const isDashboard = pathname.startsWith('/dashboard');
  const isOnCompleteProfile = pathname === '/complete-profile';
  const isNotifications = pathname === '/notifications';
  const isKybPage = pathname.includes('/kyb');
  const isKycPage = pathname.includes('/kyc');
  const isRwaPage = pathname.includes('/rwa');
  const isUserKyc = pathname.includes('/user-kyc');

  return (
    isAuthenticated &&
    needsOnboarding &&
    role?.toLowerCase() === 'corporateinvestor' &&
    !hasDirectors &&
    !isOnCompleteProfile &&
    !isNotifications &&
    !isKybPage &&
    !isKycPage &&
    !isRwaPage &&
    !isUserKyc &&
    !isDashboard
  );
}
