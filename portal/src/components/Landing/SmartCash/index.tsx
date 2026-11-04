import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
//import { motion } from "framer-motion";

export default function SmartCash() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: false,
    });

    AOS.refresh();
  }, []);

  return (
    <section className="w-full py-10 lg:py-20 px-4 lg:px-10 flex justify-center font-work bg-[var(--bg)]">
      <div className=" backdrop-blur-md rounded-[40px] p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col-reverse lg:flex-row gap-6 lg:gap-10  lg:bg-white">
        <div className="bg-black p-4 flex justify-center items-center w-full lg:w-[45%] rounded-[40px] ">
          <img
            data-aos="fade-zoom-in"
            data-aos-anchor-placement="bottom-bottom"
            src="/images/home/home-gif.gif"
            alt="Smart Cash House"
            className="object-cover "
          />
        </div>

        <div className="w-full lg:w-[60%] py-4 lg:py-20 flex flex-col justify-center">
          <h2 className="font-54 font-semibold text-black mb-6 leading-tight">
            What is Smart Cash Note?
          </h2>

          <p className="text-inactive-gray font-20 leading-relaxed lg:mb-6 text-justify">
            <span className="font-bold">Smart Cash Notes (SCNs)</span> offer a
            simple, low-risk way for users to earn real-estate–linked returns
            without dealing with property ownership. Instead of buying
            Structural Co-ownership, Investors put money into short-term,
            asset-backed notes secured by rental income or receivables—providing
            stable, predictable returns.
          </p>
        </div>
      </div>
    </section>
  );
}
