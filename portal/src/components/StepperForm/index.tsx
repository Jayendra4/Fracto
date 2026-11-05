import { useOnboarding } from '@/hooks';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsCheck2 } from 'react-icons/bs';

interface Step {
  id: string;
  step: number;
  title: string;
  subtitle: string;
}

interface StepperFormProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  completedSteps?: Record<number, boolean>;
  children?: React.ReactNode;
}

export default function StepperForm({
  steps,
  currentStep,
  onStepClick,
  completedSteps = {},
  children,
}: StepperFormProps) {
  const { isApproved, isRejected, isUnderReview } = useOnboarding();
  const Submitted = isApproved || isRejected || isUnderReview;

  return (
    <section className="flex w-full min-h-screen bg-white dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white justify-center transition-all duration-300 relative font-work px-4 lg:px-10 overflow-hidden pb-10">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-[#1F4FE0]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-col space-y-10 mb-8 pt-32 md:pt-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 pt-4">
          <div className="space-y-1 pagehead">
            <h2 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
              Onboarding Steps
            </h2>
            <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
              Verify your identity to unlock full access.
            </p>
          </div>
          {!Submitted && (
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 px-5 py-2.5 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#0B2545] dark:hover:text-white transition-all duration-300"
              >
                Do It Later
              </Link>
              <Link
                to="/"
                className="block sm:hidden text-[#0B2545] dark:text-white font-semibold text-sm hover:opacity-70 transition border-b border-gray-300 dark:border-white/20 pb-0.5"
              >
                Skip
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="flex lg:hidden flex-col space-y-4 px-4">
          <div className="flex items-center justify-between font-12 font-bold">
            <span className="text-[#1F4FE0] dark:text-[#60a5fa] uppercase tracking-wider">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(
                (Object.keys(completedSteps).filter(
                  (k) => completedSteps[Number(k)]
                ).length /
                  steps.length) *
                  100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(Object.keys(completedSteps).filter((k) => completedSteps[Number(k)]).length / steps.length) * 100}%`,
              }}
              className="h-full bg-gradient-to-r from-[#1F4FE0] to-[#2563EB]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {steps.map((step) => {
              const isActive = currentStep === step.step;
              const isCompleted = !!completedSteps[step.step];
              return (
                <div
                  key={step.id}
                  onClick={() =>
                    (isActive || isCompleted) && onStepClick(step.step)
                  }
                  className={`flex-none px-4 py-2 rounded-lg border text-[11px] font-bold transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-[#1F4FE0] border-[#1F4FE0] text-white shadow-sm shadow-[#1F4FE0]/20'
                        : isCompleted
                          ? 'bg-green/10 border-green/20 text-green'
                          : 'bg-white dark:bg-[#132436] border-[#E3E7EE] dark:border-white/5 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {isCompleted ? <BsCheck2 className="inline mr-1" /> : null}
                  {step.title}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start px-4">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col w-[340px] sticky top-32">
            <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-6">
              <div className="space-y-3">
                {steps.map((step) => {
                  const isActive = currentStep === step.step;
                  const isCompleted = !!completedSteps[step.step];

                  const lastCompletedStep = Math.max(
                    0,
                    ...Object.keys(completedSteps)
                      .filter((k) => completedSteps[Number(k)])
                      .map(Number)
                  );

                  const isNextExpectedStep =
                    step.step === lastCompletedStep + 1;
                  const isClickable =
                    isActive || isCompleted || isNextExpectedStep;

                  return (
                    <div
                      key={step.id}
                      className={`group relative flex items-center gap-5 p-4 rounded-xl transition-all duration-500
                        ${
                          isActive
                            ? 'bg-[#1F4FE0] shadow-md shadow-[#1F4FE0]/20 z-10'
                            : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                        }
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
                      `}
                      onClick={() => isClickable && onStepClick(step.step)}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold font-14 transition-all duration-500 shrink-0
                        ${
                          isActive
                            ? 'bg-white border-white text-[#1F4FE0] shadow-sm'
                            : isCompleted
                              ? 'bg-green-500/10 border-green-500/30 text-green-500'
                              : 'border-gray-300 dark:border-white/20 text-gray-400 dark:text-gray-500'
                        }
                      `}
                      >
                        {isCompleted ? (
                          <BsCheck2 className="text-lg" />
                        ) : (
                          step.step
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] uppercase tracking-[0.2em] font-bold
                          ${isActive ? 'text-white/70' : isCompleted ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                          Phase 0{step.step}
                        </span>
                        <span
                          className={`font-14 md:font-16 font-semibold transition-colors duration-300
                          ${isActive ? 'text-white' : isCompleted ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10">
                <p className="font-12 font-medium text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Your progress is saved automatically. You can return anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full overflow-hidden">
            <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/5 shadow-sm rounded-xl px-6 min-h-[500px] w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
