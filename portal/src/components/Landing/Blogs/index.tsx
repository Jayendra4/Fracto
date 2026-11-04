import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { FiArrowRight } from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const blogs = [
  {
    id: 1,
    image: '/images/home/ourblogs/blog-img1.png',
    date: '19/09/2025',
    time: '4:30 min',
    title:
      'What Is Structural Co-ownership Real Estate Participation and How Does It Work in India?',
    text: 'A beginner-friendly overview of how structured real estate participation works, what SPVs are, and why this model is gaining traction among Indian Investors. If you are new to the concept, this is the right place to start.',
  },
  {
    id: 2,
    image: '/images/home/ourblogs/blog-img2.png',
    date: '02/10/2025',
    time: '5:39 min',
    title: 'How SPV-Based Co-Ownership Works: A Plain-Language Guide ',
    text: 'Break down the mechanics of a Special Purpose Vehicle - what it holds, how rights are defined, and what it means for your participation in practical terms. No legal jargon, just a clear explanation of the structure behind every House of Frac opportunity.',
  },
  {
    id: 3,
    image: '/images/home/ourblogs/blog-img3.png',
    date: '04/04/2026',
    time: '12:30 min',
    title:
      'What to Check Before Participating in a Structural Co-ownership Real Estate Opportunity',
    text: 'A practical checklist of the documents, disclosures, and due diligence steps every Investor should review before making a participation decision. Knowing what to look for is the first step toward participating with confidence.',
  },
  {
    id: 4,
    image: '/images/home/ourblogs/blog-img1.png',
    date: '31/12/2025',
    time: '5:34 min',
    title: 'How House of Frac Verifies Assets Before They Are Listed ',
    text: 'An inside look at the documentation, review, and verification process that an asset goes through before it is made available to Investors on the platform. Understanding this process can help you evaluate listings with greater context.',
  },
  {
    id: 5,
    image: '/images/home/ourblogs/blog-img2.png',
    date: '19/01/2026',
    time: '2:35 min',
    title: 'KYC, AML, and Why They Matter for Structured Real Estate Platforms',
    text: 'Understand why identity verification and anti-money laundering compliance are foundational to a trustworthy structured real estate participation ecosystem. This piece explains what these processes involve and why they protect every participant on the platform.',
  },
  {
    id: 6,
    image: '/images/home/ourblogs/blog-img3.png',
    date: '22/02/2026',
    time: '5:30 min',
    title:
      'What Are the Exit Options in Structured Real Estate Participation? ',
    text: 'A clear explanation of the exit mechanisms typically available to SPV participants, including share transfers, bulletin board resales, and shareholder-voted asset sales. Exit terms are defined before you commit, and this article walks you through what that looks like in practice.',
  },
];

export default function Blogs() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <section className="w-full bg-[var(--bg)] px-4 lg:px-10 py-8 lg:py-16 text-[var(--fg)] font-work">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <motion.div className="flex flex-col justify-center items-center">
          <h2
            className="font-60 font-semibold  "
            data-aos="fade-down"
            data-aos-delay="100"
          >
            Our Blogs
          </h2>

          <p
            className="font-20 font-medium "
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Insights, education, and updates from the House of Frac team —
            helping you participate in real estate with clarity and confidence.
          </p>
        </motion.div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className=""
        >
          {blogs.map((blog) => (
            <SwiperSlide key={blog.id} className="h-auto">
              <div
                className="bg-[#E2E2E2] text-black rounded-tr-3xl  rounded-bl-3xl  overflow-hidden cursor-pointer transition-transform
               hover:-translate-y-1 hover:shadow-sm duration-300  h-full flex flex-col"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-[240px] object-cover "
                  loading="lazy"
                />

                <div className="p-3 lg:p-5 flex-1 flex flex-col">
                  <div className="flex gap-2">
                    <p className="font-12 text-inactive-gray ">{blog.date}</p>
                    <p className="font-12 text-inactive-gray ">{blog.time}</p>
                  </div>

                  <div className="flex flex-1 gap-4">
                    {/* Text block */}
                    <div className="flex flex-col gap-4 flex-1">
                      <h3 className="font-20 font-semibold line-clamp-1">
                        {blog.title}
                      </h3>

                      <p className="text-[#070708] font-14 line-clamp-3">
                        {blog.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex justify-center pt-8">
          <button className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer">
            <span className="relative z-10">See More Blogs</span>
            <FiArrowRight
              className="
              relative z-10
              transition-transform duration-300
              group-hover:translate-x-1
              "
            />
          </button>
        </div>
      </div>
    </section>
  );
}
