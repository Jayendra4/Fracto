import React from 'react';
import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

interface NoDataProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({
  title,
  description,
  icon = <FiInbox size={32} />,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-16 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 shadow-sm mb-6 ${className}`}
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-[#0B2545] dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 font-medium">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
};

export default NoData;
