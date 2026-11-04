import { type JSX } from 'react';

const kpis = [
  {
    label: 'Rental Distribution Yield',
    value: '6.2%',
    sub: 'Sora Heights & Crescent Business Park',
  },
  { label: 'Timeshare Income Yield', value: '3.9%', sub: 'Sora Heights only' },
  {
    label: 'Post-Launch Sale Profit',
    value: '₹0',
    sub: 'None realized yet — Crescent exit in progress',
  },
  {
    label: 'Indicative Portfolio IRR',
    value: '11.4%',
    sub: 'Since inception, all mechanisms blended',
  },
  {
    label: 'Unrealised Gain',
    value: '+7.0%',
    sub: 'vs. invested capital',
    up: true,
  },
];

const quarters = [
  { label: 'Q2 FY26', value: '41.7K', pct: 70 },
  { label: 'Q3 FY26', value: '44.2K', pct: 74 },
  { label: 'Q4 FY26', value: '1.00L', pct: 100 },
  { label: 'Q1 FY27', value: '42.0K', pct: 71 },
];

const performanceByAsset = [
  {
    asset: 'Sora Heights, Jaipur',
    spv: 'HOF-SPV-014',
    invested: '₹15.0L',
    current: '₹16.1L',
    yield: '6.7%',
    distributions: '₹86,200',
  },
  {
    asset: 'Crescent Business Park',
    spv: 'HOF-SPV-021',
    invested: '₹12.5L',
    current: '₹13.4L',
    yield: '7.1%',
    distributions: '₹1,00,000',
  },
  {
    asset: 'Marina Bay Residency',
    spv: 'HOF-SPV-027',
    invested: '₹11.0L',
    current: '₹11.7L',
    yield: 'Pending allotment',
    distributions: '—',
  },
];

export default function ReturnsDashboardTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Returns Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Portfolio-level performance across all your SPV holdings. Past
          performance is indicative only and not a guarantee of future returns.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm"
          >
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
              {kpi.label}
            </p>
            <p className="font-serif font-20 text-[#0B2545] dark:text-white">
              {kpi.value}
            </p>
            <p
              className={`font-11 mt-1 ${kpi.up ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
            >
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-4">
          Distributions by Quarter (₹)
        </h3>
        <div className="flex items-end gap-4 h-40 px-1">
          {quarters.map((q) => (
            <div
              key={q.label}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="font-11 font-semibold text-[#0B2545] dark:text-white mb-1">
                {q.value}
              </span>
              <div
                className="w-full max-w-9 bg-[#1F4FE0] rounded-t"
                style={{ height: `${q.pct}%` }}
              />
              <span className="font-10 text-gray-400 mt-1.5">{q.label}</span>
            </div>
          ))}
        </div>
        <div className="font-11 text-gray-400 bg-[#FAFAFA] dark:bg-white/5 border border-dashed border-[#E3E7EE] dark:border-white/10 px-3 py-2.5 rounded-lg mt-4">
          Historical distributions shown for reference only. Future
          distributions are not guaranteed and may vary or be suspended.
        </div>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-4">
          Performance by Asset
        </h3>
        <table className="w-full text-left font-12">
          <thead>
            <tr className="text-[var(--fg)]/60 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
              <th className="py-2 pr-4 font-medium">Asset</th>
              <th className="py-2 pr-4 font-medium">SPV</th>
              <th className="py-2 pr-4 font-medium">Invested</th>
              <th className="py-2 pr-4 font-medium">Current Value</th>
              <th className="py-2 pr-4 font-medium">Net Yield</th>
              <th className="py-2 pr-4 font-medium">Distributions to Date</th>
            </tr>
          </thead>
          <tbody>
            {performanceByAsset.map((row) => (
              <tr
                key={row.asset}
                className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
              >
                <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                  {row.asset}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                  {row.spv}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {row.invested}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {row.current}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {row.yield}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {row.distributions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="font-11 text-gray-400 bg-[#FAFAFA] dark:bg-white/5 border border-dashed border-[#E3E7EE] dark:border-white/10 px-3 py-2.5 rounded-lg mt-4">
          Indicative current value and yield figures only. House of Frac does
          not guarantee, assure, or promise any fixed return, rental yield,
          capital appreciation, exit value, or repayment of capital.
        </div>
      </div>
    </div>
  );
}
