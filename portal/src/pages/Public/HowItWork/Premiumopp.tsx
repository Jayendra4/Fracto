/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState, type JSX } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { usePreviewProperties } from '@/api';
import Loader from '@/components/Loader';
//  import { FiArrowRight } from 'react-icons/fi';

export default function PremiumOpportunities(): JSX.Element | null {
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
    return image
      ? `${API_BASE_URL}/storage/${image.documentUrl}`
      : '/images/property-placeholder.png';
  };

  const getMetaValue = (meta: any[], key: string) =>
    meta?.find((m) => m.metaKey === key)?.metaValue ?? '';

  const getPricePerFraction = (price: any) =>
    Number(price?.currentPricePerFraction ?? 0);

  const getDynamicRentalYield = (meta: any[]) => {
    const getMetaNumber = (key: string) =>
      Number(meta?.find((m) => m.metaKey === key)?.metaValue ?? 0);

    const marketValue = getMetaNumber('marketValue');
    if (!marketValue) return 0;

    const netOperationalIncome = getMetaNumber('netOperationalIncome');
    if (netOperationalIncome > 0) {
      return Number(((netOperationalIncome / marketValue) * 100).toFixed(2));
    }

    const monthlyRent = getMetaNumber('rentalIncomeMonthly');
    const annualExpenses = getMetaNumber('operationalExpensesAnnual');

    if (monthlyRent > 0) {
      const annualNetRent = monthlyRent * 12 - annualExpenses;
      if (annualNetRent > 0) {
        return Number(((annualNetRent / marketValue) * 100).toFixed(2));
      }
    }

    return Number(
      meta?.find((m) => m.metaKey === 'expectedYieldPercentage')?.metaValue ?? 0
    );
  };

  const getExpectedROI = (meta: any[]) => {
    const yieldPA = getDynamicRentalYield(meta);

    const appreciation = Number(
      meta?.find((m) => m.metaKey === 'expectedAppreciationPercentage')
        ?.metaValue ?? 0
    );

    return Number((yieldPA + appreciation).toFixed(2));
  };

  if (showLoader) {
    return (
      <section className="py-20 flex justify-center bg-[#111113]">
        <Loader />
      </section>
    );
  }

  if (!isOnline || isError) {
    return (
      <section
        id="properties"
        className="w-full bg-gradient-to-b from-dark-blue to-[#111113] py-16 px-4 lg:px-10 text-white text-center"
      >
        <div className="max-w-[800px] mx-auto space-y-3">
          <h3 className="text-2xl font-semibold text-red-400">
            Unable to load properties
          </h3>
          <p className="text-[#9A9A9A]">
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
        className="w-full bg-gradient-to-b from-dark-blue to-[#111113] py-16 px-4 lg:px-10 text-white font-work text-center"
      >
        <div className="max-w-[800px] mx-auto space-y-3">
          <h3 className="text-2xl font-semibold">
            No properties available right now
          </h3>
          <p className="text-[#9A9A9A]">
            Please check back later. New listings are coming soon.
          </p>
        </div>
      </section>
    );
  }
  //    const targetPath = '/properties';

  return (
    <section
      id="properties"
      className="w-full bg-gradient-to-b from-dark-blue to-[#111113] py-10 lg:py-20 px-4 lg:px-10 text-white font-work scroll-mt-10 space-y-6"
    >
      <div className="mx-auto max-w-[1600px] overflow-hidden">
        <motion.div
          className="text-center mb-8 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="font-48 font-semibold">Premium Opportunities</h2>
          <p className="font-24 text-white/80 mt-2">
            Institutionally vetted properties available for Structural
            Investment
          </p>
        </motion.div>

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
            <SwiperSlide key={item.id}>
              <motion.div
                className="bg-[var(--bg)] text-[var(--fg)]  p-4 rounded-xl overflow-hidden shadow-lg border border-gray-700 h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{
                  y: -8,
                  boxShadow: '0px 12px 30px rgba(0,0,0,0.4)',
                  borderColor: '#033e7c',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="rounded-xl overflow-hidden relative group">
                  <motion.img
                    src={getAssetImage(item.documents)}
                    alt={item.assetTitle}
                    className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                <div className="md:pt-5 pt-2 md:space-y-1">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-1 text-[12px] text-blue-400">
                      <img src="/images/home/map-pin.svg" alt="location" />
                      {getMetaValue(item.meta, 'city')}
                    </div>

                    <h3 className="font-24 font-semibold pt-0.5 line-clamp-1">
                      {item.assetTitle}
                    </h3>
                  </div>

                  <div className="w-full mt-2 ">
                    <div
                      className="grid"
                      style={{ gridTemplateColumns: '0.6fr 1.2fr 1fr' }}
                    >
                      <p className="text-[14px] font-light text-center">
                        Yield
                      </p>
                      <p className="text-[14px] font-light text-center">
                        Price of Structural Co-ownership
                      </p>
                      <p className="text-[14px] font-light text-center">ROI</p>
                    </div>

                    <div
                      className="grid mt-1"
                      style={{ gridTemplateColumns: '0.6fr 1.2fr 1fr' }}
                    >
                      <p className="text-[16px] font-medium text-center">
                        {getDynamicRentalYield(item.meta)}%
                      </p>

                      <p className="text-[16px] font-medium  text-center">
                        ₹{' '}
                        {getPricePerFraction(item.price).toLocaleString(
                          'en-IN'
                        )}
                      </p>

                      <p className="text-[16px] font-medium  text-center">
                        {getExpectedROI(item.meta)}%
                      </p>
                    </div>
                  </div>

                  <Link to={`/property-details/${item.id}`}>
                    <button
                      className="w-full bg-gradient-to-b from-[#2A5A8D] to-blue
                       text-white py-3 lg:py-2 mt-2 rounded-sm font-20 cursor-pointer
                       transition-all duration-300 hover:brightness-110"
                    >
                      Get More Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* <div className="flex justify-center pb-3">
         <Link
           to={targetPath}
           className="group inline-flex items-center gap-2 px-4 py-1.5 text-blue-400 font-20 font-medium relative transition-all duration-300 hover:text-blue-300 cursor-pointer"
         >
           <span className="absolute inset-0 border animate-[pulse_2.2s_ease-in-out_infinite]" />
           <span className="relative z-10">See More Properties</span>
           <FiArrowRight
             className="
               relative z-10
               transition-transform duration-300
               group-hover:translate-x-1
               "
           />
         </Link>
       </div> */}
    </section>
  );
}
