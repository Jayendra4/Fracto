import { useLayoutEffect, useRef, type JSX } from 'react';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Mission(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  const fullText =
    'Our mission is to democratize real estate by offering fractional ownership of trusted, curated assets — creating liquidity, transparency, and opportunity for all. We make owning real estate as seamless as any modern financial investment, removing traditional barriers in a market long defined by high capital requirements and illiquidity.';

  const missionEndIndex = 11;
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (startAnimation && currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);

      return () => clearTimeout(timeout);
    }
  }, [startAnimation, currentIndex, fullText]);

  const renderAnimatedText = () => {
    if (displayedText.length > missionEndIndex) {
      return (
        <>
          <span className="text-[#0B0B0B]">
            {displayedText.substring(0, missionEndIndex)}
          </span>
          <span>{displayedText.substring(missionEndIndex)}</span>
        </>
      );
    }
    return <span className="text-[#0B0B0B]">{displayedText}</span>;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const pieces = gsap.utils.toArray<HTMLImageElement>('.piece');

      pieces.forEach((el: any) => {
        const direction = el.dataset.dir;

        let x = 0;
        let y = 0;

        switch (direction) {
          case 'left':
            x = -150;
            break;
          case 'right':
            x = 150;
            break;
          case 'top':
            y = -150;
            break;
          case 'bottom':
            y = 150;
            break;
          case 'top-left':
            x = -150;
            y = -150;
            break;
          case 'top-right':
            x = 150;
            y = -150;
            break;
          case 'bottom-left':
            x = -150;
            y = 150;
            break;
          case 'bottom-right':
            x = 150;
            y = 150;
            break;
        }

        gsap.set(el, {
          opacity: 0,
          x,
          y,
          scale: 0.9,
        });
      });

      gsap.to('.piece', {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.3,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full flex justify-center pt-10 md:pt-20 px-6 font-work">
      <div className="max-w-[1600px] w-full h-[20%] md:h-full">
        <div className="relative bg-gradient-to-r from-yellow-100 via-white to-sky-100 rounded-2xl px-8 pt-3 shadow-2xl overflow-visible ">
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 mt-8">
            <div className="w-full pr-6">
              <div className="flex flex-col gap-1 max-w-[650px] min-w-[200px]">
                <img src="/images/home/om-text.svg" />
              </div>
            </div>

            <div className="w-full text-sm relative">
              <p
                className="text-lg md:text-xl font-normal leading-[160%] text-[text-[#6b6b6b] transition-opacity duration-300 text-gray-700"
                style={{
                  opacity: startAnimation
                    ? Math.max(0, 1 - (currentIndex / fullText.length) * 1.5)
                    : 1,
                }}
              >
                Our mission is to democratize real estate by offering structural investment
                ownership of trusted, curated assets — creating liquidity,
                transparency, and opportunity for all. We make owning real
                estate as seamless as any modern financial investment, removing
                traditional barriers in a market long defined by high capital
                requirements and illiquidity.
              </p>

              <p className="text-lg md:text-xl font-normal leading-[160%] text-black absolute top-0 left-0">
                {renderAnimatedText()}
                {startAnimation && currentIndex < fullText.length && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-25 overflow-hidden">
            <div className=" relative mx-auto" style={{ maxWidth: 1300 }}>
              <div className="rounded-xl p-1 md:p-4 ">
                <div
                  className="w-full flex justify-center items-center "
                  style={{ aspectRatio: '16 / 14' }}
                >
                  <div
                    ref={containerRef}
                    className="grid grid-rows-3 grid-cols-12 h-full "
                    style={{ gridTemplateRows: '38% 33% 29%' }}
                  >
                    <div className="col-span-4 row-span-1 lg:ml-30">
                      <img
                        src="/images/mission/home-top-1.png"
                        className="piece h-full"
                        data-dir="top-left"
                      />
                    </div>

                    <div className="col-span-4 row-span-1 ">
                      <img
                        src="/images/mission/home-top-2.png"
                        className="piece h-full"
                        data-dir="top"
                      />
                    </div>

                    <div className="col-span-4 row-span-1 ">
                      <img
                        src="/images/mission/home-top-3.png"
                        className="piece h-full"
                        data-dir="top-right"
                      />
                    </div>

                    <div className="col-span-6 row-span-1 ">
                      <img
                        src="/images/mission/home-mid-1.png"
                        className="piece "
                        data-dir="left"
                      />
                    </div>

                    <div className="col-span-6 row-span-1 ">
                      <img
                        src="/images/mission/home-mid-2.png"
                        className="piece "
                        data-dir="right"
                      />
                    </div>

                    <div className="col-span-3 row-span-1 ">
                      <img
                        src="/images/mission/home-bot-1.png"
                        className="piece w-full h-[109%]"
                        data-dir="bottom-left"
                      />
                    </div>

                    <div className="col-span-3 row-span-1 ">
                      <img
                        src="/images/mission/home-bot-2.png"
                        className="piece "
                        data-dir="bottom"
                      />
                    </div>

                    <div className="col-span-3 row-span-1 ">
                      <img
                        src="/images/mission/home-bot-3.png"
                        className="piece "
                        data-dir="bottom"
                      />
                    </div>

                    <div className="col-span-3 row-span-1 ">
                      <img
                        src="/images/mission/home-bot-4.png"
                        className="piece  "
                        data-dir="bottom-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
