import CircularProgress from '@/components/CircularProgress';
interface StepperKYBProps {
  step: 1 | 2 | 3 | 4;
}
const stepTitles: Record<number, string> = {
  1: 'Company Basic Details',
  2: 'Tax & Regulatory Details',
  3: 'Business Profile',
  4: 'Documents Upload',
};
export default function StepperKYB({ step }: StepperKYBProps) {
  return (
    <div className="w-full bg-transparent rounded-xl">
      <div className="hidden md:flex  items-center gap-6">
        <div className="h-full w-[1px] bg-white/20"></div>
        <div className="flex items-center  relative">
          {[1, 2, 3, 4].map((lvl, i) => {
            const isCurrent = step === lvl;
            const isCompleted = lvl < step;

            return (
              <div key={lvl} className="relative flex items-center">
                <div
                  className={`
                    lg:w-12 lg:h-12 sm:h-10 sm:w-10 w-8 h-8  rounded-full flex items-center justify-center border-2 font-36
                    ${
                      isCurrent
                        ? 'border-green text-white'
                        : isCompleted
                          ? 'border-green bg-green text-white'
                          : 'border-white text-white'
                    }
                  `}
                >
                  {lvl}
                </div>
                {isCurrent && (
                  <p className="absolute top-10 left-1/2 -translate-x-1/2 text-white text-xs whitespace-nowrap">
                    {stepTitles[lvl]}
                  </p>
                )}

                {isCurrent && (
                  <div className="mx-2">
                    <p className=" text-sm mb-0 text-green">Step {step}/4</p>
                    <p className="text-white font-18 font-medium">
                      {stepTitles[step]}
                    </p>
                  </div>
                )}
                {i !== 3 && (
                  <div
                    className={`lg:w-18 w-14 h-[2px] lg:mx-2  mx-1 ${
                      isCompleted ? 'bg-green' : 'bg-white/30'
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className=" md:hidden flex items-center gap-6">
        <CircularProgress step={step} totalSteps={4} />
      </div>
    </div>
  );
}
