import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const easeInOut = [0.4, 0, 0.2, 1] as const;
const easeOut = [0.0, 0.0, 0.2, 1] as const;
const easeBackOut = [0.34, 1.56, 0.64, 1] as const;

const centerImage: Variants = {
  hidden: { opacity: 0, y: 80, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: easeOut },
  },
  idle: {
    opacity: [0.95, 1, 0.95],
    scale: [1, 1.02, 1],
    transition: { duration: 8, repeat: Infinity, ease: easeInOut },
  },
};

const cornerCard = (x: number, y: number, rotate: number): Variants => ({
  hidden: { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    x,
    y,
    rotate,
    scale: 1,
    transition: { delay: 0.6, duration: 0.8, ease: easeOut },
  },
  idle: {
    opacity: [0.92, 1, 0.92],
    scale: [1, 1.015, 1],
    transition: {
      duration: 6 + Math.random() * 2,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
});

const pointerRing: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 1.4, duration: 0.5, ease: easeBackOut },
  },
  idle: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.08, 1],
    transition: { duration: 10, repeat: Infinity, ease: easeInOut },
  },
};

export default function AuthPageAnime() {
  return (
    <div className="h-full relative flex justify-center items-center origin-center">
      <motion.img
        src="/images/auth/login-img.png"
        alt="Login"
        className="max-w-[214px]   h-auto z-10 "
        variants={centerImage}
        initial="hidden"
        animate={['visible']}
      />

      <motion.div
        className="absolute top-0 left-0 -translate-y-[90%] lg:-translate-y-[110%] translate-x-[100%] lg:translate-x-[40%]  "
        variants={cornerCard(-180, -30, 15)}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-white rounded-md shadow-lg p-1 flex items-center gap-0 lg:gap-3 ">
          <div className="rounded-full overflow-hidden shrink-0">
            <img
              src="/images/auth/avatar.svg"
              alt="Owner"
              className=" object-fit"
            />
          </div>

          <div className=" w-full">
            <p className="text-10 lg:text-sm font-semibold text-black">
              0.8% of Structural Co-ownership
            </p>
            <p className="text-[7px] lg:text-xs text-black/60">
              owns by Mr. Priyank
            </p>
          </div>

          <div className="absolute right-2 -bottom-2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-0 right-0 -translate-y-[60%] lg:-translate-y-[80%] xl:-translate-y-[60%] -translate-x-[100%] lg:-translate-x-[20%] "
        variants={cornerCard(180, -60, -15)}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-white rounded-md shadow-lg p-2 flex items-center gap-0 xl:gap-1 lg:gap-3 max-w-[250px]">
          <div className="w-10 lg:w-16 rounded-full overflow-hidden shrink-0">
            <img
              src="/images/auth/avatar.svg"
              alt="Owner"
              className=" object-fit"
            />
          </div>

          <div className="leading-tight">
            <p className="text-10 lg:text-sm font-semibold text-black">
              5% of Structural Co-ownership
            </p>
            <p className="text-[7px] lg:text-xs text-black/60">
              Owned by Mr. Rahul
            </p>
          </div>

          <div className="absolute left-5 -bottom-2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[16px] border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 lg:translate-y-[60%] translate-x-[70%] translate-y-[100%] lg:-translate-x-[4%] z-25"
        variants={cornerCard(-160, 30, -11)}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-white rounded-md shadow-xl p-1.5 lg:p-4">
          <p className="text-10 lg:text-[14px] leading-snug font-medium">
            <span className="font-bold text-[#F03F23] text-12 lg:text-18">
              Hurry Up!
            </span>{' '}
            <span className="text-black">
              Structural Co-ownership of <br className="lg:hidden" /> this property{' '}
            </span>
            <span className="font-semibold text-[#2DBE60]">
              Selling Fast...
            </span>
          </p>

          <div className="absolute -top-3 right-3">
            <div
              className="w-0 h-0 
                    border-l-[10px] border-r-[10px] border-b-[12px]
                    border-l-transparent border-r-transparent border-b-white"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-[60%] lg:right-0 lg:top-40 translate-y-[110%] lg:translate-y-[60%] p-2 z-25 lg:max-w-[220px]"
        variants={cornerCard(150, -30, 25)}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-md shadow-xl p-2">
          <p className="text-[14px] font-semibold text-[#33BD56] whitespace-nowrap">
            ₹1500 /{' '}
            <span className="text-black text-[7px] lg:text-[10px]  font-normal">
              Structural Co-ownership
            </span>
          </p>

          <div className="my-2 h-[1px] w-full bg-black/10" />

          <p className="text-[14px] font-semibold text-[#33BD56]">95.32%</p>
          <p className="text-[7px] lg:text-[12px] text-black/70 -mt-1">
            Total Structural Co-ownership sold
          </p>

          <div className="my-2 h-[1px] w-full bg-black/10" />

          <p className="text-[14px] font-semibold text-[#33BD56]">12%</p>
          <p className="text-[7px] lg:text-[12px] text-black/70 -mt-1">
            Return of Investment
          </p>
        </div>
      </motion.div>

      <motion.img
        src="/images/auth/left-arw.svg"
        className="absolute left-0 lg:-top-8 -bottom-6 rotate-90 lg:rotate-0  -translate-x-full w-16 lg:w-20 z-20"
        variants={pointerRing}
        initial="hidden"
        animate={['visible', 'idle']}
      />

      <motion.img
        src="/images/auth/right-arw.svg"
        className="absolute right-10 lg:right-0 -bottom-20 lg:bottom-0 -translate-y-18 translate-x-25 lg:translate-x-[100%] w-16 lg:w-20 z-20"
        variants={pointerRing}
        initial="hidden"
        animate={['visible', 'idle']}
      />
    </div>
  );
}
