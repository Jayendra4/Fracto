type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export default function StepProgress({
  currentStep,
  totalSteps,
}: StepProgressProps) {
  const progressPercentage = Math.min((currentStep  / totalSteps) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center font-20 text-[var(--fg)] font-medium">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-dark-grey">
          {Math.round(progressPercentage)}% Completed
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/60 overflow-hidden">
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r from-green-400 to-green-500
            transition-all duration-500
          "
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
