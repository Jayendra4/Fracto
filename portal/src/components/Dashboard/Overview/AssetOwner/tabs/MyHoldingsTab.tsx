import { type JSX } from 'react';
import { toast } from 'react-toastify';

const holdings = [
  {
    asset: 'Sora Heights, Jaipur',
    spv: 'FRACTO-SPV-014',
    units: '1,500',
    invested: '₹15.0L',
    tags: ['Rental', 'Timeshare', 'Sale'],
    distributions: '₹86,200',
  },
  {
    asset: 'Crescent Business Park',
    spv: 'FRACTO-SPV-021',
    units: '1,250',
    invested: '₹12.5L',
    tags: ['Rental', 'Sale'],
    distributions: '₹1,00,000',
  },
];

export default function MyHoldingsTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          My Holdings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          SPV equity positions, certificates, secondary sale, and exit tracking.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
        <table className="w-full text-left font-12">
          <thead>
            <tr className="text-[var(--fg)]/60 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
              <th className="py-2 pr-4 font-medium">Asset</th>
              <th className="py-2 pr-4 font-medium">SPV</th>
              <th className="py-2 pr-4 font-medium">Units Held</th>
              <th className="py-2 pr-4 font-medium">Invested</th>
              <th className="py-2 pr-4 font-medium">Profit Types</th>
              <th className="py-2 pr-4 font-medium">Distributions to Date</th>
              <th className="py-2 pr-4 font-medium"></th>
              <th className="py-2 pr-4 font-medium">Certificate</th>
              <th className="py-2 pr-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr
                key={h.spv}
                className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
              >
                <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                  {h.asset}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                  {h.spv}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {h.units}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {h.invested}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex gap-1">
                    {h.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#E8EEFC] dark:bg-white/10 text-[#1F4FE0] dark:text-[#60a5fa] text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                  {h.distributions}
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toast.info(`Opening ${h.asset} SPV detail`)}
                    className="text-[#1F4FE0] dark:text-[#60a5fa] font-medium cursor-pointer hover:underline whitespace-nowrap"
                  >
                    View My SPV
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() =>
                      toast.info(`Downloading holding certificate — ${h.spv}`)
                    }
                    className="text-[#1F4FE0] dark:text-[#60a5fa] font-medium cursor-pointer hover:underline"
                  >
                    Download
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() =>
                      toast.info(`Opening Sell / Exit for ${h.asset}`)
                    }
                    className="border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white px-3 py-1.5 rounded-lg font-11 font-bold transition cursor-pointer hover:bg-[#F5F8FF] dark:hover:bg-white/5 whitespace-nowrap"
                  >
                    Sell / Exit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="font-11 text-gray-400 mt-3">
          Profit Types show which of the three mechanisms apply to each asset —
          not every asset carries all three. See Returns Dashboard for a
          breakdown by type.
        </p>
      </div>
    </div>
  );
}
