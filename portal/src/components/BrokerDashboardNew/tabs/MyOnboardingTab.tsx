import Kyc from '@/components/Dashboard/Kyc';

interface MyOnboardingTabProps {
  showToast: (msg: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- prop kept for the caller's type-checked API surface; this tab doesn't need it
export default function MyOnboardingTab(_props: MyOnboardingTabProps) {
  return <Kyc />;
}
