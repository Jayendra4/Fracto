interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function UserKycStepper({ currentStep, totalSteps = 4 }: Props) {
  const percentage = Math.round((currentStep/ totalSteps) * 100);

  return (
    <div>
      <div className="flex justify-between items-center font-new-20 text-[var(--fg)] py-1 lg:py-3 transition">
        <p>Step {currentStep} of {totalSteps}</p>
        <p className="font-16 text-[var(--fg)]">{percentage}% Completed</p>
      </div>
      <div className="w-full h-1 lg:h-2 rounded-full bg-[var(--fg)]/10 mb-8 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}/>
      </div>
    </div>
  );
}
