export default function AccountStep({
  isStepCompleted,
  handleRouteForStep,
}: {
  isStepCompleted: (step: number) => boolean;
  handleRouteForStep: (step: number) => void;
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-32 text-[var(--fg)] font-medium">Account Creation</h2>
          <p className="font-normal font-14 text-[var(--fg)]/40">
            Step successfully completed
          </p>
        </div>

        {!isStepCompleted(2) && (
          <button
            onClick={() => handleRouteForStep(2)}
            className="bg-gradient-to-r from-[#4F86C0] to-[#2A5A8D] cursor-pointer font-20 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Next Step
          </button>
        )}
      </div>
      <div className="w-full h-[1px] bg-[var(--fg)]/10 mb-6" />
      <div className="flex flex-col items-center justify-center py-14">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <img
            src="/images/complete.svg"
            className="w-[80px] relative z-10"
            alt="complete"
          />
        </div>

        <h2 className="font-44 text-green-500 font-medium mb-2">Congratulations!</h2>

        <p className="font-24 text-[var(--fg)]/80 max-w-[680px] text-center leading-relaxed">
          <span className="font-semibold text-green-500/80">Your account has been created,</span>{' '}
          Let’s continue with the next step...
        </p>
      </div>
    </>
  );
}
