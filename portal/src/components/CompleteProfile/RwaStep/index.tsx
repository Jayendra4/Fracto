import Congrats from '../Congrats';

export default function RwaStep({
  rwaBlocked,
  rwaOptional,
  navigate,
  isValidStep,
  rwaStep,
  isStepCompleted,
  handleRouteForStep,
}: any) {
  if (rwaBlocked) return null;
  const isRwaCompleted = isValidStep(rwaStep) && isStepCompleted(rwaStep);

  if (isRwaCompleted && !rwaOptional) {
    return (
      <Congrats
        title="Master RWA Form"
        highlightText="Your RWA asset details have been submitted."
        showNext={isStepCompleted(rwaStep)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 text-[var(--fg)] ">
        <div>
          <h2 className="text-[32px] font-medium">Master RWA Form</h2>
          <p className="font-normal text-[14px] text-[var(--fg)]/70  ">
            Master RWA Form have three steps .
          </p>
        </div>

        <div className="flex gap-3">
          {rwaOptional && (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-400 rounded-md"
            >
              Skip
            </button>
          )}

          <button
            onClick={() => {
              if (rwaOptional) {
                navigate('/dashboard/onboarding/rwa');
                return;
              }
              if (isValidStep(rwaStep)) {
                handleRouteForStep(rwaStep);
              }
            }}
            className="bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 text-white cursor-pointer font-20 font-medium px-5 py-3 min-w-[170px] rounded-xl"
          >
            Complete Now!
          </button>
        </div>
      </div>
      {/* {rwaOptional && isRwaCompleted && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <p className="text-green-400 text-sm font-medium mb-1">
            RWA Submitted
          </p>
          <p className="text-green-300 text-sm">
            Your RWA asset details have been submitted. You can add more assets
            anytime.
          </p>
        </div>
      )} */}

      <div className="w-full h-[1px] bg-gray-400 mb-10" />

      <div className="text-[var(--fg)]">
        <div className="flex flex-col relative pl-10">
          <div className="absolute left-4 top-9 bottom-9 w-[2px] bg-[var(--fg)]/50" />

          {[1, 2, 3, 4].map((stepId) => (
            <div
              key={stepId}
              className="relative mb-6 last:mb-0 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm p-5 rounded-2xl"
            >
              <div className="absolute -left-7 top-6 w-[10px] h-[10px] bg-[var(--fg)]/70 rounded-full" />
              <h4 className="text-[18px] font-medium mb-1">Step {stepId}/4</h4>
              <h3 className="text-[20px] font-medium mb-1 ">
                {
                  [
                    'Asset Basic Information',
                    'Ownership & Title Details',
                    'Financial & Valuation Details',
                    'Engineering / Technical Details',
                  ][stepId - 1]
                }
              </h3>
              <p className="text-gray-500 font-12">
                {stepId === 1 &&
                  'Enter your Asset Basic Information  to complete your company RWA form. It only takes a few minutes...'}
                {stepId === 2 &&
                  'Enter your company’s text and regulatory details to complete your company KYB form. It only takes a few minutes...'}
                {stepId === 3 &&
                  'Provide Financial & Valuation Details. It only takes a few minutes...'}
                {stepId === 4 &&
                  'Provide Engineering / Technical Details. It only takes a few minutes...'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
