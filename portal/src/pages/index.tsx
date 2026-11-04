import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants';
import AuthLayout from '../layout/AuthLayout';
import MainLayout from '../layout/MainLayout';
import DashboardLayout from '../layout/DashboardLayout';
import SettingLayout from '../layout/SettingLayout';
import PrivateRoutes from './Private';
import {
  AuthRedirectRoute,
  DashboardonboardProctRoute,
  // OnboardingProtectedRoute,
} from '@/layout/CustomGuards';
import Loader from '@/components/Loader';
import DashboardRouteGuard from '@/layout/CustomGuards/DashboardRouteGuard';
import JoinGroup from '@/components/CommunityOfHouse/JoinGroup';
// import ReferralAssetDetails from '@/components/Dashboard/Referrals/ReferralFormModal/ReferralAssetDetails';

const ComingSoon = lazy(() => import('@/components/ComingSoon'));
const BuyFraction = lazy(() => import('@/components/Dashboard/BuyFraction'));
const NotificationPage = lazy(() => import('./Private/Notification'));
const Login = lazy(() => import('./Auth/Login'));
const Signup = lazy(() => import('./Auth/Signup'));
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword'));
// const Dashboard = lazy(() => import('./Private/Dashboard'));
const NotFound = lazy(() => import('./Public/NotFound'));
// const Profile = lazy(() => import('./Private/Profile'));
const Setting = lazy(() => import('./Private/Setting'));
import Landing from './Public/Landing';
const About = lazy(() => import('./Public/AboutUs'));
const HowItWork = lazy(() => import('./Public/HowItWork'));
const Properties = lazy(() => import('./Public/Properties'));
const PropertyDetails = lazy(() => import('./Public/PropertyDetails'));
const PrivacyPolicy = lazy(() => import('./Public/PrivacyPolicy'));
const TermsAndCondition = lazy(() => import('./Public/TermsAndCondition'));
const ContactUs = lazy(() => import('./Public/ContactUs'));
const Users = lazy(() => import('./Private/Users'));
const Rwa = lazy(() => import('./Private/Rwa'));
const OnboardedAssets = lazy(() => import('./Private/Rwa/OnboardedAssets'));
const AssetDetail = lazy(() => import('./Private/Rwa/AssetDetail'));
const Vendors = lazy(() => import('./Private/Vendors'));
// const CompleteProfile = lazy(() => import('./Private/CompleteProfile'));
// const UserKyc = lazy(() => import('./Private/UserKyc'));
const DashboardOverview = lazy(() => import('@/components/Dashboard/Overview'));
const Assets = lazy(() => import('@/components/Dashboard/Assets'));
const Profile = lazy(() => import('@/components/Dashboard/Profile'));
const Security = lazy(() => import('@/components/Dashboard/Security'));
const Terms = lazy(() => import('@/components/Dashboard/Terms'));
const RwaTab = lazy(() => import('@/components/Dashboard/RwaTab'));
const Transactions = lazy(() => import('@/components/Dashboard/Transactions'));
const RecommendedProperties = lazy(
  () => import('@/components/Dashboard/RecommendedProperties')
);

// -----broker-----
const Leads = lazy(() => import('@/components/Dashboard/Leads'));
const LeadDetails = lazy(
  () => import('@/components/Dashboard/Leads/LeadDetails')
);

const Commissions = lazy(() => import('@/components/Dashboard/Commissions'));
const PropertiesDashboard = lazy(
  () => import('@/components/Dashboard/Properties')
);
const Referrals = lazy(() => import('@/components/Dashboard/Referrals'));
const AssetOnboarding = lazy(
  () => import('@/components/Dashboard/AssetOnboarding')
);
const Chat = lazy(() => import('@/components/Dashboard/Chat'));

const CorporateInvestor = lazy(
  () => import('@/pages/Public/CorporateInvestor')
);
const Broker = lazy(() => import('@/pages/Public/Broker'));
const AssetOwner = lazy(() => import('@/pages/Public/AssetOwner'));
const MoreGroups = lazy(
  () => import('@/components/CommunityOfHouse/MoreGroups')
);

const CommissionReceipt = lazy(
  () => import('@/components/Dashboard/Commissions/CommissionReceipt')
);

export default function Pages() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.LANDING} element={<Landing />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route
            path={ROUTES.CORPORATE_INVESTOR}
            element={<CorporateInvestor />}
          />
          <Route path={ROUTES.ASSET_OWNER} element={<AssetOwner />} />
          <Route path={ROUTES.BROKER} element={<Broker />} />
          <Route path={ROUTES.CONTACT_US} element={<ContactUs />} />
          <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
          <Route path={ROUTES.COMINGSOON} element={<ComingSoon />} />
          <Route
            path={ROUTES.TERMS_CONDITION}
            element={<TermsAndCondition />}
          />
          <Route path={ROUTES.HOWITWORK} element={<HowItWork />} />
          <Route path={ROUTES.PROPERTIES} element={<Properties />} />
          <Route path={ROUTES.PROPERTYDETAILS} element={<PropertyDetails />} />
          <Route path={ROUTES.BUYFRACTION} element={<BuyFraction />} />
          <Route path={ROUTES.MOREGROUPS} element={<MoreGroups />} />
          <Route path={ROUTES.JOIN_GROUP} element={<JoinGroup />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthRedirectRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<Signup />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          </Route>
        </Route>

        {/* Private Routes */}
        {/* <Route element={<PrivateRoutes />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="assets" element={<Assets />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="terms" element={<Terms />} />
              <Route path="kyc" element={<DashboardOverview />} />
              <Route element={<DashboardonboardProctRoute />}>
                <Route path="onboarding" element={<Onboarding />}>
                  <Route path="kyb" element={<CompanyKyb />} />
                  <Route path="kyc" element={<DirectorKyc />} />
                  <Route path="user-kyc" element={<UserKyc />} />
                  <Route path="rwa" element={<Rwa />} />
                </Route>
              </Route>
              <Route path="onboarding" element={<Onboarding />} />
            </Route>
            <Route path={ROUTES.USERS} element={<Users />} />

            <Route
              path={ROUTES.COMPLETEPROFILE}
              element={<CompleteProfile />}
            />
          </Route>

          {/* Setting Route */}
        <Route element={<SettingLayout />}>
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SETTING} element={<Setting />} />
        </Route>

        {/* </Route> */}
        <Route element={<PrivateRoutes />}>
          <Route
            element={
              <DashboardRouteGuard>
                <DashboardLayout />
              </DashboardRouteGuard>
            }
          >
            <Route path="/dashboard">
              <Route index element={<DashboardOverview />} />
              <Route path="my-assets" element={<DashboardOverview />} />
              <Route path="add-asset" element={<DashboardOverview />} />
              <Route path="documents" element={<DashboardOverview />} />
              <Route path="messages" element={<DashboardOverview />} />
              <Route path="interest" element={<DashboardOverview />} />
              <Route path="reports" element={<DashboardOverview />} />
              <Route path="support" element={<DashboardOverview />} />
              <Route path="settings" element={<DashboardOverview />} />

              {/* Broker Dashboard Sub-routes */}
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="submit-lead" element={<DashboardOverview />} />
              <Route path="share-invite" element={<DashboardOverview />} />
              <Route path="my-referrals" element={<DashboardOverview />} />
              <Route path="commission-ledger" element={<DashboardOverview />} />
              <Route path="payout-requests" element={<DashboardOverview />} />
              <Route
                path="compliance-documents"
                element={<DashboardOverview />}
              />
              <Route path="training-rules" element={<DashboardOverview />} />
              <Route path="messages" element={<DashboardOverview />} />
              <Route path="profile-settings" element={<DashboardOverview />} />
              <Route path="my-assets" element={<DashboardOverview />} />
              <Route path="my-assets/:id" element={<DashboardOverview />} />
              <Route path="assets">
                <Route index element={<Assets />} />
              </Route>
              <Route
                path="PropertyFractionDetails/:id"
                element={<DashboardOverview />}
              />
              <Route path="wallet" element={<DashboardOverview />} />
              <Route path="profile" element={<DashboardOverview />} />
              <Route path="security" element={<Security />} />
              <Route path="terms" element={<Terms />} />
              <Route path="kyc" element={<DashboardOverview />} />
              <Route path="rwa" element={<RwaTab />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="rwa/rwa-form/:assetId" element={<Rwa />} />
              <Route
                path="rwa/onboarded-assets"
                element={<OnboardedAssets />}
              />
              <Route path="rwa/referred-assets">
                <Route index element={<DashboardOverview />} />
                <Route path=":id" element={<DashboardOverview />} />
              </Route>
              <Route
                path="rwa/onboarded-assets/:id"
                element={<AssetDetail />}
              />
              <Route path="rwa/vendors" element={<Vendors />} />
              <Route
                path="explore-properties"
                element={<RecommendedProperties />}
              />

              <Route path="leads" element={<Leads />} />
              <Route path="leads/:leadId" element={<LeadDetails />} />

              <Route path="commissions">
                <Route index element={<Commissions />} />

                <Route
                  path=":ledgerId/receipt"
                  element={<CommissionReceipt />}
                />

                <Route
                  path=":ledgerId/status"
                  element={<DashboardOverview />}
                />
              </Route>

              <Route path="properties" element={<PropertiesDashboard />} />
              <Route path="asset-onboarding" element={<AssetOnboarding />} />
              <Route path="referrals">
                <Route index element={<Referrals />} />
                {/* <Route
                  path="/dashboard/referrals/referral-asset-details"
                  element={<ReferralAssetDetails />}
                /> */}
              </Route>

              <Route path="chat" element={<Chat />} />

              <Route path="holdings">
                <Route index element={<DashboardOverview />} />
                <Route path=":id" element={<DashboardOverview />} />
              </Route>

              <Route path="marketplace" element={<DashboardOverview />} />
              <Route path="marketplace/:id" element={<DashboardOverview />} />

              <Route path="my-club" element={<DashboardOverview />} />
              <Route path="my-club/:id" element={<DashboardOverview />} />

              {/* Corporate-investor-only sidebar pages (rendered inside the
                  AssetOwnerDashboard shell via DashboardOverview) */}
              <Route path="discover-clubs" element={<DashboardOverview />} />
              <Route path="clubs-section" element={<DashboardOverview />} />
              <Route path="spv-list" element={<DashboardOverview />} />
              <Route path="governance" element={<DashboardOverview />} />
              <Route path="my-holdings" element={<DashboardOverview />} />
              <Route
                path="my-holdings/saved-assets"
                element={<DashboardOverview />}
              />
              <Route path="my-holdings/:id" element={<DashboardOverview />} />
              <Route
                path="primary-club-details/:id"
                element={<DashboardOverview />}
              />
              <Route path="returns-dashboard" element={<DashboardOverview />} />
              <Route path="refer-earn" element={<DashboardOverview />} />

              {/* Onboarding */}
              <Route element={<DashboardonboardProctRoute />}>
                <Route path="onboarding">
                  {/* The stepper/index page and the KYB form are rendered
                      inside the AssetOwnerDashboard sidebar shell (via
                      DashboardOverview) for roles that use it (company/
                      assetowner/corporate investor); other roles get them
                      standalone. */}
                  <Route index element={<DashboardOverview />} />
                  <Route path="kyb" element={<DashboardOverview />} />
                  <Route path="kyc" element={<DashboardOverview />} />
                  <Route path="user-kyc" element={<DashboardOverview />} />
                </Route>
              </Route>
            </Route>

            <Route path={ROUTES.USERS} element={<Users />} />
            {/* <Route
              path={ROUTES.COMPLETEPROFILE}
              element={<CompleteProfile />}
            /> */}
          </Route>
          <Route path={ROUTES.NOTIFICATION} element={<NotificationPage />} />
        </Route>

        {/* Always keep at last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
