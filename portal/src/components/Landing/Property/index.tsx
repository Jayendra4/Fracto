/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState, type JSX } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { usePreviewProperties } from '@/api';
import PropertyCardSkeleton from '@/components/Skeleton/PropertyCardSkeleton';
import { FiArrowRight } from 'react-icons/fi';
import PropertyImage from '@/components/Property/PropertyImage';

export default function Property(): JSX.Element | null {
  const [showLoader, setShowLoader] = useState(false);
  const { data, isLoading, isFetching, isError } = usePreviewProperties({
    soldout: false,
    newlyAdded: false,
    available: true,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const properties =
    data?.success && Array.isArray(data?.data?.data) ? data.data.data : [];
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: true,
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isLoading || isFetching) {
      timer = setTimeout(() => setShowLoader(true), 500);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isFetching]);

  const getAssetImage = (documents: any[]) => {
    const image = documents?.find((d) => d.documentType === 'ASSET_IMAGE');
    if (!image) return '/images/property-placeholder.png';

    const rawUrl = image.url ?? image.documentUrl;
    if (!rawUrl) return '/images/property-placeholder.png';

    // If it's already an absolute URL, return it as is
    if (rawUrl.startsWith('http')) return rawUrl;

    return `${API_BASE_URL}/storage/${rawUrl}`;
  };

  const getMetaValue = (meta: any[], key: string) =>
    meta?.find((m) => m.metaKey === key)?.metaValue ?? '';

  if (showLoader) {
    return (
      <section
        id="properties"
        className="w-full bg-[var(--bg)] py-10 lg:py-20 px-4 lg:px-10 space-y-6"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="text-center mb-4">
            <h2 className="font-44 font-semibold text-[var(--fg)]">
              Our Property
            </h2>
            <p className="pt-3 pb-5 text-[var(--fg)]/60 font-22 text-center">
              Fetching premium opportunities...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isOnline || isError) {
    return (
      <section
        id="properties"
        className="w-full bg-[var(--bg)] py-16 px-4 lg:px-10 text-center"
      >
        <div className="max-w-[800px] mx-auto space-y-3">
          <h3 className="text-2xl font-semibold text-red-400">
            Unable to load properties
          </h3>
          <p className="text-[var(--fg)]/70">
            We’re having trouble connecting right now. Please check your
            internet or try again in a moment.
          </p>
        </div>
      </section>
    );
  }

  if (!isLoading && !isFetching && data?.success && properties.length === 0) {
    return (
      <section
        id="properties"
        className="w-full bg-[var(--bg)] py-16 px-4 lg:px-10 font-work text-center text-[var(--fg)]"
      >
        <div className="max-w-[800px] mx-auto space-y-3">
          <h3 className="text-2xl font-semibold">
            No properties available right now
          </h3>
          <p className="text-[var(--fg)]/70">
            Please check back later. New listings are coming soon.
          </p>
        </div>
      </section>
    );
  }
  const targetPath = '/primary-club';

  return (
    <section
      id="properties"
      className="w-full bg-[var(--bg)] transition-colors duration-300 py-10 lg:py-20 px-4 lg:px-10 text-[var(--fg)] font-work scroll-mt-10 space-y-6 overflow-x-hidden"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-4" data-aos="fade-down">
          <h2 className="font-44 font-semibold">Our Property</h2>

          <p
            className="pt-3 pb-5 text-[var(--fg)]/80 font-22 text-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Experience thoughtfully selected properties that combine strong{' '}
            <br />
            fundamentals, modern design, and investment potential.
          </p>
        </div>

        <Swiper
          modules={[Pagination]}
          grabCursor
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1536: { slidesPerView: 4 },
          }}
          className="property-swiper"
        >
          {properties.map((item: any) => (
            <SwiperSlide key={item.id} className="h-auto">
              <div className="bg-[var(--card)] text-[var(--fg)] p-4 rounded-2xl overflow-hidden shadow-sm border border-dark-grey/20 hover:-translate-y-1 hover:shadow-lg hover:border-dark-grey/40 transition-all duration-300 group h-full flex flex-col">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden shrink-0">
                  <PropertyImage
                    src={getAssetImage(item.documents)}
                    alt={item.assetTitle}
                    imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="md:pt-5 pt-4 md:space-y-1 flex-1 flex flex-col">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-dark-grey font-medium tracking-wide">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {getMetaValue(item.meta, 'city')}
                    </div>

                    <h3 className="font-24 font-semibold pt-0.5 line-clamp-1">
                      {item.assetTitle}
                    </h3>
                  </div>

                  <div className="w-full mt-auto mb-5 bg-[var(--inner-card)] border border-dark-grey/20 rounded-xl p-3">
                    <div
                      className="grid text-dark-grey font-12"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                    >
                      <p className="text-center">Yield</p>
                      <p className="text-center font-medium border-l border-r border-dark-grey/20">
                        Price Frame
                      </p>
                      <p className="text-center">ROI</p>
                    </div>

                    <div
                      className="grid mt-1 text-[var(--fg)]"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                    >
                      <p className="font-18 font-semibold text-center mt-1 text-green-600 dark:text-green-400">
                        {item.financials?.yield?.actualYieldPercent}%
                      </p>

                      <p className="font-16 font-semibold text-center mt-1 border-l border-r border-dark-grey/20 px-1">
                        ₹{' '}
                        {Number(
                          item.financials?.perFraction?.price ?? 0
                        ).toLocaleString('en-IN')}
                      </p>

                      <p className="font-18 font-semibold text-center mt-1 text-yellow-600 dark:text-yellow-400">
                        {item.financials?.roi?.fiveYearROI}%
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/property-details/${item.id}`}
                    className="block w-full"
                  >
                    <button
                      className="
                        relative w-full font-semibold font-16
                        px-6 py-3 lg:py-2.5 rounded-xl text-white shadow-md cursor-pointer
                        transition-all duration-300 ease-in-out hover:shadow-lg hover:brightness-110 active:scale-[0.98] bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] 
                      "
                    >
                      Get More Details
                    </button>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="flex justify-center pb-3 pt-6">
        <Link
          to={targetPath}
          className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
        >
          See More Properties
          <FiArrowRight
            className="
              transition-transform duration-300
              group-hover:translate-x-2
              "
          />
        </Link>
      </div>
    </section>
  );
}
