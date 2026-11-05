import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToSection } from '@/utils';
import { ROUTES } from '@/constants';
import {
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaFacebookF,
} from 'react-icons/fa6';

const FOOTER_PLATFORM = [
  { label: 'What we do', id: 'whatWeDo' }, // section
  // { label: 'Properties', id: ROUTES.PROPERTIES }, // route
  { label: 'FAQs', id: 'faq' }, // section
];

const FOOTER_COMPANY = [
  { label: 'About Us', id: ROUTES.ABOUT },
  { label: 'Blog', id: '#' }, // No blog route yet
  { label: 'T&C', id: ROUTES.TERMS_CONDITION },
  { label: 'Privacy Policy', id: ROUTES.PRIVACY_POLICY },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick =
    (
      id: string,
      location: ReturnType<typeof useLocation>,
      navigate: ReturnType<typeof useNavigate>
    ) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Normal route → let React Router handle it
      if (id.startsWith('/')) return;

      e.preventDefault();

      // Section scroll
      if (location.pathname === '/') {
        scrollToSection(id);
      } else {
        navigate('/', { state: { scrollTo: id } });
      }
    };
  return (
    <footer className="w-full font-work bg-[#060A14] border-t border-slate-800/80 px-4 lg:px-10 pt-8 md:pt-14">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col xl:flex-row justify-between">
        <div className="space-y-4 max-w-[514px]">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/images/svgLogo.svg"
                className="lg:w-[220px] shrink-0 xl:w-[280px] sm:w-[200px] w-[170px]"
                alt="Fracto Logo"
              />
            </Link>
          </div>

          <p className="text-slate-400 font-normal font-20 my-3 max-w-[500px]">
            Structured real estate participation — accessible, transparent, and
            documented.
          </p>
          <div>
            <ul>
              <li className="flex items-center gap-3 py-4">
                <Link
                  to="/"
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm"
                  aria-label="Open Twitter"
                >
                  <FaXTwitter size={18} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm"
                  aria-label="Open instagram"
                >
                  <FaInstagram size={18} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm"
                  aria-label="Open Youtube"
                >
                  <FaYoutube size={18} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm"
                  aria-label="Open Facebook"
                >
                  <FaFacebookF size={18} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-8 mt-8 xl:mt-0">
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-white font-semibold font-20">Platform</h3>

            <ul className="space-y-2 text-slate-400 font-work font-16">
              {FOOTER_PLATFORM.map(({ label, id }) => (
                <li key={id}>
                  <Link
                    to={id.startsWith('/') ? id : '#'}
                    onClick={handleNavClick(id, location, navigate)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-white font-semibold font-20">Company</h3>

            <ul className="space-y-2 text-slate-400 font-16">
              {FOOTER_COMPANY.map(({ label, id }) => (
                <li key={label}>
                  <Link to={id} className="hover:text-indigo-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 lg:space-y-4">
            <h3 className="text-white font-semibold font-20">Contact</h3>

            <ul className="space-y-2 text-slate-400 font-16">
              <li>
                <Link to={ROUTES.CONTACT_US} className="hover:text-indigo-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@fracto.com"
                  className="hover:text-indigo-400 transition-colors"
                >
                  support@fracto.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex items-end justify-center mt-6 mb-[-1.98%] sm:mb-[-2.5%] overflow-hidden pointer-events-none select-none">
        <span
          className="opacity-20 font-220 leading-none font-extrabold bg-gradient-to-b from-indigo-200 via-slate-400 to-transparent inline-flex items-baseline bg-clip-text text-transparent whitespace-nowrap"
        >
          FRACTO
        </span>
      </div>
    </footer>
  );
}
