import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import CircleProgress from '@/components/CircularProgress';
import { FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function StepperProfile() {
  const [isStepperOpen, setIsStepperOpen] = useState(false);

  const headerStepper = useSelector(
    (state: RootState) => state.userProfile.headerStepper
  );

  if (!headerStepper) return null;

  const { currentStep, totalSteps, title, nextTitle, steps } = headerStepper;

  return (
    <>
      <div className="w-full bg-transparent rounded-xl relative block lg:hidden">
        <div className="flex items-center gap-2">
          <CircleProgress step={currentStep} totalSteps={totalSteps} />

          <div className="flex flex-col flex-wrap">
            <p className="text-white text-sm opacity-60">
              Step {currentStep}/{totalSteps}
            </p>
            <p className="text-white text-base font-semibold leading-tight">
              {title}
            </p>
            <p className="text-white text-sm opacity-60">
              {nextTitle ? `Next: ${nextTitle}` : 'Finish'}
            </p>
          </div>

          <FiChevronDown
            size={20}
            className="text-2xl cursor-pointer"
            onClick={() => setIsStepperOpen(true)}
          />
        </div>
      </div>

      {isStepperOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsStepperOpen(false)}
            />
            <div className="absolute left-1/2 top-[20%] w-[90vw] -translate-x-1/2">
              <div className="bg-dark-black rounded-xl p-6">
                <div className="flex flex-col">
                  {steps.map((step, index) => {
                    const isActive = step.step === currentStep;

                    return (
                      <div
                        key={step.step}
                        className="flex justify-between items-start gap-5"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-[40px] h-[40px] rounded-full border-2 text-[20px]
                              flex items-center justify-center
                              ${
                                step.completed
                                  ? 'bg-[#1E3D2B] border-green text-green'
                                  : isActive
                                    ? 'border-green text-green'
                                    : 'border-[#F5F5F5] text-white'
                              }
                            `}
                          >
                            {step.step}
                          </div>

                          {index !== steps.length - 1 && (
                            <div
                              className={`w-[2px] h-12 ${
                                step.completed ? 'bg-green' : 'bg-dark-grey'
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex flex-col flex-1">
                          <span className="text-green text-[12px] font-medium mb-1">
                            Step {step.step}/{totalSteps}
                          </span>
                          <span className="text-white text-[16px] font-medium">
                            {step.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
