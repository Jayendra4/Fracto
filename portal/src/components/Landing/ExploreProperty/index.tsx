import AnimatedQuoteButton from '@/components/AnimatedQuoteButton';
import { type JSX } from 'react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ExploreProperty(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);
  return (
    <section
      className="relative w-full bg-black text-white font-work overflow-hidden px-4 lg:px-10 py-10 lg:py-20 "
      style={{
        background: 'url("/images/home/explore-pro-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className=" text-center font-work">
        <h2
          data-aos="fade-in"
          className="font-new-64 font-800 leading-[100%] max-w-[1600px] mx-auto"
        >
          Turn your property into a liquid, investable <br /> asset with our
          end-to-end infrastructure.
        </h2>
        <div className="pt-10 sm:pt-12 md:pt-16 lg:pt-20 flex items-center justify-center">
          <AnimatedQuoteButton title={'Explore Properties'} />
        </div>
      </div>
    </section>
  );
}
