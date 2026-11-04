import { useOnboarding } from '@/hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { RoleCard } from './RoleCard';
import { ROUTES } from '@/constants';
import { useEffect } from 'react';

export default function Hero() {
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      const cb =
        typeof requestIdleCallback !== 'undefined'
          ? requestIdleCallback
          : setTimeout;
      cb(() => video?.play());
      // requestIdleCallback(() => video.play());
    }
  }, []);
  return (
    <section
      className={`relative w-full font-work ${
        isUserKycCompleted
          ? ' pt-20 lg:pt-20 xl:pt-42 2xl:pt-52'
          : needsOnboarding
            ? ' pt-60 md:pt-40 lg:pt-50'
            : ' pt-20 lg:pt-20 xl:pt-42 2xl:pt-52'
      }`}
    >
      <video
        className="absolute inset-0 -z-10 w-full h-full object-cover"
        // autoPlay
        loop
        muted
        playsInline
        poster="/images/home/home-bg.webp"
        preload="metadata"
      >
        <track
          src="/captions.vtt"
          kind="captions"
          srcLang="en"
          label="English captions"
          default
        />
        <source
          src="https://staging-api.houseoffrac.com/storage/hof.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 -z-10  bg-black/20" />

      <div className="relative max-w-[1600px] mx-auto px-4 py-20 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-5xl">
          OWN REAL ESTATE. <br className=" sm:block" />
          IN STRUCTURAL CO-OWNERSHIP
        </h1>

        <p className="mt-5 max-w-4xl font-24 text-white">
          Discover structured, professionally vetted real estate participation
          opportunities — accessible, transparent, and backed by clear legal
          documentation.
        </p>

        <div className="mt-10 w-full max-w-5xl">
          <div className="block sm:hidden">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={8}
              slidesPerView={1.1}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop
              className="pb-10"
            >
              <SwiperSlide>
                <RoleCard
                  title="Investor"
                  description="Participation opportunities with professional asset presentation, documentation, and defined risk disclosures."
                  url="/corporate-investor"
                />
              </SwiperSlide>

              <SwiperSlide>
                <RoleCard
                  title="Asset Owner"
                  description="Structure your property and present it to a verified Investor network. Access capital without selling outright."
                  url="/asset-owner"
                />
              </SwiperSlide>

              <SwiperSlide>
                <RoleCard
                  title="Channel Partner"
                  description="Collaborate with House of Frac as a broker, wealth advisor, or consultant. Connect Investors with quality assets."
                  url={ROUTES.BROKER}
                />
              </SwiperSlide>
            </Swiper>
          </div>

          <div className="hidden sm:grid grid-cols-3 gap-4 lg:gap-6">
            <RoleCard
              title="Investor"
              description="Participation opportunities with professional asset presentation, documentation, and defined risk disclosures."
              url="/corporate-investor"
            />
            <RoleCard
              title="Asset Owner"
              description="Structure your property and present it to a verified Investor network. Access capital without selling outright."
              url="/asset-owner"
            />
            <RoleCard
              title="Channel Partner"
              description="Collaborate with House of Frac as a broker, wealth advisor, or consultant. Connect Investors with quality assets."
              url={ROUTES.BROKER}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
