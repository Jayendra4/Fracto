import ComingSoon from '@/components/ComingSoon';
import { motion } from 'framer-motion';

export default function Security() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-34.5 md:pt-35 lg:pt-44 px-10 text-white"
    >
      <ComingSoon />
    </motion.div>
  );
}
