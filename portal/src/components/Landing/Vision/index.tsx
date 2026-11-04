import { type JSX } from 'react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Vision(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <section className="font-work px-5 lg:px-10 bg-gradient-to-b from-[#0b1520] to-[#111113]">
      <div className="max-w-[1530px] h-full mx-auto flex flex-col justify-center items-center gap-12 pb-12">
        <div className="flex flex-col gap-1 max-w-[400px] mb-8 justify-center items-center">
          <img
            src="/images/home/vision.svg"
            className="w-[75%] md:w-[100%] mt-25"
          />

          <img
            src="/images/heading-bottom.png"
            alt=""
            className="w-[90%] md:w-full"
          />
        </div>
        <p
          data-aos="fade-up"
          data-aos-anchor-placement="bottom-bottom"
          className="text-[44px] md:text-[65px] text-[#ffffff] text-center leading-[100%] "
        >
          <span>We Aim To Build</span>{' '}
          <span className="font-semibold">
            The World’s First Simple, Accessible, & Liquid Real Estate
            Marketplace —{' '}
          </span>
          <span>
            Empowering Individuals Worldwide To Invest, Trade, And Grow Wealth
            Across Borders.
          </span>
        </p>
        <p
          data-aos="zoom-in"
          className="font-light font-22 text-white leading-snug text-center"
        >
          We aim to build the world’s first simple, accessible, and liquid real
          estate marketplace — empowering individuals worldwide to invest,
          trade, and grow wealth across borders. We envision a transparent,
          trusted global platform where every Investor can own Structural
          Co-ownership of the world’s most valuable real estate assets.
        </p>
      </div>
    </section>
  );
}
