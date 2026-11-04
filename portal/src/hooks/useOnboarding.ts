import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export function useOnboarding() {
  const { isAuthenticated, role } = useSelector(
    (state: RootState) => state.authLogin
  );
  const user = useSelector((state: RootState) => state.authLogin.user);

  const normalize = (v?: string) => v?.toLowerCase() ?? 'draft';

  const kycStatus = normalize(user?.kycStatus);
  const kybStatus = normalize(user?.kybStatus);

  const normalizedRole = role?.toLowerCase();

  const isBroker = normalizedRole === 'broker';
  const isCompany = normalizedRole === 'company';
  const isCorporateInvestor =
    normalizedRole === 'corporateinvestor' || isBroker;
  const isBusinessUser = !isCompany && !isCorporateInvestor;

  const kycApproved = kycStatus === 'approved';
  const kybApproved = kybStatus === 'approved';

  const kycInProgress =
    kycStatus === 'submitted' || kycStatus === 'under_review';

  const kybInProgress = kybStatus === 'submitted' || kybStatus === 'pending';

  const kycRejected = kycStatus === 'rejected';
  const kybRejected = kybStatus === 'rejected';

  const verificationState = isCompany
    ? !kybApproved
      ? kybStatus
      : kycStatus
    : kycStatus;

  const isKybSubmitted =
    kybStatus === 'submitted' || kybStatus === 'under_review';

  const isKybApproved = kybStatus === 'approved';

  const isKybCompleted = isKybSubmitted || isKybApproved;

  const isKycSubmitted =
    kycStatus === 'submitted' || kycStatus === 'under_review';

  const isKycApproved = kycStatus === 'approved';

  const isKycCompleted = isKycSubmitted || isKycApproved;

  const isDraft = isCompany
    ? kybStatus === 'draft' || (kybApproved && kycStatus === 'draft')
    : kycStatus === 'draft';

  const isSubmitted = isCompany
    ? kybInProgress || (kybApproved && kycInProgress)
    : kycInProgress;

  const isUnderReview = isSubmitted;

  const isApproved = isCompany ? kybApproved && kycApproved : kycApproved;

  const isRejected = isCompany
    ? kybRejected || (kybApproved && kycRejected)
    : kycRejected;

  const hasCompany = isCompany && !isBroker ? isKybCompleted : true;

  const hasDirectors =
    isCompany && !isBroker ? isKybCompleted && isKycCompleted : isKycCompleted;

  const hasBankAccounts = user?.isBankAdded === true;
  const hasAssets = Number(user?.assets ?? 0) > 0;

  const canAccessRwa =
    !isCorporateInvestor &&
    !isBroker &&
    (isCompany ? kybApproved && kycApproved : kycApproved);

  const rwaBlocked = isCorporateInvestor || isBroker;

  const rwaRequired = isCompany;
  const rwaOptional = !isCorporateInvestor;

  // const isOnboarded = isCompany ? kybApproved && kycApproved : kycApproved;

  const canInvest = isApproved;

  const kycMessage = (() => {
    if (isApproved) return null;

    if (isCompany) {
      if (isRejected) {
        return 'Your KYB or Directors KYC was rejected. Please review and resubmit to continue investing.';
      }

      if (isUnderReview) {
        return 'Your KYB and Directors KYC are under review. You will be notified once verification is complete.';
      }

      return 'Please complete your KYB and Directors KYC to start investing.';
    }

    if (isUnderReview) {
      return 'Your KYC is under review. You will be notified once it is approved.';
    }

    if (isRejected) {
      return 'Your KYC was rejected. Please resubmit to continue investing.';
    }

    return 'Please complete your KYC to start investing.';
  })();

  const needsOnboarding =
    isAuthenticated &&
    (isCompany && !isBroker
      ? !isKybCompleted || !isKycCompleted
      : !isKycCompleted);

  const bannerMessage = (() => {
    if (!needsOnboarding) return null;

    if (isRejected) {
      return 'Your verification was rejected. Please review and resubmit.';
    }

    return 'Local regulations require all Investors to complete onboarding before they can invest.';
  })();

  const getNextStepRoute = () => {
    if (isCompany && !isBroker) {
      if (kybRejected || !kybApproved) return '/kyb';
      if (kycRejected || !kycApproved) return '/kyc';
    } else {
      if (kycRejected || !kycApproved) return '/kyc';
    }

    if (canAccessRwa) return '/rwa';

    return null;
  };

  return {
    needsOnboarding,
    nextStepRoute: getNextStepRoute(),

    isCompany,
    isCorporateInvestor,
    isBusinessUser,

    hasCompany,
    hasDirectors,
    hasAssets,
    hasBankAccounts,

    rwaRequired,
    rwaBlocked,
    rwaOptional,

    verificationState,
    isDraft,
    isSubmitted,
    isUnderReview,
    isApproved,
    isRejected,
    canInvest,
    kycMessage,
    bannerMessage,
  };
}
