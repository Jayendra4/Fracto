import { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { IoIosClose } from 'react-icons/io';
import {
  IoChevronBack,
  IoChevronForward,
  IoImagesOutline,
  IoVideocamOutline,
} from 'react-icons/io5';
import type { Swiper as SwiperType } from 'swiper';

interface AssetDocument {
  documentType: string;
  documentUrl: string;
}

interface ImageGalleryProps {
  documents?: AssetDocument[];
}

export default function ImageGallery({ documents }: ImageGalleryProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [activeIndex, setActiveIndex] = useState(0);

  const { images, videos } = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    if (!Array.isArray(documents)) {
      return { images: [], videos: [] };
    }

    // const images = documents
    //   .filter((d) => d.documentType === 'ASSET_IMAGE')
    //   .map((d) => `${d.documentUrl}`);

    const images = documents
      .filter((d) => d.documentType === 'ASSET_IMAGE')
      .map((d) => {
        const url = d.documentUrl || '';

        return url.startsWith('http') ? url : `${API_BASE_URL}/storage/${url}`;
      });

    const videos = documents
      .filter((d) => d.documentType === 'ASSET_VIDEO')
      .map((d) => `${API_BASE_URL}/storage/${d.documentUrl}`);

    return { images, videos };
  }, [documents]);

  const slides = useMemo(() => {
    if (activeTab === 'images') {
      return images.map((src) => ({ type: 'image', src }));
    }

    return videos.map((src) => ({ type: 'video', src }));
  }, [activeTab, images, videos]);

  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const openModal = (index: number) => {
    if (!slides[index]) return;

    // ✅ अगर modal open है → सीधे slide change
    if (isOpen && swiperRef.current) {
      swiperRef.current.slideTo(index);
      setActiveIndex(index);
      return;
    }

    // ✅ modal open
    setStartIndex(index);
    setActiveIndex(index);
    setIsOpen(true);

    // ✅ swiper mount होने के बाद slide set
    setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(index);
      }
    }, 100);
  };
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !swiperRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!swiperRef.current) return;

      if (e.key === 'ArrowRight') {
        swiperRef.current.slideNext();
      }

      if (e.key === 'ArrowLeft') {
        swiperRef.current.slidePrev();
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!images.length) return null;

  const count = images.length;

  return (
    <>
      <div className="relative max-w-[1600px] mx-auto py-5">
        <div
          className={`grid gap-2 sm:gap-3 lg:gap-4 ${
            count === 1
              ? 'grid-cols-1'
              : count === 2
                ? 'grid-cols-2'
                : 'grid-cols-2 lg:grid-cols-4'
          }`}
        >
          <div
            className={`cursor-pointer overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 ${
              count === 1
                ? 'h-[240px] sm:h-[320px] lg:h-[420px]'
                : count === 2
                  ? 'h-[220px] sm:h-[300px] lg:h-[420px]'
                  : 'col-span-2 row-span-2 h-[240px] sm:h-[320px] lg:h-[420px]'
            }`}
            onClick={() => openModal(0)}
          >
            <img
              src={images[0]}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover rounded-2xl hover:brightness-105 transition-all duration-300"
            />
          </div>

          {count >= 2 && (
            <div
              className={`cursor-pointer overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 ${
                count === 2
                  ? 'h-[220px] sm:h-[300px] lg:h-[420px]'
                  : 'h-[116px] sm:h-[154px] lg:h-[202px]'
              }`}
              onClick={() => openModal(1)}
            >
              <img
                src={images[1]}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover rounded-2xl hover:brightness-105 transition-all duration-300"
              />
            </div>
          )}

          {count >= 3 && (
            <div
              className="cursor-pointer overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 h-[116px] sm:h-[154px] lg:h-[202px]"
              onClick={() => openModal(2)}
            >
              <img
                src={images[2]}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover rounded-2xl hover:brightness-105 transition-all duration-300"
              />
            </div>
          )}

          {count >= 4 && (
            <div
              className="cursor-pointer overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 h-[116px] sm:h-[154px] lg:h-[202px]"
              onClick={() => openModal(3)}
            >
              <img
                src={images[3]}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover rounded-2xl hover:brightness-105 transition-all duration-300"
              />
            </div>
          )}

          {count >= 5 && (
            <div
              className="relative cursor-pointer overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 h-[116px] sm:h-[154px] lg:h-[202px]"
              onClick={() => openModal(4)}
            >
              <img
                src={images[4]}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover rounded-2xl hover:brightness-105 transition-all duration-300"
              />
              {count > 5 && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/55">
                  <span className="font-14 sm:font-16 lg:font-18 font-semibold text-white">
                    +{count - 5} Photos
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {isOpen && (
          <div className="fixed mb-5 inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
            {/* 🔝 Header */}
            <div className="absolute top-4 sm:top-7 left-4 sm:left-7 right-4 sm:right-7 z-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-base sm:text-lg font-medium text-white">
                  {activeIndex + 1} / {slides.length}
                </span>
                <div className="hidden sm:block w-px h-6 bg-white/20" />
                <span className="hidden sm:block text-sm text-white/60">
                  {slides[activeIndex]?.type === 'video' ? 'Video' : 'Photo'}
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full
        bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
              >
                <IoIosClose size={32} />
              </button>
            </div>

            {/* 🔥 Swiper */}
            <div className="flex-1 flex items-center justify-center pt-16 pb-4">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                initialSlide={0}
                loop
                slidesPerView={1}
                navigation={{
                  prevEl: '.gallery-prev',
                  nextEl: '.gallery-next',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 10000,
                  disableOnInteraction: false,
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;

                  setTimeout(() => {
                    swiper.slideTo(startIndex);
                  }, 0);
                }}
                onSlideChange={(swiper) => {
                  const realIndex = swiper.realIndex;
                  setActiveIndex(realIndex);

                  const currentSlide = slides[realIndex];
                  if (currentSlide?.type === 'video') {
                    swiper.autoplay.stop();
                  } else {
                    swiper.autoplay.start();
                  }
                }}
                className="relative w-[92vw] max-w-7xl h-[75vh]"
              >
                {slides.map((item, i) => (
                  <SwiperSlide key={i}>
                    {item.type === 'image' ? (
                      <img
                        src={item.src}
                        className="mx-auto h-full w-full object-contain rounded-lg"
                      />
                    ) : (
                      <video
                        src={item.src}
                        className="mx-auto h-full w-full object-contain rounded-lg"
                        autoPlay
                        muted
                        loop
                        controls
                      />
                    )}
                  </SwiperSlide>
                ))}

                {/* 🔙 Prev */}
                <button className="gallery-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <IoChevronBack size={24} />
                </button>

                {/* 🔜 Next */}
                <button className="gallery-next absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <IoChevronForward size={24} />
                </button>
              </Swiper>
            </div>

            {/* 🔻 Thumbnails */}
            <div className="w-full px-6 pb-6 overflow-x-auto modal-scroll-2">
              <div className="flex gap-2 w-max mx-auto">
                {slides.map((item, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(i);
                    }}
                    className={`relative h-16 w-24 min-w-[96px] rounded overflow-hidden cursor-pointer transition ${
                      activeIndex === i
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.src}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <video
                          src={item.src}
                          className="h-full w-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-white text-lg">▶</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2
    lg:left-auto lg:right-6 lg:translate-x-0
    z-20 flex overflow-hidden rounded-full
    border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] shadow-md whitespace-nowrap"
        >
          <button
            className={`flex items-center gap-2 px-4 py-1.5 lg:px-5.5 lg:py-2.5 font-medium font-20 transition border-r border-[#E3E7EE] dark:border-white/10 ${
              activeTab === 'images'
                ? 'text-[#0B2545] dark:text-white bg-[#F5F8FF] dark:bg-white/10 shadow-inner'
                : 'text-gray-500 dark:text-gray-400 hover:bg-[#F5F8FF] dark:hover:bg-white/5'
            }`}
            onClick={() => {
              setActiveTab('images');
              openModal(0);
            }}
          >
            <IoImagesOutline /> {images.length} Photos
          </button>

          <button
            disabled={videos.length == 0}
            className={`flex items-center gap-2 px-4 py-1.5 lg:px-5.5 lg:py-2.5 font-medium font-20 transition ${
              activeTab === 'videos'
                ? 'text-[#0B2545] dark:text-white bg-[#F5F8FF] dark:bg-white/10 shadow-inner'
                : 'text-gray-500 dark:text-gray-400 hover:bg-[#F5F8FF] dark:hover:bg-white/5'
            }`}
            onClick={() => {
              setActiveTab('videos');
              openModal(0);
            }}
          >
            <IoVideocamOutline /> {videos.length} Videos
          </button>
        </div>
      </div>
    </>
  );
}
