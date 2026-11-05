import { lazy, Suspense } from 'react';

const AnimatedQuoteButton = lazy(
  () => import('@/components/AnimatedQuoteButton')
);
const TextType = lazy(() => import('@/components/TextType'));
import { useOnboarding } from '@/hooks';
import { type JSX } from 'react';

export default function HeroSection(): JSX.Element {
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;
  return (
    <div
      className={`relative w-full bg-gradient-to-br from-[#E0E7FF] via-[#EEF2F6] to-white dark:from-[#080D1A] dark:via-[#0F172A] dark:to-[#0A0E17] min-h-screen mx-auto grid grid-cols-1 lg:grid-cols-4 lg:py-5 xl:py-0 ${
        isUserKycCompleted
          ? ' pt-20 lg:pt-28 xl:pt-42 2xl:pt-52'
          : needsOnboarding
            ? ' pt-60 md:pt-40 lg:pt-56 xl:pt-72 2xl:pt-70'
            : ' pt-20 lg:pt-28 xl:pt-42 2xl:pt-52'
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/home/hero-bg.png)',
          backgroundRepeat: 'repeat',
          opacity: 0.15,
          mixBlendMode: 'overlay',
        }}
      />
      <div className="col-span-2 flex flex-col gap-4 m-auto pl-4 lg:pl-12 xl:pl-12 2xl:pl-20 pt-6 w-full font-work items-start">
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] md:mb-6 md:my-6 font-normal text-slate-800 dark:text-slate-300">
          Welcome to{' '}
          <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Fracto</span>
        </p>

        <h1
          className={`font-extrabold text-[#0B0F19] dark:text-white leading-[100%] font-68 tracking-tight`}
        >
          The Marketplace for <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">Real-World Assets</span>
        </h1>
        <Suspense fallback={null}>
          <TextType
            introText="Making real assets"
            rotatingTexts={['Accessible...', 'Tradable...', 'Liquid...']}
            typingSpeed={140}
            deletingSpeed={60}
            pauseDuration={1200}
          />
        </Suspense>

        <div className="sm:pt-10 md:pt-16 lg:pt-20 xl:pb-10">
          <Suspense fallback={null}>
            <AnimatedQuoteButton title={'Invest Now'} />
          </Suspense>
          {/* <ExploreButton /> */}
        </div>
      </div>

      <div className="relative h-full xl:w-full lg:pb-0 xl:pb-0 md:mb-0 col-span-2 lg:mt-15 xl:mt-14 2xl:mt-13 justify-end">
        <img
          src="/images/home/house-bg.webp"
          alt="Fracto"
          className="h-full w-full lg:w-[120%] lg:origin-bottom-right lg:scale-[1.15] xl:scale-[1.25] mt-5.5 sm:mt-0 transition-all duration-100"
        />
      </div>
    </div>
  );
}
