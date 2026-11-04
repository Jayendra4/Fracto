import { useState } from 'react';
import Loader from '@/components/Loader';
import { HiArrowLongRight } from 'react-icons/hi2';

const CONGRATS_ICON_PATH = '/images/complete.svg';

export default function SignupModal({
  showModal,
  setShowModal,
  modalPayload,
  handleModalContinue,
}: any) {
  const [loading, setLoading] = useState(false);

  if (!showModal || !modalPayload) return null;

  const closeAndContinue = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setShowModal(false);

      if (typeof handleModalContinue === 'function') {
        await handleModalContinue();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500"
        onClick={closeAndContinue}
      >
        <div
          className="max-w-xl w-full mx-4 md:mx-10 bg-[var(--inner-card)] rounded-[32px] p-8 md:p-12 text-center border border-[var(--fg)]/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden group animate-in fade-in zoom-in duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all duration-700" />

          <button
            onClick={closeAndContinue}
            disabled={loading}
            className="absolute right-6 top-6 text-[var(--fg)]/40 hover:text-[var(--fg)] text-2xl cursor-pointer disabled:opacity-50 transition-colors"
          >
            <span className="sr-only">Close</span>✕
          </button>

          <div className="flex flex-col items-center gap-6 md:gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <img
                src={CONGRATS_ICON_PATH}
                alt="congrats"
                className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(51,189,86,0.3)]"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-48 font-bold text-[var(--fg)]">
                {modalPayload.title}
              </h3>

              <div className="flex flex-col gap-1">
                {Array.isArray(modalPayload.subtitle) ? (
                  modalPayload.subtitle.map((line: string, i: number) => (
                    <p
                      key={i}
                      className="text-[var(--fg)]/60 font-20 font-light leading-relaxed"
                    >
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-[var(--fg)]/60 font-20 font-light leading-relaxed">
                    {modalPayload.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-[var(--fg)]/10" />

            <div className="space-y-4 w-full">
              <div className="bg-[var(--fg)]/5 rounded-2xl p-6 border border-[var(--fg)]/5 space-y-2">
                <p className="text-[var(--fg)] font-18 font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  Next Step: Verify Your Identity
                </p>

                <p className="font-14 text-[var(--fg)]/50 leading-relaxed max-w-sm mx-auto">
                  To activate your account and access premium features, please
                  complete the{' '}
                  <span className="text-[var(--fg)]/80 font-medium">
                    {modalPayload.text}
                  </span>{' '}
                  form.
                </p>
              </div>

              <button
                onClick={closeAndContinue}
                disabled={loading}
                className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-[#4F86C0] to-[#2A5A8D] text-white font-semibold text-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Processing...' : 'Let’s Get Started'}
                  {!loading && (
                    <span className="text-xl group-hover:translate-x-1 transition-transform">
                      <HiArrowLongRight />
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
