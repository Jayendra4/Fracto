import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/redux';
import { KycStatus } from '@/types';
import Loader from '@/components/common/Loader';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, admin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  // 1️⃣ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile Loading state (after auth, before admin profile is fetched)
  // This prevents premature redirection to KYC page if admin is null
  if (!admin) {
    return <Loader />;
  }

  // Trustee KYC Gate
  const isKycDone =
    admin?.kycStatus === KycStatus.Approved ||
    admin?.kyc?.status === KycStatus.Approved;
  const kycIncomplete = !isKycDone;
  const isOnKycPage = location.pathname.startsWith('/trustee-kyc');

  if (kycIncomplete && !isOnKycPage) {
    return <Navigate to="/trustee-kyc" replace />;
  }


  return <Outlet />;
}
