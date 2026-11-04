import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
// import { IoIosClose, IoChevronBack, IoChevronForward } from 'react-icons/io';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { IoIosClose } from 'react-icons/io';

type Slide = {
  documentUrl: string;
};

type GalleryModalProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  allSlides: Slide[];
  startIndex?: number;
};

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  setIsOpen,
  allSlides,
  startIndex = 0,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(startIndex);

  const openSlide = (index: number) => {
    setActiveIndex(index);
    swiperRef.current?.slideToLoop(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="absolute top-4 sm:top-7 left-4 sm:left-7 right-4 sm:right-7 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-base sm:text-lg font-medium text-white">
            {activeIndex + 1} / {allSlides.length}
          </span>
          <div className="hidden sm:block w-px h-6 bg-white/20" />
          <span className="hidden sm:block text-sm text-white/60">Photo</span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
        >
          <IoIosClose size={32} />
        </button>
      </div>

      {/* Swiper */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
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
              swiper.slideToLoop(startIndex);
            }, 0);
          }}
          onSlideChange={(swiper) => {
            const realIndex = swiper.realIndex;
            setActiveIndex(realIndex);
            swiper.autoplay.start();
          }}
          className="relative w-[92vw] max-w-7xl h-[75vh]"
        >
          {allSlides.map((item, i) => (
            <SwiperSlide key={i}>
              <img
                src={item.documentUrl}
                alt={`slide-${i}`}
                className="mx-auto h-full w-full object-contain rounded-lg"
              />
            </SwiperSlide>
          ))}

          {/* Navigation */}
          <button className="gallery-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <IoChevronBack size={24} />
          </button>

          <button className="gallery-next absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <IoChevronForward size={24} />
          </button>
        </Swiper>
      </div>

      {/* Thumbnails */}
      <div className="w-full px-6 pb-6 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {allSlides.map((item, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                openSlide(i);
              }}
              className={`relative h-16 w-24 min-w-[96px] rounded overflow-hidden cursor-pointer transition ${
                activeIndex === i
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={item.documentUrl}
                alt={`thumb-${i}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
