// import { useOnboarding } from '@/hooks';
// import type { JSX } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// interface DashboardTab {
//   label: string;
//   path: string;
//   permission?: string;
// }

// interface DashboardNavProps {
//   tabs: readonly DashboardTab[];
// }

// export default function DashboardNav({ tabs }: DashboardNavProps): JSX.Element {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//     const { isCompany, hasDirectors } = useOnboarding();
//     const isUserKycCompleted = !isCompany && hasDirectors;

//   return (
//     <div className="w-full border-t border-white/20 px-4 lg:px-10">
//       <div className="max-w-[1600px] mx-auto">
//         <div className="flex items-center justify-between gap-7 py-6 pb-4 overflow-x-auto lg:overflow-visible scrollbar-hide">
//           {tabs.map((tab) => {
//             const active = pathname === tab.path;

//             return (
//               <button
//                 key={tab.path}
//                 onClick={() => navigate(tab.path)}
//                 className="relative flex-shrink-0 pb-[10px] font-20 leading-[100%] tracking-[0%] font-medium text-white/70 hover:text-white transition font-work"
//               >
//                 <span
//                   className={
//                     active
//                       ? 'text-black font-medium font-24 leading-[100%] tracking-[0%]'
//                       : ''
//                   }
//                 >
//                   {tab.label}
//                 </span>

//                 <span
//                   className={`absolute left-0 right-0 -bottom-[1px] h-[2px] bg-black transform transition-transform duration-300 ${
//                     active ? 'scale-x-100' : 'scale-x-0'
//                   }`}
//                   style={{ transformOrigin: 'center' }}
//                 />
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useOnboarding } from '@/hooks';
import { useEffect, useRef, useState, type JSX } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';

interface DashboardTab {
  label: string;
  path: string;
  permission?: string;
}

interface DashboardNavProps {
  tabs: readonly DashboardTab[];
}

export default function DashboardNav({ tabs }: DashboardNavProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const showArrows = canScrollLeft || canScrollRight;

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { needsOnboarding } = useOnboarding();

  const visibleTabs = tabs.filter((tab) => {
    if (
      (tab.path === '/dashboard/kyc' || tab.path === '/dashboard/onboarding') &&
      !needsOnboarding
    ) {
      return false;
    }

    return true;
  });

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

    setCanScrollLeft((prev) => (prev !== left ? left : prev));
    setCanScrollRight((prev) => (prev !== right ? right : prev));
  };

  const lockScrollBeforeNavigate = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft > maxScroll) {
      el.scrollLeft = maxScroll;
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [visibleTabs]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--fg)] px-4 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="relative flex items-center">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`mr-2 p-1 rounded-full transition
            ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${canScrollLeft ? 'hover:bg-[var(--fg)]/10' : 'opacity-30'}
          `}
          >
            <FiChevronLeft size={22} />
          </button>

          <LayoutGroup id="dashboard-tabs">
            <div
              ref={scrollRef}
              onScroll={updateScrollButtons}
              className="flex items-center gap-10 md:gap-15 lg:gap-20 py-5 pb-4 overflow-hidden whitespace-nowrap"
            >
              {visibleTabs.map((tab) => {
                const active =
                  pathname === tab.path ||
                  (pathname.startsWith(tab.path + '/') &&
                    tab.path !== '/dashboard');

                return (
                  <button
                    key={tab.path}
                    onClick={() => {
                      lockScrollBeforeNavigate();
                      navigate(tab.path);
                    }}
                    className="relative flex-shrink-0 pb-[10px] font-20 leading-[100%] font-medium hover:text-[var(--fg)] transition font-work"
                  >
                    <span className={active ? 'font-medium font-24' : ''}>
                      {tab.label}
                    </span>

                    {active && (
                      <motion.span
                        layoutId="dashboard-tab-underline"
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[var(--fg)]"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`ml-2 p-1 rounded-full transition
            ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${canScrollRight ? 'hover:bg-[var(--fg)]/10' : 'opacity-30'}
          `}
          >
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
