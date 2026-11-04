import { type JSX } from "react";
import { motion } from 'framer-motion';

export default function Setting(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Setting
    </motion.div>
  );
}
