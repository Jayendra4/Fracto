import { useGroups } from '@/api/group.api';
import GroupCard from '../CommunityOfHouse/Cards';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Community() {
  const { data, isLoading } = useGroups();

  const groupsData = data?.data.slice(0, 3) || [];

  return (
    <div className="bg-[#03111F] min-h-screen py-12 md:py-16 px-4 md:px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-white text-3xl md:text-4xl font-semibold mb-3 font-work"
      >
        Fracto Community
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-gray-400 mb-12 font-work text-lg md:text-xl max-w-3xl mx-auto px-4"
      >
        Join exclusive primary clubs to connect with asset owners, exchange
        market insights, and stay updated on curated real estate opportunities
        across India.
      </motion.p>

      {groupsData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
            No Primary Club Found
          </h2>
          <p className="text-gray-500 mt-2">
            Currently there are no primary club available. Please check back
            later.
          </p>
        </div>
      ) : (
        // ✅ Groups Grid
        // <div className="flex justify-center">
        //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        //     {groupsData.map((g) => (
        //       <GroupCard key={g.id} {...g} isLoading={isLoading} />
        //     ))}
        //   </div>
        // </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-[1300px] mx-auto">
          {groupsData.map((g, index) => (
            <div key={index} className="w-full md:w-[48%] lg:w-[31%]">
              <GroupCard key={g.id} {...g} isLoading={isLoading} />
            </div>
          ))}
        </div>
      )}

      {groupsData?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.5 }}
          className="mt-12"
        >
          <Link
            to="/primary-club"
            className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
          >
            See More Primary Clubs
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
