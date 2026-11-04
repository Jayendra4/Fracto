import { useLocalUser } from '@/hooks/useLocalUser';

export const useCompletedSteps = ({ isCompany }: any) => {
  const user = useLocalUser() as {
    kybStatus?: string;
    kycStatus?: string;
  };

  const normalize = (v?: string) => v?.toLowerCase();

  const kybStatus = normalize(user?.kybStatus);
  const kycStatus = normalize(user?.kycStatus);

  const kybCompleted =
    kybStatus === 'submitted' ||
    kybStatus === 'under_review' ||
    kybStatus === 'approved';

  const kycCompleted =
    kycStatus === 'submitted' ||
    kycStatus === 'under_review' ||
    kycStatus === 'approved';

  const completedSteps: Partial<Record<number, boolean>> = isCompany
    ? {
        1: kybCompleted,
        2: kybCompleted && kycCompleted,
      }
    : {
        1: kycCompleted,
      };

  const isStepCompleted = (step: number) => !!completedSteps[step];

  return { completedSteps, isStepCompleted };
};
