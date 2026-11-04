import { Link, useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks';

type DashboardTab = {
  label: string;
  path: string;
};

const VERIFICATION_PATHS = new Set(['/dashboard/kyc', '/dashboard/onboarding']);

export default function DashboardUserNav({
  tabs,
}: {
  tabs: readonly DashboardTab[];
}) {
  const { needsOnboarding } = useOnboarding();
  const { pathname } = useLocation();

  const visibleTabs = tabs.filter(
    (tab) => !(VERIFICATION_PATHS.has(tab.path) && !needsOnboarding)
  );

  return (
    <div className="hidden lg:flex lg:gap-3 2xl:gap-10 text-[var(--fg)]">
      {visibleTabs.map(({ label, path }) => {
        const active = pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`font-20 font-medium relative inline-block w-fit after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-[var(--fg)] after:transition-all after:duration-300 
            ${active ? 'after:w-full text-[var(--fg)]' : 'after:w-0 text-text-[var(--fg)]/90 hover:text-[var(--fg)] hover:after:w-full'}
          `}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
