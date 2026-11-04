import { type JSX } from 'react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function HouseOfFrac(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);
  return (
    <section className="relative w-full text-white overflow-hidden px-4 lg:px-10 py-10 lg:py-20 font-work">
      <div
        className="absolute inset-0 bg-obtain opacity-20"
        style={{ backgroundImage: 'url("/images/home/bubble-bg.svg")' }}
      />
      <div className="max-w-[1600px] mx-auto pt-0 lg:pt-10 h-full flex flex-col justify-center items-center min-h-screen overflow-hidden">
        <div className=" w-full">
          <div className="flex items-center justify-center mb-15 ">
            <img
              src="/images/home/hof-font.svg"
              alt="hof-text"
              className="w-[100%]  md:w-[80%] md:h-[100%] lg:w-[70%]"
            />
          </div>
        </div>
        <div className="text-center">
          <p
            data-aos="fade-down"
            data-aos-easing="linear"
            data-aos-duration="1500"
            className="font-semibold font-54 color-white text-white leading-[100%] max-w-7xl  text-center"
          >
            Turns Real Estate Into Accessible, Tradable, Income-Generating
            Opportunities — Available To Anyone With A Tap!
          </p>
          <p
            data-aos="fade-up"
            className="font-light mt-12 mb-12 font-24 text-white leading-snug text-center"
          >
            We make property investment simple, accessible, and liquid,
            empowering everyone to own and grow like never before.
          </p>
        </div>

        <div className="relative w-full sm:w-[80%] md:w-[70%] h-[200px] sm:h-[200px] md:h-[300px] flex items-center justify-center mb-8 sm:mb-12 md:mb-15">
          {/* Center Vertical Line */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 
        w-[2px] h-[100%] bg-gradient-to-b from-[#f8c256] via-yellow to-[#f8c256] opacity-80"
          ></div>

          {/* Top Horizontal Line */}
          <div
            className="absolute top-0 left-0 right-0 
        h-[2px] bg-gradient-to-r from-transparent via-yellow to-transparent opacity-80"
          ></div>

          {/* Bottom Horizontal Line */}
          <div
            className="absolute bottom-0 left-1/4 right-0 
        h-[2px] w-[60%] sm:w-[55%] md:w-[50%] bg-gradient-to-r from-transparent via-yellow to-transparent opacity-80"
          ></div>
          <div
            className="absolute left-1/2 top-[70px] sm:top-[90px] md:top-[100px] -translate-x-1/2 
        w-[15px] sm:w-[18px] md:w-[20px] h-[30px] sm:h-[35px] md:h-[40px] rounded-full blur-xl bg-[#f8c256]/10"
          ></div>

          <p
            data-aos="zoom-in"
            className="absolute top-[210px] sm:top-[260px] md:top-[300px] 
        text-[20px] sm:text-[28px] md:text-[40px]  lg:text-[64px] font-semibold text-white my-3 md:my-5 "
          >
            Invest Small
          </p>
        </div>

        <div className="relative w-full h-[240px] sm:h-[330px] md:h-[390px] mt-12 lg:mt-18">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 
        w-[2px] h-[100px] sm:h-[130px] md:h-[150px] 
        bg-gradient-to-b from-[#f8c256] via-yellow to-[#f8c256] opacity-90"
          ></div>

          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 
        w-[80px] sm:w-[100px] md:w-[120px] h-[2px]
        bg-gradient-to-r from-transparent via-yellow to-transparent"
          ></div>

          <div
            className="absolute top-[100px] sm:top-[130px] md:top-[150px] left-1/2 -translate-x-1/2 
        w-[28px] sm:w-[34px] md:w-[40px] h-[28px] sm:h-[34px] md:h-[40px]
        rounded-full bg-[#f8c256]/20 blur-2xl"
          ></div>

          <div className="absolute top-[100px] sm:top-[130px] md:top-[150px] right-1/2 h-[2px] w-[25vw] sm:w-[330px] md:w-[290px] bg-gradient-to-l from-[#f8c256] to-[#e8b04d]"></div>
          <div className="absolute top-[100px] sm:top-[130px] md:top-[150px] right-[calc(50%+25vw)] sm:right-[calc(50%+330px)] md:right-[calc(50%+290px)] w-[2px] h-[18vw] sm:h-[149px] md:h-[170px] bg-gradient-to-b from-[#e8b04d] to-[#f8c256] group/line">
            <div
              className="
      absolute
      bottom-0
      left-1/2
      -translate-x-1/2
      w-[60px] sm:w-[100px] md:w-[120px] h-[2px]
      bg-gradient-to-r from-transparent via-yellow to-transparent
    "
            />
          </div>

          <p
            data-aos="zoom-in"
            className="absolute top-[180px] sm:top-[270px] md:top-[325px] md:left-[5%] lg:left-[10%]
        text-[20px] sm:text-[28px] md:text-[40px]  lg:text-[64px]  font-semibold text-white my-2 sm:mb-8 md:my-4"
          >
            Diversify Instantly
          </p>
        </div>

        <div className="relative w-full h-[140px] sm:h-[170px] md:h-[180px] mb-10 sm:mb-16 md:mb-20 lg:mb-35 mt-0 md:mt-8 lg:mt-17">
          <div
            className="absolute top-0 left-[30%] -translate-x-1/2
        w-[80px] sm:w-[100px] md:w-[120px] h-[2px]
        bg-gradient-to-r from-transparent via-[#f8c256] to-transparent opacity-90"
          ></div>

          <div
            className="absolute top-0 left-[30%] -translate-x-1/2
        w-[2px] h-[50px] sm:h-[60px] md:h-[70px]
        bg-gradient-to-b from-[#f8c256] to-[#e4b24f] opacity-90"
          ></div>

          <div
            className="absolute top-[50px] sm:top-[60px] md:top-[70px] left-[29.9%]
        w-[40%] sm:w-[50%] md:w-[35%] h-[2px]
        bg-gradient-to-r from-[#f8c256] to-[#e4b24f] opacity-90"
          ></div>

          <div
            className="absolute top-[50px] sm:top-[60px] md:top-[70px]
        left-[calc(25%+45%)] sm:left-[calc(25%+50%)] md:left-[calc(9.9%+55%)]
        w-[2px] h-[35px] sm:h-[45px] md:h-[50px]
        bg-gradient-to-b from-[#e4b24f] to-[#f8c256] opacity-90"
          ></div>

          <div
            className="absolute top-[85px] sm:top-[110px] md:top-[120px]
        left-[calc(25%+45%)] sm:left-[calc(25%+50%)] md:left-[calc(9.9%+55%)]
        -translate-x-1/2 w-[80px] sm:w-[100px] md:w-[120px] h-[2px] 
        bg-gradient-to-r from-transparent via-[#f8c256] to-transparent opacity-90"
          ></div>

          <p
            data-aos="zoom-in"
            className="absolute top-[95px] sm:top-[115px] md:top-[125px] right-[10%] lg:right-[15%] 
        text-[22px] sm:text-[30px] md:text-[40px] lg:text-[64px] 
        font-semibold text-white my-4"
          >
            Withdraw Anytime
          </p>
        </div>
      </div>
    </section>
  );
}
