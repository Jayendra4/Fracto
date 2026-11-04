import { FaArrowRightLong } from 'react-icons/fa6';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export default function Map() {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const routePath = isAuthenticated ? '/dashboard' : '/signup';

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: false,
    });

    AOS.refresh();
  }, []);

  return (
    <section
      className="w-container bg-[#0F1620]  pt-10 lg:pt-20 px-4 lg:px-10 font-work flex justify-center items-center flex-col"
      style={{
        background: 'url(/images/home/faq-bg.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-[1600px] flex flex-col items-center">
        <div className="mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-6">
          <div className="flex justify-center lg:justify-start w-full lg:w-auto">
            <img
              src="/images/home/girl-img.png"
              alt="Investor"
              className="w-28 h-28 sm:w-32 sm:h-32 lg:h-50 lg:w-50 rounded-full object-cover border-4 border-[#1A2736]"
            />
          </div>

          <div className="flex flex-col text-center lg:text-left space-y-4 max-w-[1000px]">
            <p className="text-green font-light text-[16px] md:text-[20px] lg:text-[22px] flex flex-wrap justify-center lg:justify-start gap-2">
              <span>Hassle-free Process</span>
              <span className="hidden md:inline">•</span>
              <span>Start in minutes</span>
              <span className="hidden md:inline">•</span>
              <span>Cancel anytime</span>
            </p>

            <h2 className="text-white text-[24px] sm:text-[30px] md:text-[34px] lg:text-[40px] xl:text-[48px] font-semibold leading-[120%] 2xl:whitespace-nowrap">
              Ready to Start Your Investment Journey?
            </h2>

            <p className="text-gray-300 text-[14px] md:text-[16px] 2xl:whitespace-nowrap">
              Join thousands of Investors already building wealth through
              Structural real estate. Start with as little as $100 today.
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                to={routePath}
                className="bg-gradient-to-r from-[#2A5A8D] to-blue cursor-pointer text-white px-5 py-4 rounded-lg font-semibold text-[18px] md:text-[22px] xl:text-[24px] leading-[120%] shadow-md transition flex items-center"
              >
                Create Free Account
                <span className="pl-2">
                  <FaArrowRightLong />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full pt-10 md:pt-24 flex justify-center items-center">
          <img
            data-aos="zoom-in-down"
            src="/images/home/map-full.png"
            alt="House Of Frac"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
