import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AdminRoute } from '@/components/common/AdminRoute';
import { PermissionRoute } from '@/components/common/PermissionRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AdminConsolePage } from '@/pages/AdminConsole/AdminConsolePage';
import { UsersPage } from '@/pages/users/UsersPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { ReportsPage } from '@/pages/analytics/ReportsPage';
import { RealtimePage } from '@/pages/analytics/RealtimePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { SimpleFormPage } from '@/pages/SimpleFormPage';
import { ComprehensiveFormPage } from '@/pages/ComprehensiveFormPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UserDetailPage } from './pages/users/UserDetails/UserDetailPage';
import KycInfo from './pages/users/Create/KycInfo';
import { BankAccounts } from './pages/Bank/BankAccounts';
import { UpiAccounts } from './pages/Bank/UpiAccounts';
import CreateBankAccount from './pages/Bank/Create/CreateBankAccount';
import CreateUpiAccount from './pages/Bank/Create/CreateUpiAccount';
import { DepositRequest } from './pages/Transactions/DepositRequest';
import { WithdrawRequest } from './pages/Transactions/WithdrawRequest';
import { TrusteeKycRequest } from './pages/Kyc/TrusteeKycRequest';
import UserKycRequest from './pages/Kyc/UserKycRequest';
import CompanyKycRequest from './pages/Kyc/CompanyKycRequest';
import MasterRwaForm from './pages/MasterRWA/MasterRWAForm';
import ChangePassword from './pages/ChangePassword';
import { ProfilePage } from './pages/Profile/ProfilePage';
import CreateUser from './pages/users/Create/CreateUser';
import { AssetList } from './pages/Asset/AssetList';
import AssetDetailsPage from './pages/Asset/AssetDetailsPage';
import NotificationListener from './components/Notification/NotificationListener';
import { Toaster } from 'react-hot-toast';
import NotificationsPage from './pages/NotificationsPage';
import TrusteeKycDetails from './pages/Kyc/TrusteeKycDetails';
import UserKycDetails from './pages/Kyc/UserKycDetails';
import CompanyKycDetails from './pages/Kyc/CompanyKycDetails';
import { CouponsPage } from './pages/Coupon/CouponPage';
import CreateCoupon from './pages/Coupon/CreateCoupon';
import EditAssetPage from './pages/Asset/EditAssetPage';
import { LegalComplianceVendorsPage } from './pages/Vendors/LegalComplianceVendorsPage';
import CreateVendorPage from './pages/Vendors/CreateVendorPage';
import { LeadDetails } from './pages/users/UserDetails/LeadDetails';
import { BrokerCommissions } from './pages/users/UserDetails/CommissionPage';
import { Groups } from './pages/Groups';
import CreateGroup from './pages/Groups/Create/CreateGroup';
import { Category } from './pages/Category';
import CreateCategory from './pages/Category/Create/CreateCategory';
import { GroupDetailsPage } from './pages/Groups/GroupDetails/GroupDetailsPage';
import ShareToGroups from './pages/Groups/GroupDetails/ShareToGroups';
import { InterestedMember } from './pages/Groups/GroupDetails/InterestedMember';
import { PaymentMember } from './pages/Groups/GroupDetails/PaymentMember';
import EditGroup from './pages/Groups/Create/EditGroup';
import EditVendorPage from './pages/Vendors/EditVendorPage';
import { ImmediateSalePage } from './pages/Groups/GroupDetails/ImmediateSalePage';
import { RolesPage } from './pages/RolesPrivilege/RolesPage';

export function App() {
  return (
    <>
      <NotificationListener />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<PermissionRoute permission="dashboard.view" />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="/asset-phases" element={<AdminConsolePage activeTab="assetphases" />} />
            <Route element={<PermissionRoute permission="asset.view" />}>
              <Route path="/asset-review" element={<AdminConsolePage activeTab="assetreview" />} />
              <Route
                path="/govt-asset-management"
                element={<AdminConsolePage activeTab="govassetmgmt" />}
              />
            </Route>
            <Route path="/cms" element={<AdminConsolePage activeTab="cms" />} />
            <Route
              path="/listing-approval"
              element={<AdminConsolePage activeTab="listing-approval" />}
            />
            <Route
              path="/profit-mechanism"
              element={<AdminConsolePage activeTab="profittypes" />}
            />
            <Route path="/time-share" element={<AdminConsolePage activeTab="timeshare" />} />
            <Route path="/exitmgmt" element={<AdminConsolePage activeTab="exitmgmt" />} />
            <Route
              path="/investor-phases"
              element={<AdminConsolePage activeTab="investorphases" />}
            />
            <Route
              path="/investoraccess"
              element={<AdminConsolePage activeTab="investoraccess" />}
            />
            <Route element={<PermissionRoute permission="secondary_marketplace.view" />}>
              <Route
                path="/secondarymarket"
                element={<AdminConsolePage activeTab="secondarymarket" />}
              />
            </Route>
            <Route element={<PermissionRoute permission="nda_consent.view" />}>
              <Route path="/consent" element={<AdminConsolePage activeTab="consent" />} />
            </Route>
            <Route element={<PermissionRoute permission="secondary_group.view" />}>
              <Route
                path="/secondary-groups"
                element={<AdminConsolePage activeTab="groupsoverview" />}
              />
              <Route
                path="/secondary-groups/interests/:assetId"
                element={<AdminConsolePage activeTab="groupsoverview-detail" />}
              />
              <Route
                path="/secondary-groups/club-members"
                element={<AdminConsolePage activeTab="clubmembers" />}
              />
            </Route>
            <Route element={<PermissionRoute permission="vote.view" />}>
              <Route
                path="/club-management/voters"
                element={<AdminConsolePage activeTab="clubvoters" />}
              />
              <Route
                path="/club-management"
                element={<AdminConsolePage activeTab="club-management" />}
              />
            </Route>
            <Route path="/groupsharing" element={<AdminConsolePage activeTab="groupsharing" />} />
            <Route path="/userdetail" element={<AdminConsolePage activeTab="userdetail" />} />
            <Route element={<PermissionRoute permission="kyc.view" />}>
              <Route path="/kyc" element={<AdminConsolePage activeTab="kyc" />} />
            </Route>
            <Route element={<PermissionRoute permission="spv.view" />}>
              <Route path="/spv" element={<AdminConsolePage activeTab="spvmgmt" />} />
              <Route path="/spv-managememt" element={<AdminConsolePage activeTab="spvmgmt" />} />
            </Route>
            <Route path="/broker" element={<AdminConsolePage activeTab="brokermgmt" />} />
            <Route path="/brokermgmt" element={<AdminConsolePage activeTab="brokermgmt" />} />
            <Route path="/rm" element={<AdminConsolePage activeTab="rmassignment" />} />
            <Route path="/rmassignment" element={<AdminConsolePage activeTab="rmassignment" />} />
            <Route path="/payments" element={<AdminConsolePage activeTab="payments" />} />
            <Route element={<PermissionRoute permission="manual_payment.view" />}>
              <Route
                path="/manual-payments"
                element={<AdminConsolePage activeTab="manual-payments" />}
              />
            </Route>
            <Route path="/tickets" element={<AdminConsolePage activeTab="tickets" />} />
            <Route path="/auditlogs" element={<AdminConsolePage activeTab="auditlogs" />} />
            <Route path="/status-legend" element={<AdminConsolePage activeTab="statuslegend" />} />
            <Route element={<PermissionRoute permission="compliance_report.view" />}>
              <Route path="/reports" element={<AdminConsolePage activeTab="reports" />} />
            </Route>
            <Route element={<PermissionRoute permission="system.view" />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* Analytics Routes */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/analytics/reports" element={<ReportsPage />} />
            <Route path="/analytics/realtime" element={<RealtimePage />} />
            {/* Settings Routes */}
            <Route path="/settings" element={<SettingsPage />} />
            {/* Form Examples */}
            <Route path="/forms" element={<SimpleFormPage />} />
            <Route path="/forms/comprehensive" element={<ComprehensiveFormPage />} />
            <Route path="/vendors/create" element={<CreateVendorPage />} />
            <Route path="/vendors/edit/:id" element={<EditVendorPage />} />
            <Route path="/vendors-page" element={<LegalComplianceVendorsPage />} />{' '}
            {/* new ttoo update */}
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              {/* <Route path="/admin/broker/lead-details/:id" element={<LeadDetails />} /> */}
              <Route
                path="/users/:userType/detail/:userId/leads/:id"
                element={<LeadDetails />}
              />{' '}
              <Route path="/commissions" element={<BrokerCommissions brokerId={0} />} />
              <Route element={<PermissionRoute permission="users.view" />}>
                <Route path="/user-management" element={<UsersPage />} />
                <Route path="/users/:userType" element={<UsersPage />} />
                {/* <Route path="/user-detail/:id" element={<UserDetailPage />} /> */}
                <Route path="/users/:userType/detail/:id" element={<UserDetailPage />} />{' '}
                <Route path="/create-user/:userType" element={<CreateUser />} />
              </Route>
              <Route element={<PermissionRoute permission="roles.view" />}>
                <Route path="/users/roles" element={<RolesPage />} />
              </Route>
              <Route element={<PermissionRoute permission="group.view" />}>
                <Route path="/primary-groups" element={<Groups />} />
                <Route path="/group/detail/:id" element={<GroupDetailsPage />} />
                <Route
                  path="/group/intrested-member/:groupId/:propertyId"
                  element={<InterestedMember />}
                />
                <Route path="/group/payments/:groupId/:propertyId" element={<PaymentMember />} />
                <Route
                  path="/group/immediate-sale/:groupId/:propertyId"
                  element={<ImmediateSalePage />}
                />
                <Route path="/group/share/:id" element={<ShareToGroups />} />
                <Route path="/create-group" element={<CreateGroup />} />
                <Route path="/edit-group/:id" element={<EditGroup />} />
              </Route>
              <Route element={<PermissionRoute permission="category.view" />}>
                <Route path="/category" element={<Category />} />
                <Route path="/create-category" element={<CreateCategory />} />
              </Route>
              {/* new 5 update */}
              <Route path="/create-investor/kyc/:id" element={<KycInfo />} />
              <Route path="/bank-account" element={<BankAccounts />} />
              <Route path="/upi" element={<UpiAccounts />} />
              <Route path="/add-bank-account" element={<CreateBankAccount />} />
              <Route path="/add-upi" element={<CreateUpiAccount />} />
              <Route element={<PermissionRoute permission="deposit_request.view" />}>
                <Route
                  path="/deposit-request"
                  element={<AdminConsolePage activeTab="deposit-request" />}
                />
              </Route>
              <Route element={<PermissionRoute permission="withdrawal_request.view" />}>
                <Route
                  path="/withdraw-request"
                  element={<AdminConsolePage activeTab="withdraw-request" />}
                />
              </Route>
              <Route element={<PermissionRoute permission="kyc.view" />}>
                <Route path="/trustee-kyc-request" element={<TrusteeKycRequest />} />
                <Route path="/user-kyc-request" element={<UserKycRequest />} />
                <Route path="/company-kyc-request" element={<CompanyKycRequest />} />
                {/* <Route path="/trustee-kyc-details/:id" element={<TrusteeKycDetails />} /> */}
                <Route path="/trustee-kyc-request/:id" element={<TrusteeKycDetails />} />
                <Route path="/user-kyc-request/:id" element={<UserKycDetails />} />
                <Route path="/company-kyc-request/details/:id" element={<CompanyKycDetails />} />
              </Route>
              <Route path="/master-rwa-form" element={<MasterRwaForm />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route element={<PermissionRoute permission="asset.view" />}>
                <Route path="/asset-list" element={<AssetList />} />
                {/* <Route path="/asset-detail/:id" element={<AssetDetailsPage />} /> */}
                <Route
                  path="/listing-approval/assets/:assetId"
                  element={<AssetDetailsPage />}
                />{' '}
                <Route path="/asset-list/assets/:assetId" element={<AssetDetailsPage />} />{' '}
                {/* new 5 update */}
                <Route path="/edit-asset/:id" element={<EditAssetPage />} />
              </Route>
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/coupon-page" element={<CouponsPage />} />
              <Route path="/create-coupon" element={<CreateCoupon />} />
              <Route path="/vendors-page" element={<LegalComplianceVendorsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  );
}
