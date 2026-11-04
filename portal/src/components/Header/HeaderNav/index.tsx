import { Link, useNavigate } from 'react-router-dom';
import { scrollToSection } from '@/utils';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export default function HeaderNav({
  navLinks,
}: {
  navLinks: { label: string; id: string }[];
}) {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';

  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 xl:gap-14 min-w-0">
      <Link to="/">
        {isDark ? (
          <img
            src="/images/header/hof-logo-dark.svg"
            className={`w-[170px]  lg:w-[220px] 2xl:w-[250px] h-auto shrink-0`}
            alt="Logo"
          />
        ) : (
          <img
            src="/images/header/hof-logo-light.svg"
            className={`w-[170px] lg:w-[220px] 2xl:w-[250px] h-auto shrink-0`}
            alt="Logo"
          />
        )}
      </Link>

      <div className="hidden lg:flex gap-3 lg:gap-3 xl:gap-4 2xl:gap-10 bg-[var(--bg)]">
        {navLinks.map(({ label, id }) => (
          <Link
            key={id}
            to={id.startsWith('/') ? id : ''}
            onClick={(e) => {
              if (id.startsWith('/')) return;

              e.preventDefault();
              if (location.pathname === '/') {
                scrollToSection(id);
              } else {
                navigate('/', {
                  state: { scrollTo: id },
                });
              }
            }}
            className="text-sm lg:text-base 2xl:text-lg whitespace-nowrap font-medium relative inline-block w-fit after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-[var(--fg)] after:transition-all after:duration-300 hover:after:w-full"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
