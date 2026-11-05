import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/UI/Button';
import { Link } from 'react-router-dom';
import { saveRegistrationData } from '@/redux/slices/authSlice';
import { motion } from 'framer-motion';

export default function SignupStep0Welcome({
  setStep,
}: {
  setStep: (s: 1) => void;
}) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<'buy' | 'fractionalize' | 'broker'>(
    'fractionalize'
  );

  type Role = 'buy' | 'fractionalize' | 'broker';
  const roles: {
    id: Role;
    label: string;
    description: string;
    img: string;
  }[] = [
    {
      id: 'fractionalize',
      label: 'Asset Owner',
      description: 'I want to split and list my property investments',
      img: '/images/auth/asset-owner.svg',
    },
    {
      id: 'buy',
      label: 'Investor',
      description: 'I want to browse and buy property Structural Co-ownership',
      img: '/images/auth/investor.svg',
    },
    {
      id: 'broker',
      label: 'Partners',
      description: 'I want to earn and grow income from referrals',
      img: '/images/auth/broker.svg',
    },
  ];

  const handleContinue = () => {
    if (!selected) return;
    const registerUserType = selected === 'buy' ? 'end-user' : 'business';

    const sourceRole =
      selected === 'broker'
        ? 'broker'
        : selected === 'fractionalize'
          ? 'asset-owner'
          : 'investor';

    dispatch(
      saveRegistrationData({
        registerUserType,
        sourceRole,
      })
    );
    localStorage.setItem('hof_register_user_type', registerUserType);
    setStep(1);
  };

  return (
    <div className="max-w-175 mx-auto flex flex-col items-center justify-start lg:justify-center gap-4 xl:gap-6 font-work">
      <div className="w-full p-4 pt-4 sm:pt-10">
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full">
          {roles.map((role, idx) => {
            const isActive = selected === role.id;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, translateY: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(role.id)}
                className={`
              relative flex flex-col items-center justify-start
              flex-1 min-w-[140px] sm:min-w-[155px] h-auto sm:h-full p-3 sm:p-4 py-4 sm:py-6 rounded-2xl border transition-all duration-300 group overflow-hidden
              ${
                isActive
                  ? 'border-transparent bg-gradient-to-br from-[#4F46E5] to-[#2563EB] shadow-[0_6px_16px_rgba(79, 70, 229,0.2)]'
                  : 'border-[var(--fg)]/10 bg-[var(--inner-card)] hover:border-[var(--fg)]/30 hover:shadow-sm'
              }
            `}
              >
                {/* Visual Decorative Glow for active state */}
                {isActive && (
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/20 blur-2xl rounded-full" />
                )}

                <div
                  className={`mb-3 sm:mb-5 p-3 sm:p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-[var(--fg)]/5 group-hover:bg-[var(--fg)]/10'}`}
                >
                  <img
                    src={role.img}
                    alt={role.label}
                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                </div>

                <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
                  <span
                    className={`font-semibold font-16 tracking-tight transition-colors duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-[var(--fg)] group-hover:text-[#4F46E5]'
                    }`}
                  >
                    {role.label}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-medium leading-tight sm:leading-relaxed transition-colors duration-300 ${isActive ? 'text-white/80' : 'text-[var(--fg)]/40 group-hover:text-[var(--fg)]/60'}`}
                  >
                    {role.description}
                  </span>
                </div>

                {/* Selection indicator DOT */}
                {isActive && (
                  <motion.div
                    layoutId="activeRoleDot"
                    className="absolute bottom-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <Button
          disabled={!selected}
          onClick={handleContinue}
          className="w-full py-4 rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
        >
          Create!
        </Button>
        <p className="font-normal text-[var(--fg)] font-20 leading-[20px]">
          Already a member?{' '}
          <Link to="/login">
            <span className="text-blue hover:underline cursor-pointer">
              Login Here
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
