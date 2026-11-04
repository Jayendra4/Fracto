import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import UnifiedStepper from '@/components/Stepper/UnifiedStepper';
import StepperProfile from '@/components/Stepper/StepperProfile';
import {
  KYB_STEPPER,
  RWA_STEPPER,
  DIRECTOR_KYC_STEPPER,
  USER_KYC_STEPPER,
} from '@/config';
import { useCollapsibleHeader } from '@/hooks/useCollapsibleHeader';

export default function HeaderSteppers({
  step,
  userKycStep,
  showKybStepper,
  showRwaStepper,
  showCompleteProfileDoItLater,
  showKycDoItLater,
  showUserKyc,
  directorKycStep,
  rwaOptional,
  rwaBlocked,
  isAuthenticated,
}: any) {
  const { ref, isOpen, toggle } = useCollapsibleHeader();

  const location = useLocation();
  const isRwaRoute = location.pathname.startsWith('/rwa');

  const shouldRender =
    isAuthenticated &&
    (showKybStepper ||
      showCompleteProfileDoItLater ||
      showKycDoItLater ||
      showUserKyc ||
      (isRwaRoute && (showRwaStepper || (rwaOptional && !rwaBlocked))));

  if (!shouldRender) return null;

  return (
    <div className="relative">
      <div
        className={`
          grid transition-[grid-template-rows] ease-in-out
          ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div
          ref={ref}
          className={`
            overflow-hidden
            transition-[opacity,transform] ease-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
          `}
        >
          {showKybStepper && (
            <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center py-2 px-4 gap-2">
              <UnifiedStepper {...KYB_STEPPER(step)} />

              <Link
                to="/"
                className="hidden whitespace-nowrap sm:block text-white bg-white/20 border border-white/40 px-3 py-2 rounded-sm font-medium hover:bg-white/30 transition"
              >
                Do It Later
              </Link>

              <Link
                to="/"
                className="block sm:hidden text-white font-medium text-[14px] hover:bg-white/30 transition cursor-pointer border-b border-white"
              >
                Skip
              </Link>
            </div>
          )}

          {isAuthenticated &&
            isRwaRoute &&
            (showRwaStepper || (rwaOptional && !rwaBlocked)) && (
              <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center py-2 px-4">
                <UnifiedStepper {...RWA_STEPPER(step)} />

                <Link
                  to="/"
                  className="hidden whitespace-nowrap sm:block text-white bg-white/20 border border-white/40 px-3 py-2 rounded-sm font-medium hover:bg-white/30 transition"
                >
                  Do It Later
                </Link>
                <Link
                  to="/"
                  className="block sm:hidden text-white font-medium text-[14px] hover:bg-white/30 transition cursor-pointer border-b border-white"
                >
                  Skip
                </Link>
              </div>
            )}

          {showCompleteProfileDoItLater && (
            <div className="w-full max-w-[1600px] mx-auto flex justify-end items-center py-2 px-4 gap-4">
              <StepperProfile />

              <Link
                to="/"
                className="hidden whitespace-nowrap sm:block text-white bg-white/20 border border-white/40 px-3 py-2 rounded-sm font-medium hover:bg-white/30 transition"
              >
                Do It Later
              </Link>
              <Link
                to="/"
                className="block sm:hidden text-white font-medium text-[14px] hover:bg-white/30 transition cursor-pointer border-b border-white"
              >
                Skip
              </Link>
            </div>
          )}

          {showKycDoItLater && (
            <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center py-2 px-4">
              <UnifiedStepper
                {...DIRECTOR_KYC_STEPPER}
                step={directorKycStep}
              />

              <Link
                to="/"
                className="hidden whitespace-nowrap sm:block text-white bg-white/20 border border-white/40 px-3 py-2 rounded-sm font-medium hover:bg-white/30 transition"
              >
                Do It Later
              </Link>
              <Link
                to="/"
                className="block sm:hidden text-white font-medium text-[14px] hover:bg-white/30 transition cursor-pointer border-b border-white"
              >
                Skip
              </Link>
            </div>
          )}

          {showUserKyc && (
            <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center py-2 px-4">
              <UnifiedStepper {...USER_KYC_STEPPER(userKycStep)} />

              <Link
                to="/"
                className="hidden whitespace-nowrap sm:block text-white bg-white/20 border border-white/40 px-3 py-2 rounded-sm font-medium hover:bg-white/30 transition"
              >
                Do It Later
              </Link>
              <Link
                to="/"
                className="block sm:hidden text-white font-medium text-[14px] hover:bg-white/30 transition cursor-pointer border-b border-white"
              >
                Skip
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] z-50">
        <button
          onClick={toggle}
          className="
            bg-white text-black rounded-full
            w-8 h-8
            flex items-center justify-center
            shadow-md
            hover:bg-gray-100
            transition
          "
          aria-label="Toggle stepper"
        >
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </div>
    </div>
  );
}
