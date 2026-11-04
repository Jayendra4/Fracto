import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: 'Discover',
    copy: 'Explore a global selection of verified real estate assets, pre-screened for performance and compliance, with complete due diligence.',
    icon: '/images/home/lens.svg',
  },
  {
    title: 'Invest',
    copy: 'Own Structural Co-ownership of premium properties with ease and flexibility, starting from accessible entry amounts.',
    icon: '/images/home/money.svg',
  },
  {
    title: 'Earn & Trade',
    copy: 'Generate passive income, benefit from appreciation, and unlock liquidity by trading your ownership shares whenever you choose.',
    icon: '/images/home/flow.svg',
  },
  {
    title: 'Track',
    copy: 'Monitor your portfolio through an intuitive dashboard with real-time updates, performance insights, and transparent reporting.',
    icon: '/images/home/map.svg',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<SVGTextElement | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setRef =
    (arrRef: React.MutableRefObject<any[]>, index: number) => (el: any) => {
      arrRef.current[index] = el;
    };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const len = (
          titleRef.current as SVGTextContentElement
        ).getComputedTextLength();
        titleRef.current.style.strokeDasharray = `${len}`;
        titleRef.current.style.strokeDashoffset = `${len}`;

        gsap.to(titleRef.current, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        });
      }
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          },
        }
      );

      iconRefs.current.forEach((iconEl) => {
        if (!iconEl) return;
        iconEl.addEventListener('mouseenter', () => {
          gsap.to(iconEl, {
            scale: 1.07,
            rotate: 3,
            duration: 0.28,
            ease: 'power2.out',
          });
          const tile = iconEl.closest('.icon-tile') as HTMLElement | null;
          if (tile) {
            gsap.to(tile, {
              boxShadow: '0 10px 30px rgba(24,50,70,0.45)',
              duration: 0.28,
              ease: 'power2.out',
            });
          }
        });
        iconEl.addEventListener('mouseleave', () => {
          gsap.to(iconEl, {
            scale: 1,
            rotate: 0,
            duration: 0.28,
            ease: 'power2.out',
          });
          const tile = iconEl.closest('.icon-tile') as HTMLElement | null;
          if (tile) {
            gsap.to(tile, {
              boxShadow: '0 6px 22px rgba(0,0,0,0.35)',
              duration: 0.28,
              ease: 'power2.out',
            });
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="howItWorks"
      ref={containerRef}
      aria-label="How it works"
      className="relative w-full overflow-hidden py-10 lg:py-20 px-5 lg:px-10 font-work scroll-mt-10"
      style={{
        backgroundImage: `url('/images/.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0  pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 mt-0">
        <div className="w-full flex justify-center items-center flex-col mb-5 ">
          <img
            src="/images/home/hiw.svg"
            alt="hiw"
            className="w-[100%] md:w-[70%]"
          />
          <img
            src="/images/home/bar.png"
            alt="bar"
            className="w-[100%] md:w-[70%]"
          />
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-8 items-start">
            {steps.map((s, idx) => (
              <div
                key={s.title}
                ref={setRef(cardRefs, idx)}
                className={`
                  relative px-6 lg:px-8 opacity-0
                  ${idx === 0 ? 'lg:pt-12' : ''}
                  ${idx === 1 ? 'lg:pt-24' : ''}
                  ${idx === 2 ? 'lg:pt-36' : ''}
                  ${idx === 3 ? 'lg:pt-48' : ''}
                `}
              >
                <div
                  data-aos="fade-up"
                  className="absolute left-1 -translate-x-1/2 pointer-events-none top-0 h-[200px] sm:h-[320px] md:h-[420px] lg:h-[500px] xl:h-[600px] flex flex-col items-center"
                >
                  <div className="w-[2px] flex-1 bg-gradient-to-b from-transparent via-[#d1a139] to-transparent opacity-60" />
                  <div
                    className={`
                    absolute
                    ${idx === 0 ? 'top-[50px] lg:top-[86px]' : ''}
                    ${idx === 1 ? ' top-[45px] lg:top-[135px]' : ''}
                    ${idx === 2 ? ' top-[50px] lg:top-[190px]' : ''}
                    ${idx === 3 ? 'top-[50px] lg:top-[235px]' : ''}
                    -translate-y-1/2
                    h-3 w-3 rounded-full bg-[#d1a139]
                    shadow-[0_0_12px_4px_rgba(209,161,57,0.5)]
                  `}
                  />
                </div>
                <div
                  data-aos="zoom-in-down"
                  className="mb-6 inline-flex items-center justify-center p-3  rounded-xl icon-tile bg-[linear-gradient(153.33deg,#132436_0%,#37689C_134.4%)]"
                >
                  <div
                    ref={setRef(iconRefs, idx)}
                    className="h-[60px] w-[60px] rounded-lg flex items-center justify-center "
                  >
                    <img src={s.icon} />
                  </div>
                </div>

                <h3 className="text-white font-40 font-semibold mb-2">
                  {s.title}
                </h3>
                <p
                  data-aos="fade-up"
                  className="text-dark-grey text-[16px]  max-w-[320px]"
                >
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
