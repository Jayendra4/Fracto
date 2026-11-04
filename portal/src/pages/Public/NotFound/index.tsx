import { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TbHomeSearch } from 'react-icons/tb';

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060606] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-35"></div>

      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10 px-6"
      >
        <h1 className="text-8xl font-extrabold tracking-widest bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,150,255,0.6)]">
          404
        </h1>
        <p className="mt-4 text-xl text-gray-300">
          The fraction you're looking for does not exist.
        </p>

        <p className="text-gray-500 mt-2">
          This block might be lost on the chain. Try returning home.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg 
             border border-white/20 bg-white/5 backdrop-blur-sm
             hover:bg-white/10 transition-all duration-300 
             hover:shadow-[0_0_15px_rgba(0,255,200,0.4)] pointer-events-auto"
        >
          <TbHomeSearch size={22} className="text-cyan-300" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
