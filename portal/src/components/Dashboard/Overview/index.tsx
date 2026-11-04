import { type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import Kyc from '../Kyc';
import MyClub from '../MyClub';
import Profile from '../Profile';
import Onboarding from '../Onboarding';
import CompanyKyb from '@/pages/Private/CompanyKyb';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import CompanyOverview from './Company';
import AssetOwnerDashboard from './AssetOwnerDashboard';
import { companyRoles } from '@/types/roles';
import RoleSelectionModal from './RoleSelectionModal';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import BrokerDashboardNew from '@/components/BrokerDashboardNew';

export default function DashboardOverview(): JSX.Element {
  const { role, token } = useSelector((state: RootState) => state.authLogin);
  const { run: refetchUser } = useFetchUserDataFlow();

  const handleRoleSuccess = () => {
    if (token) {
      refetchUser(token);
    }
  };

  const user = useSelector((state: RootState) => state.authLogin.user);
  const currentRole = role || user?.type || user?.role;
  const normalizedRole = currentRole?.toLowerCase();
  const location = useLocation();

  const path = location.pathname.replace(/\/$/, '');

  // Asset owners, corporate investors, and company accounts share the same
  // sidebar-shell dashboard (below), which handles KYC and My Club
  // internally; every other role gets these as standalone pages.
  const usesDashboardShell =
    normalizedRole === 'assetowner' ||
    normalizedRole === 'corporateinvestor' ||
    normalizedRole === 'company';

  // Intercept /dashboard/kyc for roles without the sidebar shell and not broker
  // (broker shows this as "My Onboarding" inside its own sidebar shell)
  if (
    path.endsWith('/kyc') &&
    !usesDashboardShell &&
    normalizedRole !== 'broker'
  ) {
    return <Kyc />;
  }

  // Intercept /dashboard/onboarding for roles without the sidebar shell
  if (path.endsWith('/onboarding') && !usesDashboardShell) {
    return <Onboarding />;
  }

  // Intercept /dashboard/onboarding/kyb for roles without the sidebar shell
  if (path.endsWith('/onboarding/kyb') && !usesDashboardShell) {
    return <CompanyKyb />;
  }

  // Intercept /dashboard/my-club for roles without the sidebar shell and not
  // broker (broker shows this inside its own sidebar shell)
  if (
    path.includes('/my-club') &&
    !usesDashboardShell &&
    normalizedRole !== 'broker'
  ) {
    return <MyClub />;
  }

  // Intercept /dashboard/profile for roles without the sidebar shell and not broker
  if (
    path.endsWith('/profile') &&
    !usesDashboardShell &&
    normalizedRole !== 'broker'
  ) {
    return <Profile />;
  }

  return (
    <div className="w-full text-[#101828] dark:text-white font-work">
      {/* Show modal if role is business (case-insensitive) */}
      {normalizedRole === 'business' && (
        <RoleSelectionModal onSuccess={handleRoleSuccess} />
      )}

      {normalizedRole === 'broker' ? (
        <BrokerDashboardNew />
      ) : usesDashboardShell ? (
        <AssetOwnerDashboard />
      ) : companyRoles.some((r) => r.toLowerCase() === normalizedRole) ? (
        <CompanyOverview />
      ) : null}
    </div>
  );
}
