import { FiUsers, FiCheckCircle, FiPercent } from 'react-icons/fi';
import { BrokerStat } from '.';

export default function PerformanceCard() {
  return (
    <div className="p-6">
      <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-150 dark:border-white/5 pb-2 mb-4">
        Performance Overview
      </h3>

      <div className="grid grid-cols-3 gap-2 md:gap-4 min-w-0">
        <BrokerStat
          icon={FiUsers}
          label="Total Leads"
          value="127"
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <BrokerStat
          icon={FiCheckCircle}
          label="Conversions"
          value="43"
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <BrokerStat
          icon={FiPercent}
          label="Conversion Rate"
          value="33.9%"
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>
    </div>
  );
}
