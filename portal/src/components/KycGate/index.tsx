import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';

export default function KycGate({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.authLogin.user);
  const kycStatus = user?.kycStatus;

  const isApproved = kycStatus === 'Approved';
  const isSubmitted = kycStatus === 'Submitted';
  const isUnderReview = kycStatus === 'UnderReview';
  const isRejected = kycStatus === 'Rejected';

  if (isApproved) {
    return <>{children}</>;
  }

  let title = 'Complete KYC to continue';
  let description =
    message ?? 'This feature is available only after KYC approval.';
  let showCta = true;

  if (isSubmitted) {
    title = 'KYC Submitted';
    description = 'Your KYC has been submitted and is awaiting review.';
    showCta = false;
  }

  if (isUnderReview) {
    title = 'KYC Under Review';
    description =
      'Our team is reviewing your KYC. This usually takes 24–48 hours.';
    showCta = false;
  }

  if (isRejected) {
    title = 'KYC Rejected';
    description =
      'Your KYC was rejected. Please review and resubmit your details.';
    showCta = true;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none blur-[2px] opacity-60 scale-[0.995] transition">
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-6 py-5 text-center max-w-sm">
          <p className="text-yellow text-sm font-medium">{title}</p>

          <p className="text-xs text-white/60 mt-1 mb-4">{description}</p>

          {showCta && (
            <button
              onClick={() => navigate('/dashboard/kyc')}
              className="
                px-5 py-2 rounded-md text-sm font-medium
                bg-gradient-to-r from-[#4F86C0] to-[#2A5A8D]
                text-white hover:opacity-90 transition
              "
            >
              Go to KYC
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
