import { useRef, useEffect, useState } from 'react';

export default function StickyScrollClean() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [stickyState, setStickyState] = useState<'fixed' | 'absolute'>('fixed');

  const [translateY, setTranslateY] = useState<string>('-50%');

  useEffect(() => {
    const handleScroll = () => {
      const ref = containerRef.current;
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const scrolledInside = -rect.top;
      const sectionHeight = rect.height;
      const maxScroll = sectionHeight - viewportHeight;

      if (scrolledInside <= 0) {
        setStickyState('absolute');
        setTranslateY('0');
      } else if (scrolledInside >= maxScroll) {
        setStickyState('absolute');
        setTranslateY(`${maxScroll}px`);
      } else {
        setStickyState('fixed');
        setTranslateY('-50%');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="flex h-[300vh] bg-black text-white">
      {/* LEFT sticky area */}
      <div
        className="w-full md:w-2/5 flex items-center justify-center"
        style={{
          position: stickyState,
          top: stickyState === 'fixed' ? '50%' : 0,
          transform: `translateY(${translateY})`,
        }}
      >
        <h1 className="text-5xl font-bold">Sticky Area</h1>
      </div>

      {/* RIGHT scroll content */}
      <div className="w-full md:w-3/5 ml-auto px-6 py-24 space-y-[50vh]">
        <section className="h-screen flex items-center text-4xl">
          Main Prizes
        </section>
        <section className="h-screen flex items-center text-4xl">
          Special Prizes
        </section>
        <section className="h-screen flex items-center text-4xl">
          Track Prizes
        </section>
      </div>
    </div>
  );
}
