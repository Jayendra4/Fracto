/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import StepperForm from '@/components/StepperForm';
import StepTransition from '@/components/StepTransition';
import Loader from '@/components/Loader';
import StatusModal from '@/components/Modals/Status';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import { useStepLoader } from '@/hooks/useStepLoader';
import {
  saveUserProfileStep,
  setHeaderStepper,
} from '@/redux/slices/userProfileSlice';
import { useCompletedSteps } from '@/hooks/CompleteProfile';
import { KybStep, DirectorsOrUserKycStep } from '@/components/CompleteProfile';

export default function Onboarding(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  const { run: runUserFetchFlow } = useFetchUserDataFlow();

  const { isCompany, hasCompany, hasDirectors } = useOnboarding();

  const steps = isCompany
    ? [
        {
          id: 'kyb',
          step: 1,
          title: 'KYB',
          subtitle: 'Business verification',
        },
        {
          id: 'directors-kyc',
          step: 2,
          title: 'Directors KYC',
          subtitle: 'Director identity verification',
        },
      ]
    : [
        {
          id: 'user-kyc',
          step: 1,
          title: 'KYC',
          subtitle: 'Identity verification',
        },
      ];

  const { completedSteps, isStepCompleted } = useCompletedSteps({
    isCompany,
    hasCompany,
    hasDirectors,
  });

  const determineInitialStep = (): 1 | 2 => {
    if (isCompany) {
      if (!hasCompany) return 1;
      if (!hasDirectors) return 2;
      return 2;
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const stepLoading = useStepLoader(currentStep);

  useEffect(() => {
    const token = Cookies.get('hof_token') || '';
    if (token) {
      runUserFetchFlow(token);
    }
  }, []);

  useEffect(() => {
    setCurrentStep(determineInitialStep());
  }, [isCompany, hasCompany, hasDirectors]);

  const handleStepClick = (id: number) => {
    if (id === currentStep) return;

    setCurrentStep(id as any);
  };

  const handleRouteForStep = (id: number) => {
    const base = '/dashboard/onboarding';

    if (isCompany) {
      if (id === 1) navigate(`${base}/kyb`);
      if (id === 2) navigate(`${base}/kyc`);
    } else {
      if (id === 1) navigate(`${base}/user-kyc`);
    }
  };

  const currentStepMeta = steps.find((s) => s.step === currentStep);
  const nextStepMeta = steps.find((s) => s.step === currentStep + 1);

  useEffect(() => {
    if (!currentStepMeta) return;

    dispatch(saveUserProfileStep(currentStep));

    dispatch(
      setHeaderStepper({
        currentStep,
        totalSteps: steps.length,
        title: currentStepMeta.title,
        nextTitle: nextStepMeta?.title,
        steps: steps.map((s) => ({
          step: s.step,
          title: s.title,
          completed: !!isStepCompleted(s.step),
        })),
      })
    );
  }, [currentStep, steps]);

  const renderWithLoader = (content: JSX.Element | null) =>
    stepLoading ? (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader isFullPage={false} />
      </div>
    ) : (
      content
    );

  const stepKeyMap: Record<number, string> = isCompany
    ? {
        1: 'kyb',
        2: 'directors',
      }
    : {
        1: 'userKyc',
      };

  const stepKey = stepKeyMap[currentStep];

  const renderContent = () => {
    switch (stepKey) {
      case 'kyb':
        return (
          <KybStep
            isStepCompleted={isStepCompleted}
            handleRouteForStep={handleRouteForStep}
          />
        );

      case 'directors':
      case 'userKyc':
        return (
          <DirectorsOrUserKycStep
            stepKey={stepKey}
            currentStep={currentStep}
            isStepCompleted={isStepCompleted}
            handleRouteForStep={handleRouteForStep}
          />
        );

      default:
        return null;
    }
  };

  const completedStepsForStepper: Record<number, boolean> = Object.fromEntries(
    steps.map((s) => [s.step, !!completedSteps[s.step]])
  );

  return (
    <>
      <StepperForm
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={completedStepsForStepper}
      >
        <StepTransition step={currentStep}>
          {renderWithLoader(renderContent())}
        </StepTransition>
      </StepperForm>

      <StatusModal
        open={errorModal.open}
        status="error"
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
        onContinue={() => setErrorModal({ open: false, message: '' })}
      />
    </>
  );
}
