import StepperForm from '@/components/StepperForm';
import StepTransition from '@/components/StepTransition';

export default function StepperContainer({
  steps,
  currentStep,
  onStepClick,
  completedSteps,
  children,
}: any) {
  const normalized: Record<number, boolean> = Object.fromEntries(
    steps.map((s: any) => [s.step, !!completedSteps[s.step]])
  );

  return (
    <StepperForm
      steps={steps}
      currentStep={currentStep}
      onStepClick={onStepClick}
      completedSteps={normalized}
    >
      <StepTransition step={currentStep}>{children}</StepTransition>
    </StepperForm>
  );
}
