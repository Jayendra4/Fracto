import type { JSX } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaStar } from 'react-icons/fa';

interface Testimonial {
  name: string;
  text: string;
  src: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sachin Sharma',
    text: 'House of FRAC made SM REIT investing simple and transparent. I finally feel confident investing in commercial real estate.',
    src: 'images/home/user-img.png',
  },
  {
    name: 'Atul Sahu',
    text: 'The asset-backed structure and clear reporting gave me real peace of mind. This is how structural investment investing should be done.',
    src: 'images/home/user-img2.png',
  },
  {
    name: 'Ashutosh Bhadoriya',
    text: 'From onboarding to payouts, everything is seamless. House of FRAC truly feels Investor-first.',
    src: 'images/home/user-img3.png',
  },
  {
    name: 'Sarahh Williams',
    text: 'I liked the strong compliance and trustee validation—felt safe and professionally managed throughout.',
    src: 'images/home/user-img4.png',
  },
  {
    name: 'Apeksha Pateriya',
    text: 'Great platform for diversifying into commercial real estate without complexity. Clear, secure, and well-structured.',
    src: 'images/home/user-img5.png',
  },
  {
    name: 'Jayesh Soni',
    text: 'House of FRAC combines technology with trust. It’s a smart way to participate in SM REITs in India.',
    src: 'images/home/user-img6.png',
  },
];

export default function TestimonialsSection(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }, []);
  return (
    <section className="w-full bg-[var(--bg)] overflow-x-hidden">
      <div
        style={{
          backgroundImage:
            'url(/images/home/testimonials/testimonials-bg.webp)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'center',
        }}
      >
        <div className="max-w-[1600px] mx-auto py-16 px-4 lg:px-10 ">
          <div className="flex flex-col justify-center items-center">
            <h2
              className="font-44 font-semibold text-[var(--fg)]"
              data-aos="fade-down"
              data-aos-delay="200"
            >
              What our users says
            </h2>
            <p
              className="max-w-[720px] font-20 font-meduim text-[var(--fg)] mt-3 text-center"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              Hear from Investor, asset owners, and channel partners who have
              experienced the House of Frac platform.
            </p>
          </div>

          <div className="mt-8 lg:mt-16 relative  testimonials-swiper">
            <Swiper
              modules={[Pagination, Autoplay, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="property-swiper testimonials-swiper pb-16"
            >
              {testimonials.map((item, index) => (
                <SwiperSlide key={index}>
                  {() => (
                    <div
                      className={`flex flex-col justify-between w-full h-[260px] lg:h-[280px] rounded-xl bg-[#E2E2E2] p-4 lg:p-6 text-left transition-all duration-300 
                    shadow-md`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className="text-[#F4C430] text-sm"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-[#272727] text-left leading-relaxed">
                          {item.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-auto">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-[40px] h-[40px] rounded-full object-cover"
                          loading="lazy"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
