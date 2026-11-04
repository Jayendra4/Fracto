import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AdminRoute } from '@/components/common/AdminRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DepositRequest } from './pages/Transactions/DepositRequest';
import { WithdrawRequest } from './pages/Transactions/WithdrawRequest';
import { ManualPayments } from './pages/Transactions/ManualPayments';
import { UserKycRequest } from './pages/Kyc/UserKycRequest';
import ChangePassword from './pages/ChangePassword';
import { ProfilePage } from './pages/Profile/ProfilePage';
import TrusteeKycPage from './pages/TrusteeKyc/TrusteeKycPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AssetList } from './pages/Asset/AssetList';
import AssetDetailsPage from './pages/Asset/AssetDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import { UserDetailPage } from './pages/users/UserDetails/UserDetailPage';
import SPAList from './pages/SPVList';
import ShareholderRegister from './pages/Shareholder';
// import GovernanceVotes from './pages/GovernanceVotes';
import DocumentVault from './pages/DocumentVault/DocumentVault';
import SecondaryTransferRequests from './pages/SecondaryTransferRequests/SecondaryTransferRequests';
import ExitLiquidationTracker from './pages/ExitLiquidationTracker/ExitLiquidationTracker';
import VerifierTracker from './pages/VerifierTracker/VerifierTracker';
import Reports from './pages/Reports/Reports';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings';
import TrusteeCommission from './pages/TrusteeCommission/TrusteeComission';

export function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Settings Routes */}
          <Route path="/settings" element={<SettingsPage />} />
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/spv-list" element={<SPAList />} />
            <Route path="/shareholder-register" element={<ShareholderRegister />} />
            {/* <Route path="/governance-votes" element={<GovernanceVotes />} /> */}
            <Route path="/document-vault" element={<DocumentVault />} />
            <Route path="/secondary-transfer-requests" element={<SecondaryTransferRequests />} />
            <Route path="/exit-liquidation-tracker" element={<ExitLiquidationTracker />} />
            <Route path="/verifier-tracker" element={<VerifierTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/users/:userType" element={<UsersPage />} />
            <Route path="/user-management" element={<UsersPage />} />
            <Route path="/users/:userType/detail/:id" element={<UserDetailPage />} />
            <Route path="/deposit-request" element={<DepositRequest />} />
            <Route path="/withdraw-request" element={<WithdrawRequest />} />
            <Route path="/manual-payments" element={<ManualPayments />} />
            <Route path="/user-kyc-request" element={<UserKycRequest />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/trustee-kyc" element={<TrusteeKycPage />} />
            <Route path="/trustee-commission" element={<TrusteeCommission />} />
            <Route path="/asset-list" element={<AssetList />} />
            <Route path="/asset-list/asset-detail/:id" element={<AssetDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
