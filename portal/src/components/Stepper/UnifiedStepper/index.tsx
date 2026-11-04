import { motion } from 'framer-motion';
import CircleProgress from '@/components/CircularProgress';
import type { StepperConfig } from '@/interface';

interface UnifiedStepperProps extends StepperConfig {
  onStepClick?: (step: number) => void;
  allowFutureClick?: boolean;
}

export default function UnifiedStepper({
  step,
  totalSteps,
  stepTitles,
  onStepClick,
  allowFutureClick = false,
}: UnifiedStepperProps) {
  const safeStep = Math.min(Math.max(step, 1), totalSteps);

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const canClick = (lvl: number) => {
    if (!onStepClick) return false;
    if (lvl === safeStep) return true;
    if (lvl < safeStep) return true;
    if (allowFutureClick && lvl > safeStep) return true;
    return false;
  };

  return (
    <div className="bg-transparent rounded-xl md:px-6  flex items-center justify-between">
      <div className="hidden md:flex items-center gap-6">
        <div className="h-full w-[1px] bg-white/20"></div>

        <div className="flex items-center lg:gap-4 gap-2 relative">
          {steps.map((lvl, i) => {
            const isCompleted = lvl < safeStep;
            const isActive = lvl === safeStep;
            const clickable = canClick(lvl);

            return (
              <div key={lvl} className="relative flex items-center">
                <motion.div
                  whileHover={clickable ? { scale: 1.08 } : undefined}
                  whileTap={clickable ? { scale: 0.95 } : undefined}
                  onClick={() => clickable && onStepClick?.(lvl)}
                  className={`
                    lg:w-12 lg:h-12 sm:w-10 sm:h-10 w-8 h-8 rounded-full
                    flex items-center justify-center border-2 font-36
                    transition cursor-${clickable ? 'pointer' : 'default'}
                    ${
                      isActive
                        ? 'border-green text-white'
                        : isCompleted
                          ? 'border-green bg-green text-white'
                          : 'border-white text-white'
                    }
                  `}
                >
                  {lvl}
                </motion.div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mx-2"
                  >
                    <p className="text-sm mb-0 text-green">
                      Step {safeStep}/{totalSteps}
                    </p>
                    <p className="text-white font-18 font-medium">
                      {stepTitles[lvl]}
                    </p>
                  </motion.div>
                )}

                {i !== steps.length - 1 && (
                  <div className="lg:w-18 w-14 h-[2px] lg:mx-2 mx-1 bg-white/30 relative overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-green"
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:hidden flex items-center justify-center gap-6">
        <CircleProgress step={step} totalSteps={totalSteps} />
        <div>
          <p className="text-white font-18 font-semibold">{stepTitles[step]}</p>
          <p className="text-white text-sm opacity-60">
            Next: {stepTitles[safeStep + 1] || 'Finish'}
          </p>
        </div>
      </div>
    </div>
  );
}
