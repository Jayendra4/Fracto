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
    <footer className="w-full font-work bg-[#03111F] px-4 lg:px-10 pt-5 md:pt-10 ">
      <div className="max-w-[1600px] w-full mx-auto  flex flex-col xl:flex-row  justify-between">
        <div className="space-y-2  max-w-[514px]  ">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/images/svgLogo.svg"
                className="lg:w-[200px] shrink-0 xl:w-[280px] sm:w-[200px] w-[160px]"
                alt="Logo"
              />
            </Link>
          </div>

          <p className="text-dark-grey  font-normal font-24 my-3 max-w-[500px] ">
            Structured real estate participation — accessible, transparent, and
            documented.
          </p>
          <div>
            <ul>
              <li className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 lg:grid-cols-6 xl:grid-cols-6 space-y-2 py-4">
                <Link
                  to="/"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full border border-[#C5C5C5] text-black
    hover:bg-black  hover:text-white transition"
                  aria-label="Open Twitter"
                >
                  <FaXTwitter size={20} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full border border-[#C5C5C5] text-black
    hover:bg-black  hover:text-white transition"
                  aria-label="Open instagram"
                >
                  <FaInstagram size={20} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full border border-[#C5C5C5] text-black
    hover:bg-black  hover:text-white transition"
                  aria-label="Open Youtube"
                >
                  <FaYoutube size={20} />
                </Link>

                <Link
                  to="/"
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full border border-[#C5C5C5] text-black
    hover:bg-black  hover:text-white transition"
                  aria-label="Open Facebook"
                >
                  <FaFacebookF size={20} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-8">
          <div className="space-y-3 lg:space-y-4 ">
            <h3 className=" text-white font-medium font-22">Platform</h3>

            <ul className="space-y-2 text-dark-grey font-work font-20">
              {FOOTER_PLATFORM.map(({ label, id }) => (
                <li key={id}>
                  <Link
                    to={id.startsWith('/') ? id : '#'}
                    onClick={handleNavClick(id, location, navigate)}
                    className="hover:text-gray-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <h3 className=" text-white font-medium font-22">Company</h3>

            <ul className="space-y-2 text-dark-grey font-20 ">
              {FOOTER_COMPANY.map(({ label, id }) => (
                <li key={label}>
                  <Link to={id} className="hover:text-gray-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 lg:space-y-4 ">
            <h3 className=" text-white font-medium font-22">Contact</h3>

            <ul className="space-y-2 text-dark-grey  font-20">
              <li>
                <Link to={ROUTES.CONTACT_US} className="hover:text-gray-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@houseoffrac.com"
                  className="hover:text-gray-400"
                >
                  support@houseoffrac.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex items-end justify-center mt-4 mb-[-1.98%] sm:mb-[-2.5%] overflow-hidden">
        <span
          className="opacity-30 font-220 leading-none font-semibold bg-gradient-to-b from-[#E8DEC4] via-[#E6E1D580] to-[#E6E1D580]  inline-flex items-baseline
  bg-clip-text text-transparent whitespace-nowrap"
        >
          HOUSE OF FRAC
        </span>
      </div>
    </footer>
  );
}
